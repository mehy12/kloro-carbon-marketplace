"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React, { useState } from "react";
import { setRole } from "@/lib/role";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { OctagonAlertIcon } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

type UserRole = "buyer" | "seller";

interface SessionUser {
  role?: UserRole;
}

interface SessionData {
  user?: SessionUser;
}

interface SessionResult {
  data?: SessionData | null;
}

export default function SignInView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Get the current origin to build proper callback URLs
  const getCallbackURL = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path; // fallback for SSR
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: getCallbackURL("/"),
      },
      {
        onSuccess: async () => {
          setPending(false);
          // Fetch session to get role reliably
          const s = await authClient.getSession();
          const session = s as SessionResult | null | undefined;

          const userRole: UserRole =
            (session?.data?.user?.role as UserRole | undefined) ?? "buyer";

          try {
            setRole(userRole);
          } catch {
            // ignore storage errors
          }

          const to = userRole === "seller" ? "/seller-dashboard" : "/buyer-dashboard";
          router.push(to);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: "google" | "github") => {
    setError(null);
    setPending(true);
    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: getCallbackURL("/"),
      },
      {
        onSuccess: async () => {
          setPending(false);
          // Check if user has completed onboarding
          const sessionRaw = await authClient.getSession();
          const session = sessionRaw as SessionResult | null | undefined;

          const userRole = session?.data?.user?.role as UserRole | undefined;

          if (!userRole || userRole === "buyer") {
            // If no role is set or default buyer role, redirect to role selection
            router.push("/onboarding/role");
          } else {
            // User has a role, redirect to appropriate dashboard
            const to = userRole === "seller" ? "/seller-dashboard" : "/buyer-dashboard";
            try {
              setRole(userRole);
            } catch {
              // ignore storage errors
            }
            router.push(to);
          }
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@eample.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="!text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button disabled={pending} type="submit">
                  Sign in
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    onClick={() => {
                      onSocial("google");
                    }}
                    variant={"default"}
                    type="button"
                    className="w-full "
                  >
                    <FaGoogle />
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account{" "}
                  <Link
                    href={"/sign-up"}
                    className="text-blue-400  font-semibold underline-offset-1"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="bg-radial from-fuchsia-200 via-indigo-200 to-blue-200 relative hidden md:flex flex-col gap-y-6 items-center justify-center">
            <Image src="/kloro.png" alt="kloro. logo" height={92} width={92} />
            <p className="text-2xl font-semibold text-white">kloro.</p>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-xs text-center text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of service</a>{" "}
        and <a href="#">Privacy policy</a>
      </div>
    </div>
  );
}
