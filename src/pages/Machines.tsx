import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Machine {
  id: string;
  areaCode: string;
  headCode: string;
  size: string;
}

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({ areaCode: "", headCode: "", size: "" });
  const token = localStorage.getItem("auth_token"); // if auth required

  /* ---------------- FETCH MACHINES ---------------- */
  const fetchMachines = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/setup/machines-list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (data.status) {
        const normalized = data.data.map((m: any) => ({
          id: m.id.toString(),
          areaCode: m.area_code,
          headCode: m.head_code,
          size: m.size,
        }));
        setMachines(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch machines:", err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleOpenDialog = (machine?: Machine) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({ areaCode: machine.areaCode, headCode: machine.headCode, size: machine.size });
    } else {
      setEditingMachine(null);
      setFormData({ areaCode: "", headCode: "", size: "" });
    }
    setDialogOpen(true);
  };

  /* ---------------- SAVE / CREATE MACHINE ---------------- */
  const handleSave = async () => {
    if (formData.areaCode && formData.headCode && formData.size) {
      if (editingMachine) {
        // Local update for now
        setMachines(
          machines.map((m) =>
            m.id === editingMachine.id ? { ...m, ...formData } : m
          )
        );
      } else {
        try {
          // Call API to create new machine
          const res = await fetch(`${import.meta.env.VITE_API_URL}/setup/machine-store`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              area_code: formData.areaCode,
              head_code: formData.headCode,
              size: formData.size,
            }),
          });
          const data = await res.json();
          if (data.status) {
            // Add newly created machine to state
            setMachines([...machines, {
              id: data.data.id.toString(),
              areaCode: data.data.area_code,
              headCode: data.data.head_code,
              size: data.data.size,
            }]);
          } else {
            console.error("Failed to create machine:", data.message);
          }
        } catch (err) {
          console.error("Error creating machine:", err);
        }
      }

      setDialogOpen(false);
      setFormData({ areaCode: "", headCode: "", size: "" });
      setEditingMachine(null);
    }
  };

  const handleDelete = (id: string) => {
    setMachines(machines.filter((m) => m.id !== id));
  };

  const getSizeVariant = (size: string) => {
    switch (size.toLowerCase()) {
      case "large":
        return "default";
      case "medium":
        return "secondary";
      case "small":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Machines</h1>
        <p className="text-muted-foreground mt-1">Manage machine configurations and specifications</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cog className="w-5 h-5" />
            Machine Registry
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Machine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMachine ? "Edit Machine" : "Add New Machine"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Area Code</Label>
                  <Input
                    placeholder="e.g., A-101"
                    value={formData.areaCode}
                    onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Head Code</Label>
                  <Input
                    placeholder="e.g., H-001"
                    value={formData.headCode}
                    onChange={(e) => setFormData({ ...formData, headCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input
                    placeholder="e.g., Large, Medium, Small"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingMachine ? "Update Machine" : "Add Machine"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area Code</TableHead>
                <TableHead>Head Code</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium font-mono">{machine.areaCode}</TableCell>
                  <TableCell className="font-mono">{machine.headCode}</TableCell>
                  <TableCell>
                    <Badge variant={getSizeVariant(machine.size)}>{machine.size}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(machine)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(machine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
