"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setRole } from "@/lib/role";

const buyerSchema = z.object({
  companyName: z.string().min(1, "Required"),
  industryType: z.string().min(1, "Required"),
  address: z.string().optional(),
});

const sellerSchema = z.object({
  firmName: z.string().min(1, "Required"),
  website: z.string().url().optional(),
});

type Role = "buyer" | "seller";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [role, setRoleState] = React.useState<Role | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [isPending, session, router]);

const buyerForm = useForm<z.infer<typeof buyerSchema>>({
    resolver: zodResolver(buyerSchema),
    defaultValues: restoreDraft("buyer", {
      companyName: "",
      industryType: "",
      address: "",
    }),
  });

const sellerForm = useForm<z.infer<typeof sellerSchema>>({
    resolver: zodResolver(sellerSchema),
    defaultValues: restoreDraft("seller", {
      firmName: "",
      website: "",
    }),
  });

  const onSubmitBuyer = async (values: z.infer<typeof buyerSchema>) => {
    persistDraft("buyer", values);
    const res = await fetch("/api/onboard/buyer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      clearDraft("buyer");
      try { setRole("buyer"); } catch {}
      router.push("/buyer-dashboard");
    }
  };

  const onSubmitSeller = async (values: z.infer<typeof sellerSchema>) => {
    persistDraft("seller", values);
    const res = await fetch("/api/onboard/seller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      clearDraft("seller");
      try { setRole("seller"); } catch {}
      router.push("/seller-dashboard");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 space-y-4">
      <Stepper step={role ? 3 : 2} />
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-xl font-semibold">Tell us who you are</div>
            <div className="text-sm text-muted-foreground">Choose your role to continue onboarding.</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RoleCard label="Buyer" active={role === "buyer"} onClick={() => setRoleState("buyer")} />
            <RoleCard label="Seller" active={role === "seller"} onClick={() => setRoleState("seller")} />
          </div>
        </CardContent>
      </Card>

      {role === "buyer" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-base font-semibold">Buyer Details</div>
            <Form {...buyerForm}>
              <form onSubmit={buyerForm.handleSubmit(onSubmitBuyer)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={buyerForm.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
<FormField control={buyerForm.control} name="industryType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={buyerForm.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address (free text or JSON)</FormLabel>
<FormControl><Input placeholder='e.g. London, UK or {"city":"London"}' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => persistDraft("buyer", buyerForm.getValues())}>Save Draft</Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

{role === "seller" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-base font-semibold">Seller Details</div>
            <Form {...sellerForm}>
              <form onSubmit={sellerForm.handleSubmit(onSubmitSeller)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={sellerForm.control} name="firmName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm/Organization Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={sellerForm.control} name="website" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => persistDraft("seller", sellerForm.getValues())}>Save Draft</Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RoleCard({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-md border p-4 text-left hover:shadow transition ${active ? "border-emerald-500 bg-emerald-50" : ""}`}>
      <div className="text-base font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{label === "Buyer" ? "For companies purchasing credits" : "For project developers listing credits"}</div>
    </button>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Signup", "Role", "Details", "Dashboard"];
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`px-2 py-1 rounded border ${i < step ? "bg-emerald-50 border-emerald-300" : ""}`}>{s}</div>
          {i < steps.length - 1 && <div className="w-4 h-px bg-border" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function persistDraft<T>(key: "buyer" | "seller", data: T) {
  try { localStorage.setItem(`onboarding_draft_${key}`, JSON.stringify(data)); } catch {}
}
function restoreDraft<T>(key: "buyer" | "seller", fallback: T): T {
  try { const v = localStorage.getItem(`onboarding_draft_${key}`); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function clearDraft(key: "buyer" | "seller") {
  try { localStorage.removeItem(`onboarding_draft_${key}`); } catch {}
}
