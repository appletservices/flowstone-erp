import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Unit {
  id: string;
  name: string;
  conversion: string;
}

const initialUnits: Unit[] = [
  { id: "1", name: "Meter", conversion: "1 Meter = 3.28 Feet" },
  { id: "2", name: "Feet", conversion: "1 Feet = 0.30 Meter" },
  { id: "3", name: "Inch", conversion: "1 Inch = 2.54 cm" },
  { id: "4", name: "Kilogram", conversion: "1 Kilogram = 1000 Gram" },
  { id: "5", name: "Gram", conversion: "1 Gram = 0.001 Kilogram" },
  { id: "6", name: "Piece", conversion: "1 Piece = 1 Unit" },
  { id: "7", name: "Dozen", conversion: "1 Dozen = 12 Pieces" },
  { id: "8", name: "Spool", conversion: "1 Spool = 1 Unit" },
];

export default function Units() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ name: "", conversion: "" });

  const handleSubmit = () => {
    if (!formData.name || !formData.conversion) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingUnit) {
      setUnits(units.map(u => 
        u.id === editingUnit.id 
          ? { ...u, name: formData.name, conversion: formData.conversion }
          : u
      ));
      toast.success("Unit updated successfully");
    } else {
      setUnits([...units, { 
        id: Date.now().toString(), 
        name: formData.name, 
        conversion: formData.conversion 
      }]);
      toast.success("Unit added successfully");
    }

    setFormData({ name: "", conversion: "" });
    setEditingUnit(null);
    setDialogOpen(false);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, conversion: unit.conversion });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!unitToDelete) return;
    setUnits(units.filter(u => u.id !== unitToDelete.id));
    setDeleteDialogOpen(false);
    setUnitToDelete(null);
    toast.success("Unit deleted successfully");
  };

  const openDeleteDialog = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({ name: "", conversion: "" });
      setEditingUnit(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Units</h1>
        <p className="text-muted-foreground mt-1">Manage measurement units and their conversions</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Units</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="e.g., Meter"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conversion *</Label>
                  <Input
                    placeholder="e.g., 1 Meter = 3.28 Feet"
                    value={formData.conversion}
                    onChange={(e) => setFormData({ ...formData, conversion: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingUnit ? "Update Unit" : "Add Unit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell className="text-muted-foreground">{unit.conversion}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(unit)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(unit)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{unitToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}