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
import {
  DebtFormData,
  DebtType,
  DEBT_TYPE_LABELS,
  DEBT_STATUS_LABELS,
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
import { Progress } from "@/components/ui/progress";
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
import { Trash2Icon } from "lucide-react";

const DebtModule: React.FC = () => {
  const { debts, addDebt, updateDebt, deleteDebt, addDebtPayment } =
    useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [formData, setFormData] = useState<DebtFormData>({
    name: "",
    type: "loan",
    creditor: "",
    originalAmount: 0,
    currentAmount: 0,
    interestRate: 0,
    monthlyPayment: 0,
    startDate: new Date(),
    dueDate: new Date(),
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.name || formData.originalAmount <= 0) return;

    const debtData = {
      ...formData,
      currentAmount: formData.currentAmount || formData.originalAmount,
    };

    if (editingId) {
      updateDebt(editingId, debtData);
    } else {
      addDebt(debtData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "loan",
      creditor: "",
      originalAmount: 0,
      currentAmount: 0,
      interestRate: 0,
      monthlyPayment: 0,
      startDate: new Date(),
      dueDate: new Date(),
      notes: "",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (debt) {
      setFormData({
        name: debt.name,
        type: debt.type,
        creditor: debt.creditor,
        originalAmount: debt.originalAmount,
        currentAmount: debt.currentAmount,
        interestRate: debt.interestRate,
        monthlyPayment: debt.monthlyPayment,
        startDate: new Date(debt.startDate),
        dueDate: new Date(debt.dueDate),
        notes: debt.notes,
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteDebt(id);
  };

  const handlePayment = (debtId: string) => {
    setSelectedDebtId(debtId);
    setPaymentAmount(0);
    setIsPaymentOpen(true);
  };

  const submitPayment = () => {
    if (selectedDebtId && paymentAmount > 0) {
      addDebtPayment(selectedDebtId, paymentAmount);
      setIsPaymentOpen(false);
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.currentAmount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const activeDebts = debts.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold">Deudas</h2>
          <p className="text-muted-foreground">
            Gestiona tus deudas y préstamos
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="flex justify-between md:justify-end gap-8 text-center w-full">
            <div>
              <p className="text-sm text-muted-foreground">Total Deuda</p>
              <p className="text-lg font-bold text-error">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pagado</p>
              <p className="text-lg font-bold text-success">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Activas</p>
              <p className="text-lg font-bold">{activeDebts}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Icon icon="solar:add-circle-bold" />
            Nueva Deuda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debts.map((debt) => {
          const percentage = Math.round(
            (debt.paidAmount / (debt.paidAmount + debt.currentAmount)) * 100,
          );
          return (
            <CardBox
              key={debt.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${debt.status === "paid" ? "bg-success/10" : debt.status === "overdue" ? "bg-error/10" : "bg-warning/10"}`}
                  >
                    <Icon
                      icon="solar:document-text-bold"
                      className={`text-xl ${debt.status === "paid" ? "text-success" : debt.status === "overdue" ? "text-error" : "text-warning"}`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{debt.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {DEBT_TYPE_LABELS[debt.type]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    debt.status === "paid"
                      ? "default"
                      : debt.status === "overdue"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {DEBT_STATUS_LABELS[debt.status]}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendiente</span>
                  <span className="font-semibold">
                    ${debt.currentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pagado</span>
                  <span className="font-semibold text-success">
                    ${debt.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pago mensual</span>
                  <span className="font-semibold">
                    ${debt.monthlyPayment.toLocaleString()}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Acreedor: {debt.creditor}</span>
                  <span>
                    Vence: {format(new Date(debt.dueDate), "dd MMM yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handlePayment(debt.id)}
                >
                  <Icon
                    icon="solar:money-bag-bold"
                    className="w-4 h-4"
                  />
                  Pagar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(debt.id)}
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
                      className="text-error hover:text-error w-4"
                    >
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="w-4 h-4"
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500 w-10 h-10 p-2">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>¿Eliminar Deuda?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Este registro se borrará de manera permanente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(debt.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardBox>
          );
        })}

        {debts.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Icon
              icon="solar:check-circle-bold"
              className="text-5xl mb-3 mx-auto opacity-30"
            />
            <p className="text-lg">No hay deudas registradas</p>
            <p className="text-sm">
              ¡Agrega una deuda para empezar a rastrear!
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Nueva"} Deuda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Préstamo Bancario"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as DebtType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEBT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Acreedor</Label>
                <Input
                  placeholder="Ej: Banco Nacional"
                  value={formData.creditor}
                  onChange={(e) =>
                    setFormData({ ...formData, creditor: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto Original</Label>
                <Input
                  type="number"
                  value={formData.originalAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Actual</Label>
                <Input
                  type="number"
                  value={formData.currentAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tasa de Interés (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interestRate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Pago Mensual</Label>
                <Input
                  type="number"
                  value={formData.monthlyPayment || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyPayment: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Input
                  type="date"
                  value={format(formData.startDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  value={format(formData.dueDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                placeholder="Notas adicionales..."
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
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

      <Dialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto del Pago</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentAmount || ""}
                onChange={(e) =>
                  setPaymentAmount(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitPayment}>Registrar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtModule;
