"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import AddProjectDialog from "./add-project-dialog";

type Project = {
  id: string;
  name: string;
  type: string;
  vintageYear?: number | null;
  registry?: string | null;
  description?: string | null;
};

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = (await res.json()) as { projects?: Project[] };
    setItems(data.projects ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="text-base font-semibold">Projects</div>
          <div className="flex gap-2">
            <Input placeholder="Search projects" className="h-9" />
            <Select>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verra">Verra</SelectItem>
                <SelectItem value="vcs">VCS</SelectItem>
                <SelectItem value="gs">Gold Standard</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-9" onClick={() => setOpenAdd(true)}>
              Add Project
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vintage</TableHead>
              <TableHead>Registry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  No projects yet
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.vintageYear ?? "—"}</TableCell>
                  <TableCell>{p.registry ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                        Details
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Unlist</span>
                        <Switch />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-muted-foreground">
                  Type: {selected.type} • Vintage: {selected.vintageYear ?? "—"} • Registry:{" "}
                  {selected.registry ?? "—"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Description</div>
                <p className="text-muted-foreground">{selected.description ?? "—"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddProjectDialog open={openAdd} onClose={() => setOpenAdd(false)} onCreated={load} />
    </Card>
  );
}
