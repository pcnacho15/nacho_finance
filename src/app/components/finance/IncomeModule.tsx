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
import { IncomeFormData } from "@/app/(DashboardLayout)/types/finance";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toZonedTime } from "date-fns-tz";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import CurrencyInput from "react-currency-input-field";

const IncomeModule: React.FC = () => {
  const { incomes, categories, addIncome, updateIncome, deleteIncome } =
    useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: 0,
    description: "",
    categoryId: "",
    date: new Date(),
  });

  const incomeCategories = categories.filter((c) => c.type === "income");

  const handleSubmit = () => {
    if (formData.amount <= 0 || !formData.categoryId || !formData.description)
      return;

    if (editingId) {
      updateIncome(editingId, formData);
    } else {
      addIncome(formData);
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
    });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (income) {
      setFormData({
        amount: Number(income.amount),
        description: income.description,
        categoryId: income.categoryId,
        date: new Date(income.date),
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteIncome(id);
  };

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold">Ingresos</h2>
          <p className="text-muted-foreground">Gestiona tus ingresos</p>
        </div>
        <div className="flex justify-between md:justify-end items-center gap-4 rounded-md  md:bg-transparent w-full">
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">
              ${totalIncome.toLocaleString()}
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
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      <CardBox>
        {incomes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon
              icon="solar:money-bag-bold"
              className="text-5xl mb-3 mx-auto opacity-30"
            />
            <p className="text-lg">No hay ingresos registrados</p>
            <p className="text-sm">
              Agrega tu primer ingreso usando el botón de arriba
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
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="p-0">
                          <div className="flex ">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(income.id)}
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
                                  className="text-red-500 hover:text-error"
                                >
                                  <Icon icon="solar:trash-bin-trash-bold" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                  <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500 w-10 h-10 p-2">
                                    <Trash2Icon />
                                  </AlertDialogMedia>
                                  <AlertDialogTitle>
                                    ¿Eliminar Ingreso?
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
                                    onClick={() => handleDelete(income.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {income.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="bg-green-300/10"
                            variant="outline"
                            style={{
                              borderColor: income.category?.color,
                              color: income.category?.color,
                              backgroundColor: income.category?.color + "1A",
                            }}
                          >
                            {income.category?.name ?? "Sin categoría"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(income.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          +${Number(income.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <div className="block md:hidden">
              <ScrollArea className="grid grid-cols-1 gap-2 h-90">
                {incomes
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((income) => (
                    <div
                      key={income.id}
                      className="flex flex-col gap-2 p-2 rounded-sm border border-muted mb-2"
                    >
                      <div className="flex items-center justify-between gap-2 px-2">
                        <p className="font-bold capitalize">
                          {income.description}
                        </p>
                        <Badge
                          className="text-xs px-1.5 py-0.5"
                          variant="outline"
                          style={{
                            borderColor: income.category?.color,
                            color: income.category?.color,
                            backgroundColor: income.category?.color + "1A",
                          }}
                        >
                          {income.category?.name ?? "Sin categoría"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <div className="pl-2">
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(income.date), "dd MMM yyyy")}
                          </p>
                          <Separator />
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            +${Number(income.amount).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(income.id)}
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
                                  ¿Eliminar Ingreso?
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
                                  onClick={() => handleDelete(income.id)}
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
            <DialogTitle>{editingId ? "Editar" : "Nuevo"} Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Ej: Pago de nómina"
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
                    {incomeCategories.map((cat) => (
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
                    // values.float contiene el número listo para tu estado
                    setFormData({
                      ...formData,
                      amount: values?.float || 0,
                    });
                  }}
                />
              </InputGroup>
            </div>
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

export default IncomeModule;
