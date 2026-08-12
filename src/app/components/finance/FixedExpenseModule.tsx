"use client";

import React, { useMemo, useState } from "react";
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
import {
  FixedExpense,
  FixedExpenseFormData,
  FixedExpenseFrequency,
  FIXED_EXPENSE_FREQUENCY_LABELS,
  isCurrentlyActive,
  monthlyEquivalent,
  yearlyEquivalent,
} from "@/app/(DashboardLayout)/types/finance";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

const FREQUENCIES = Object.keys(
  FIXED_EXPENSE_FREQUENCY_LABELS,
) as FixedExpenseFrequency[];

const emptyForm: FixedExpenseFormData = {
  name: "",
  amount: 0,
  categoryId: "",
  frequency: "mensual",
  dayOfMonth: null,
  startDate: new Date(),
  endDate: null,
  isActive: true,
  paymentMethod: "",
  notes: "",
};

const money = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

const FixedExpenseModule: React.FC = () => {
  const {
    fixedExpenses,
    categories,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  } = useFinance();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(true);
  const [formData, setFormData] = useState<FixedExpenseFormData>(emptyForm);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const sorted = useMemo(
    () =>
      [...fixedExpenses].sort((a, b) => {
        const activeDiff = Number(isCurrentlyActive(b)) - Number(isCurrentlyActive(a));
        if (activeDiff !== 0) return activeDiff;
        return monthlyEquivalent(b) - monthlyEquivalent(a);
      }),
    [fixedExpenses],
  );

  const visible = showInactive ? sorted : sorted.filter((f) => isCurrentlyActive(f));

  const activos = useMemo(
    () => fixedExpenses.filter((f) => isCurrentlyActive(f)),
    [fixedExpenses],
  );
  const totalMensual = activos.reduce((sum, f) => sum + monthlyEquivalent(f), 0);
  const totalAnual = activos.reduce((sum, f) => sum + yearlyEquivalent(f), 0);

  // Desglose por categoría del compromiso mensual, para ver dónde pesa más.
  const porCategoria = useMemo(() => {
    const map = new Map<string, { name: string; color: string; total: number }>();
    for (const f of activos) {
      const key = f.categoryId;
      const current = map.get(key) ?? {
        name: f.category?.name ?? "Sin categoría",
        color: f.category?.color ?? "#94a3b8",
        total: 0,
      };
      current.total += monthlyEquivalent(f);
      map.set(key, current);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [activos]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.amount <= 0 || !formData.categoryId)
      return;

    const payload: FixedExpenseFormData = {
      ...formData,
      name: formData.name.trim(),
      paymentMethod: formData.paymentMethod?.trim() || null,
      notes: formData.notes?.trim() || null,
      dayOfMonth: formData.dayOfMonth || null,
    };

    if (editingId) {
      updateFixedExpense(editingId, payload);
    } else {
      addFixedExpense(payload);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (fixed: FixedExpense) => {
    setFormData({
      name: fixed.name,
      amount: Number(fixed.amount),
      categoryId: fixed.categoryId,
      frequency: fixed.frequency,
      dayOfMonth: fixed.dayOfMonth ?? null,
      startDate: new Date(fixed.startDate),
      endDate: fixed.endDate ? new Date(fixed.endDate) : null,
      isActive: fixed.isActive,
      paymentMethod: fixed.paymentMethod ?? "",
      notes: fixed.notes ?? "",
    });
    setEditingId(fixed.id);
    setIsDialogOpen(true);
  };

  const toggleActive = (fixed: FixedExpense) =>
    updateFixedExpense(fixed.id, { isActive: !fixed.isActive });

  const renderEstado = (fixed: FixedExpense) => {
    if (!fixed.isActive)
      return <Badge variant="secondary">Pausado</Badge>;
    if (!isCurrentlyActive(fixed))
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground"
        >
          Fuera de vigencia
        </Badge>
      );
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
        Vigente
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold">Gastos Fijos</h2>
          <p className="text-muted-foreground">
            Tus compromisos recurrentes: se declaran una vez, no hay que
            registrarlos cada mes
          </p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 w-full">
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Compromiso mensual</p>
            <p className="text-2xl font-bold">${money(totalMensual)}</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Icon icon="solar:add-circle-bold" />
            Nuevo Gasto Fijo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardBox className="p-4">
          <p className="text-sm text-muted-foreground">Equivalente mensual</p>
          <p className="text-xl font-bold">${money(totalMensual)}</p>
        </CardBox>
        <CardBox className="p-4">
          <p className="text-sm text-muted-foreground">Equivalente anual</p>
          <p className="text-xl font-bold">${money(totalAnual)}</p>
        </CardBox>
        <CardBox className="p-4">
          <p className="text-sm text-muted-foreground">Gastos fijos vigentes</p>
          <p className="text-xl font-bold">
            {activos.length}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              de {fixedExpenses.length}
            </span>
          </p>
        </CardBox>
      </div>

      {porCategoria.length > 0 && (
        <CardBox className="p-4 space-y-3">
          <p className="text-sm font-semibold">Mensual por categoría</p>
          <div className="flex flex-wrap gap-2">
            {porCategoria.map((c) => (
              <Badge
                key={c.name}
                variant="outline"
                style={{
                  borderColor: c.color,
                  color: c.color,
                  backgroundColor: c.color + "1A",
                }}
              >
                {c.name}: ${money(c.total)}
              </Badge>
            ))}
          </div>
        </CardBox>
      )}

      <CardBox>
        {fixedExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon
              icon="solar:calendar-mark-bold"
              className="text-5xl mb-3 mx-auto opacity-30"
            />
            <p className="text-lg">No hay gastos fijos registrados</p>
            <p className="text-sm">
              Agrega arriendo, servicios, suscripciones… y olvídate de
              registrarlos cada mes
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 pt-4">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label
                htmlFor="show-inactive"
                className="text-sm text-muted-foreground"
              >
                Mostrar pausados y vencidos
              </Label>
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acciones</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Día de cobro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Equiv. mensual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((fixed) => (
                    <TableRow
                      key={fixed.id}
                      className={isCurrentlyActive(fixed) ? "" : "opacity-60"}
                    >
                      <TableCell className="p-0">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(fixed)}
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
                                  ¿Eliminar Gasto Fijo?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Este registro se borrará de manera permanente.
                                  Si solo dejaste de pagarlo, mejor páusalo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel variant="outline">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFixedExpense(fixed.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Switch
                            checked={fixed.isActive}
                            onCheckedChange={() => toggleActive(fixed)}
                            aria-label="Activar o pausar gasto fijo"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {fixed.name}
                        {fixed.paymentMethod && (
                          <span className="block text-xs text-muted-foreground">
                            {fixed.paymentMethod}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: fixed.category?.color,
                            color: fixed.category?.color,
                          }}
                        >
                          {fixed.category?.name ?? "Sin categoría"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {FIXED_EXPENSE_FREQUENCY_LABELS[fixed.frequency]}
                      </TableCell>
                      <TableCell>
                        {fixed.dayOfMonth ? `Día ${fixed.dayOfMonth}` : "—"}
                      </TableCell>
                      <TableCell>{renderEstado(fixed)}</TableCell>
                      <TableCell className="text-right font-semibold text-error">
                        -${money(Number(fixed.amount))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${money(monthlyEquivalent(fixed))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="block md:hidden">
              <ScrollArea className="grid grid-cols-1 gap-2 h-90">
                {visible.map((fixed) => (
                  <div
                    key={fixed.id}
                    className={`flex flex-col gap-2 p-2 rounded-sm border border-muted mb-2 ${
                      isCurrentlyActive(fixed) ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 px-2">
                      <p className="font-bold capitalize">{fixed.name}</p>
                      <Badge
                        className="text-xs text-center px-1.5 py-0.5"
                        variant="outline"
                        style={{
                          borderColor: fixed.category?.color,
                          color: fixed.category?.color,
                          backgroundColor: fixed.category?.color + "1A",
                        }}
                      >
                        {fixed.category?.name ?? "Sin categoría"}
                      </Badge>
                    </div>
                    <div className="flex justify-between px-2">
                      <div>
                        <p className="text-muted-foreground text-xs">
                          {FIXED_EXPENSE_FREQUENCY_LABELS[fixed.frequency]}
                          {fixed.dayOfMonth ? ` · día ${fixed.dayOfMonth}` : ""}
                        </p>
                        <Separator />
                        <p className="font-semibold text-red-700 dark:text-red-400">
                          -${money(Number(fixed.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${money(monthlyEquivalent(fixed))} / mes
                        </p>
                        <div className="mt-1">{renderEstado(fixed)}</div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fixed)}
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
                                ¿Eliminar Gasto Fijo?
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
                                onClick={() => deleteFixedExpense(fixed.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Switch
                          checked={fixed.isActive}
                          onCheckedChange={() => toggleActive(fixed)}
                          aria-label="Activar o pausar gasto fijo"
                        />
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
            <DialogTitle>
              {editingId ? "Editar" : "Nuevo"} Gasto Fijo
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Arriendo, Netflix, Internet"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  <Label>Frecuencia</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        frequency: v as FixedExpenseFrequency,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem
                          key={f}
                          value={f}
                        >
                          {FIXED_EXPENSE_FREQUENCY_LABELS[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Label>Monto</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <CurrencyInput
                      customInput={InputGroupInput}
                      placeholder="0.00"
                      decimalsLimit={2}
                      value={formData.amount || ""}
                      onValueChange={(value, name, values) => {
                        setFormData({
                          ...formData,
                          amount: values?.float || 0,
                        });
                      }}
                    />
                  </InputGroup>
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Día de cobro (opcional)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ej: 5"
                    value={formData.dayOfMonth ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayOfMonth: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Label>Vigente desde</Label>
                  <Popover
                    open={openStart}
                    onOpenChange={setOpenStart}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex justify-between w-full font-normal"
                      >
                        {formData.startDate ? (
                          format(formData.startDate, "yyyy-MM-dd")
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
                        selected={formData.startDate}
                        onSelect={(d) => {
                          setFormData({
                            ...formData,
                            startDate: d ?? new Date(),
                          });
                          setOpenStart(false);
                        }}
                        defaultMonth={toZonedTime(
                          formData.startDate ?? new Date(),
                          "UTC",
                        )}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Hasta (opcional)</Label>
                  <Popover
                    open={openEnd}
                    onOpenChange={setOpenEnd}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex justify-between w-full font-normal"
                      >
                        {formData.endDate ? (
                          format(formData.endDate, "yyyy-MM-dd")
                        ) : (
                          <span className="text-muted-foreground">
                            Sin fecha de fin
                          </span>
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
                        selected={formData.endDate ?? undefined}
                        onSelect={(d) => {
                          setFormData({ ...formData, endDate: d ?? null });
                          setOpenEnd(false);
                        }}
                        defaultMonth={toZonedTime(
                          formData.endDate ?? new Date(),
                          "UTC",
                        )}
                      />
                    </PopoverContent>
                  </Popover>
                  {formData.endDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground"
                      onClick={() => setFormData({ ...formData, endDate: null })}
                    >
                      Quitar fecha de fin
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medio de pago (opcional)</Label>
                <Input
                  placeholder="Ej: Débito automático Bancolombia"
                  value={formData.paymentMethod ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Detalles del contrato, referencia de pago, etc."
                  value={formData.notes ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="fixed-active"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="fixed-active">Activo</Label>
              </div>

              {formData.amount > 0 && formData.frequency !== "mensual" && (
                <p className="text-sm text-muted-foreground">
                  Equivale a{" "}
                  <span className="font-semibold">
                    $
                    {money(
                      monthlyEquivalent({
                        amount: formData.amount,
                        frequency: formData.frequency,
                      }),
                    )}
                  </span>{" "}
                  al mes.
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
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

export default FixedExpenseModule;
