"use client";

import React, { useState } from "react";
import { useFinance } from "@/app/context/finance-context/FinanceContext";
import CardBox from "../shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ExpenseFormData } from "@/app/(DashboardLayout)/types/finance";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toZonedTime } from "date-fns-tz";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import CurrencyInput from "react-currency-input-field";
import { motion, AnimatePresence } from "framer-motion";

const ExpenseModule: React.FC = () => {
  const { expenses, categories, addExpense, updateExpense, deleteExpense } =
    useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    description: "",
    categoryId: "",
    date: new Date(),
    isRecurring: false,
    recurringFrequency: undefined,
  });

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = () => {
    if (formData.amount <= 0 || !formData.categoryId || !formData.description)
      return;

    if (editingId) {
      updateExpense(editingId, formData);
    } else {
      addExpense(formData);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      amount: 0,
      description: "",
      categoryId: "",
      date: new Date(),
      isRecurring: false,
    });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
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
    // if (confirm('¿Estás seguro de eliminar este gasto?')) {
    deleteExpense(id);
    // }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const recurringTotal = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + Number(e.amount), 0);

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
            onClick={() => {
              setIsDialogOpen(true);
              resetForm();
            }}
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
                            <Badge variant="secondary" className="capitalize">
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
                          className="text-xs text-center px-1.5 py-0.5"
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
            <div className="flex justify-between gap-2">
              <div className="space-y-2 flex-1">
                <Label>Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, categoryId: v })
                  }
                >
                  <SelectTrigger className="w-full">
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
              <div className="space-y-2 flex-1">
                <Label>Fecha</Label>
                <Popover
                  open={open}
                  onOpenChange={setOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-simple"
                      className="flex justify-between w-full font-normal"
                    >
                      {formData.date ? (
                        format(formData.date, "yyyy-MM-dd")
                      ) : (
                        <span>yyyy-mm-dd</span>
                      )}
                      <CalendarIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      className="rounded-lg"
                      selected={new Date()}
                      onSelect={(e) => {
                        setFormData({
                          ...formData,
                          date: e ?? new Date(),
                        });
                        setOpen(false);
                      }}
                      defaultMonth={toZonedTime(
                        formData.date ?? new Date(),
                        "UTC",
                      )}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                
                <CurrencyInput
                  customInput={InputGroupInput} // Mantiene tus estilos
                  placeholder="0.00"
                  decimalsLimit={2}
                  value={formData.amount || ''}
                  onValueChange={(value, name, values) => {
                    setFormData({
                      ...formData,
                      amount: values?.float || 0,
                    });
                  }}
                />
              </InputGroup>
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
            <AnimatePresence>
              {formData.isRecurring && (
                <motion.div
                  key="frequency-fields"
                  className="space-y-2 overflow-hidden"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto", // Se ajusta automáticamente al contenido
                    marginTop: 8, // Equivalente a space-y-2 de Tailwind
                  }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    duration: 0.2, // 300 milisegundos
                    ease: "easeInOut",
                  }}
                >
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
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm;
                setIsDialogOpen(false);
              }}
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
