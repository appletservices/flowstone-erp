import { useState } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
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

interface ExpenseCategory {
  id: string;
  name: string;
}

const initialCategories: ExpenseCategory[] = [
  { id: "1", name: "Utilities" },
  { id: "2", name: "Office Supplies" },
  { id: "3", name: "Transportation" },
  { id: "4", name: "Maintenance" },
  { id: "5", name: "Salaries" },
  { id: "6", name: "Rent" },
  { id: "7", name: "Insurance" },
  { id: "8", name: "Marketing" },
];

export default function ExpenseCategories() {
  useSetPageHeader("Expense Categories", "Manage expense classification categories");
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleOpenDialog = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (categoryName.trim()) {
      if (editingCategory) {
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id ? { ...c, name: categoryName } : c
          )
        );
      } else {
        setCategories([...categories, { id: Date.now().toString(), name: categoryName }]);
      }
      setDialogOpen(false);
      setCategoryName("");
      setEditingCategory(null);
    }
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Categories
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    placeholder="e.g., Utilities"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingCategory ? "Update Category" : "Add Category"}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
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
