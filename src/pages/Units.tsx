import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Unit {
  id: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

interface Conversion {
  id: string;
  fromUnit: string;
  toUnit: string;
  factor: number;
}

const initialUnits: Unit[] = [
  { id: "1", name: "Meter", symbol: "m", isBase: true },
  { id: "2", name: "Feet", symbol: "ft", isBase: false },
  { id: "3", name: "Inch", symbol: "in", isBase: false },
  { id: "4", name: "Kilogram", symbol: "kg", isBase: true },
  { id: "5", name: "Gram", symbol: "g", isBase: false },
];

const initialConversions: Conversion[] = [
  { id: "1", fromUnit: "Meter", toUnit: "Feet", factor: 3.28084 },
  { id: "2", fromUnit: "Meter", toUnit: "Inch", factor: 39.3701 },
  { id: "3", fromUnit: "Kilogram", toUnit: "Gram", factor: 1000 },
];

export default function Units() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [conversions, setConversions] = useState<Conversion[]>(initialConversions);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", symbol: "", isBase: false });
  const [newConversion, setNewConversion] = useState({ fromUnit: "", toUnit: "", factor: "" });

  const handleAddUnit = () => {
    if (newUnit.name && newUnit.symbol) {
      setUnits([...units, { ...newUnit, id: Date.now().toString() }]);
      setNewUnit({ name: "", symbol: "", isBase: false });
      setUnitDialogOpen(false);
    }
  };

  const handleAddConversion = () => {
    if (newConversion.fromUnit && newConversion.toUnit && newConversion.factor) {
      setConversions([
        ...conversions,
        { ...newConversion, id: Date.now().toString(), factor: parseFloat(newConversion.factor) },
      ]);
      setNewConversion({ fromUnit: "", toUnit: "", factor: "" });
      setConversionDialogOpen(false);
    }
  };

  const handleDeleteUnit = (id: string) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const handleDeleteConversion = (id: string) => {
    setConversions(conversions.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Units & Conversions</h1>
        <p className="text-muted-foreground mt-1">Manage measurement units and conversion factors</p>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Units</CardTitle>
              <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Unit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Unit Name</Label>
                      <Input
                        placeholder="e.g., Meter"
                        value={newUnit.name}
                        onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Symbol</Label>
                      <Input
                        placeholder="e.g., m"
                        value={newUnit.symbol}
                        onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isBase"
                        checked={newUnit.isBase}
                        onChange={(e) => setNewUnit({ ...newUnit, isBase: e.target.checked })}
                        className="rounded border-input"
                      />
                      <Label htmlFor="isBase">Base Unit</Label>
                    </div>
                    <Button onClick={handleAddUnit} className="w-full">
                      Add Unit
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
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>{unit.symbol}</TableCell>
                      <TableCell>
                        {unit.isBase ? (
                          <Badge variant="default">Base</Badge>
                        ) : (
                          <Badge variant="secondary">Derived</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUnit(unit.id)}
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
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Unit Conversions</CardTitle>
              <Dialog open={conversionDialogOpen} onOpenChange={setConversionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Conversion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Conversion Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>From Unit</Label>
                      <Select
                        value={newConversion.fromUnit}
                        onValueChange={(v) => setNewConversion({ ...newConversion, fromUnit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.id} value={u.name}>
                              {u.name} ({u.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Unit</Label>
                      <Select
                        value={newConversion.toUnit}
                        onValueChange={(v) => setNewConversion({ ...newConversion, toUnit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.id} value={u.name}>
                              {u.name} ({u.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conversion Factor</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 3.28084"
                        value={newConversion.factor}
                        onChange={(e) => setNewConversion({ ...newConversion, factor: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddConversion} className="w-full">
                      Add Conversion
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead></TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Factor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-medium">{conv.fromUnit}</TableCell>
                      <TableCell>
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>{conv.toUnit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">1 = {conv.factor}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteConversion(conv.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
