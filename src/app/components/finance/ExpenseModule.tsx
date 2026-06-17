'use client';

import React, { useState } from 'react';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import CardBox from '../shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ExpenseFormData } from '@/app/(DashboardLayout)/types/finance';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ExpenseModule: React.FC = () => {
  const { expenses, categories, addExpense, updateExpense, deleteExpense } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    description: '',
    categoryId: '',
    date: new Date(),
    isRecurring: false,
    recurringFrequency: undefined,
  });

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = () => {
    if (formData.amount <= 0 || !formData.categoryId || !formData.description) return;

    if (editingId) {
      updateExpense(editingId, formData);
    } else {
      addExpense(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ amount: 0, description: '', categoryId: '', date: new Date(), isRecurring: false });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setFormData({
        amount: Number(expense.amount),
        description: expense.description,
        categoryId: expense.categoryId,
        date: new Date(expense.date),
        isRecurring: expense.isRecurring,
        recurringFrequency: expense.recurringFrequency ?? undefined,
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      deleteExpense(id);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const recurringTotal = expenses.filter(e => e.isRecurring).reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold">Gastos</h2>
          <p className="text-muted-foreground">Gestiona tus gastos y egresos</p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 w-full">
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Total Gastado</p>
            <p className="text-2xl font-bold">
              ${totalExpense.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Icon icon="solar:add-circle-bold" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      <CardBox>
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon
              icon="solar:shopping-cart-bold"
              className="text-5xl mb-3 mx-auto opacity-30"
            />
            <p className="text-lg">No hay gastos registrados</p>
            <p className="text-sm">
              Agrega tu primer gasto usando el botón de arriba
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acciones</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Recurrente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="p-0">
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense.id)}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <Icon
                                icon="solar:pen-bold"
                                className="w-4 h-4"
                              />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-error hover:text-error"
                                >
                                  <Icon
                                    icon="solar:trash-bin-trash-bold"
                                    className="w-4 h-4 text-red-500"
                                  />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                  <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500 w-10 h-10 p-2">
                                    <Trash2Icon />
                                  </AlertDialogMedia>
                                  <AlertDialogTitle>
                                    ¿Eliminar Gasto?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Este registro se borrará de manera
                                    permanente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel variant="outline">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(expense.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: expense.category?.color,
                              color: expense.category?.color,
                            }}
                          >
                            {expense.category?.name ?? "Sin categoría"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {expense.isRecurring ? (
                            <Badge variant="secondary">
                              {expense.recurringFrequency}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-error">
                          -${Number(expense.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <div className="block md:hidden">
              <ScrollArea className="grid grid-cols-1 gap-2 h-90">
                {expenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-2 p-2 rounded-sm border border-muted mb-2"
                    >
                      <div className="flex items-center justify-between gap-2 px-2">
                        <p className="font-bold capitalize">
                          {expense.description}
                        </p>
                        <Badge
                          className="text-xs px-1.5 py-0.5"
                          variant="outline"
                          style={{
                            borderColor: expense.category?.color,
                            color: expense.category?.color,
                            backgroundColor: expense.category?.color + "1A",
                          }}
                        >
                          {expense.category?.name ?? "Sin categoría"}
                        </Badge>
                      </div>
                      <div className="flex justify-between px-2">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(expense.date), "dd MMM yyyy")}
                          </p>
                          <Separator />
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            -${Number(expense.amount).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense.id)}
                          >
                            <Icon
                              icon="solar:pen-bold"
                              className="w-4 h-4"
                            />
                          </Button>
                          {/* <Separator orientation="vertical" /> */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-error hover:text-error"
                              >
                                <Icon
                                  icon="solar:trash-bin-trash-bold"
                                  className="w-4 h-4 text-red-500"
                                />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                              <AlertDialogHeader>
                                <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500 w-10 h-10 p-2">
                                  <Trash2Icon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>
                                  ¿Eliminar Gasto?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Este registro se borrará de manera permanente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* <Separator /> */}
                    </div>
                  ))}
              </ScrollArea>
            </div>
          </>
        )}
      </CardBox>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Nuevo"} Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Ej: Compra de alimentos"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) =>
                  setFormData({ ...formData, categoryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={format(formData.date, "yyyy-MM-dd")}
                onChange={(e) =>
                  setFormData({ ...formData, date: new Date(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked as boolean })
                }
              />
              <Label htmlFor="recurring">Es un gasto recurrente</Label>
            </div>
            {formData.isRecurring && (
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select
                  value={formData.recurringFrequency}
                  onValueChange={(v) =>
                    setFormData({ ...formData, recurringFrequency: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetForm}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseModule;
