"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type NewProjectPayload = {
  name: string;
  type: string;
  location?: string;
  registry?: string;
  vintageYear?: number;
  description?: string;
};

export default function AddProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [registry, setRegistry] = useState("");
  const [vintage, setVintage] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [pending, setPending] = useState(false);

  const resetForm = () => {
    setName("");
    setType(undefined);
    setLocation("");
    setRegistry("");
    setVintage("");
    setDesc("");
  };

  const submit = async () => {
    if (!name || !type) return; // safety guard, button is already disabled

    setPending(true);

    const body: NewProjectPayload = {
      name,
      type,
      location: location || undefined,
      registry: registry || undefined,
      vintageYear: vintage ? Number(vintage) : undefined,
      description: desc || undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setPending(false);

    if (res.ok) {
      onCreated?.();
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg">Add Project</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium">Project Name</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arunachal Forest Restoration"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Type</div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reforestation">Reforestation</SelectItem>
                  <SelectItem value="renewable_energy">Renewable Energy</SelectItem>
                  <SelectItem value="waste_management">Waste Management</SelectItem>
                  <SelectItem value="methane_capture">Methane Capture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Vintage Year</div>
              <Input
                inputMode="numeric"
                value={vintage}
                onChange={(e) => setVintage(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Location</div>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. India"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Registry</div>
              <Input
                value={registry}
                onChange={(e) => setRegistry(e.target.value)}
                placeholder="e.g. Verra, VCS"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium">Description</div>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={pending || !name || !type} onClick={submit}>
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
