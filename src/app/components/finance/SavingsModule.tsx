"use client";

import React, { useState } from "react";
import { useFinance } from "@/app/context/finance-context/FinanceContext";
import CardBox from "../shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  SavingsGoalFormData,
  SAVINGS_ICONS,
} from "@/app/(DashboardLayout)/types/finance";
import { format, differenceInBusinessDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import CurrencyInput from "react-currency-input-field";

const SavingsModule: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
  } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [contributionNotes, setContributionNotes] = useState<string>("");
  const [formData, setFormData] = useState<SavingsGoalFormData>({
    name: "",
    targetAmount: null,
    targetDate: null,
    icon: "solar:piggy-bank-bold",
    color: "#22c55e",
    description: "",
  });

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#eab308",
    "#06b6d4",
    "#14b8a6",
  ];

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingId) {
      updateSavingsGoal(editingId, formData);
    } else {
      addSavingsGoal(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: null,
      targetDate: null,
      icon: "solar:piggy-bank-bold",
      color: "#22c55e",
      description: "",
    });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const goal = savingsGoals.find((g) => g.id === id);
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        icon: goal.icon,
        color: goal.color,
        description: goal.description,
      });
      console.log(toZonedTime(goal.targetDate, 'UTC'))
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteSavingsGoal(id);
  };

  const handleContribution = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributionAmount(0);
    setContributionNotes("");
    setIsContributionOpen(true);
  };

  const submitContribution = () => {
    if (selectedGoalId && contributionAmount > 0) {
      addSavingsContribution(
        selectedGoalId,
        contributionAmount,
        contributionNotes,
      );
      setIsContributionOpen(false);
    }
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = savingsGoals.filter(
    (g) => g.status === "completed",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold hidden md:block">
            Metas de Ahorro
          </h2>
          <p className="text-muted-foreground">Define tus metas de ahorro</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="flex justify-between md:justify-end gap-8 text-center w-full">
            <div>
              <p className="text-sm text-muted-foreground">Meta Total</p>
              <p className="text-lg font-bold">
                ${totalTarget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ahorrado</p>
              <p className="text-lg font-bold text-success">
                ${totalSaved.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-lg font-bold text-success">{completedGoals}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsDialogOpen(true);
              resetForm();
            }}
            className="gap-2"
          >
            <Icon icon="solar:add-circle-bold" />
            Nueva Meta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
          );
          const daysRemaining = differenceInBusinessDays(
            goal.targetDate,
            format(new Date(), "yyyy-MM-dd"),
          );
          const remaining = goal.targetAmount - goal.currentAmount;

          return (
            <CardBox
              key={goal.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Icon
                      icon={goal.icon}
                      className="text-2xl"
                      style={{ color: goal.color }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold capitalize">{goal.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {goal.targetDate
                        ? daysRemaining > 0
                          ? `${daysRemaining} días restantes`
                          : "Fecha límite"
                        : "Sin fecha límite"}
                    </p>
                  </div>
                </div>
                {!goal.targetAmount ? (
                  ""
                ) : (
                  <Badge
                    variant={
                      goal.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {goal.status === "completed" ? "Completada" : "En progreso"}
                  </Badge>
                )}
              </div>
              {!goal.targetAmount ? (
                ""
              ) : (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso</span>
                    <span
                      className="font-bold"
                      style={{ color: goal.color }}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-3"
                  />
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {percentage === 100 ? "Ahorrado" : "Actual"}
                  </span>
                  <span
                    className={`font-semibold ${goal.currentAmount === 0 ? "text-muted-foreground" : "text-success"}`}
                  >
                    ${goal.currentAmount.toLocaleString()}
                  </span>
                </div>
                {goal.targetAmount ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-semibold">
                        ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    {remaining > 0 ? (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Faltan</span>
                        <span>${remaining.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-sm text-muted-foreground mt-5">
                        <span className="text-success">¡Felicidades!</span>
                        <span>Has completado tu meta.</span>
                      </div>
                    )}
                  </>
                ) : (
                  ""
                )}
              </div>

              {goal.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {goal.description}
                </p>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleContribution(goal.id)}
                  disabled={goal.status === "completed"}
                >
                  <Icon
                    icon="solar:add-circle-bold"
                    className="w-4 h-4"
                  />
                  Aportar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(goal.id)}
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
                        className="w-4 h-4"
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500 w-10 h-10 p-2">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>
                        ¿Eliminar Meta De Ahorro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Este registro se borrará de manera permanente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(goal.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardBox>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Icon
              icon="solar:piggy-bank-bold"
              className="text-5xl mb-3 mx-auto opacity-30"
            />
            <p className="text-lg">No hay metas de ahorro</p>
            <p className="text-sm">
              ¡Crea tu primera meta para empezar a ahorrar!
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar" : "Nueva"} Meta de Ahorro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Vacaciones 2025"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto Objetivo (opcional)</Label>
                {/* <Input
                  type="number"
                  value={formData.targetAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAmount: parseFloat(e.target.value) || null,
                    })
                  }
                /> */}
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <CurrencyInput
                    customInput={InputGroupInput} // Mantiene tus estilos
                    placeholder="0.00"
                    decimalsLimit={2}
                    value={formData.targetAmount || ""}
                    onValueChange={(value, name, values) => {
                      setFormData({
                        ...formData,
                        targetAmount: values?.float,
                      });
                    }}
                  />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label>Fecha Límite (opcional)</Label>
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
                      {formData.targetDate ? (
                        formatInTimeZone(
                          formData.targetDate,
                          "UTC",
                          "yyyy-MM-dd",
                        )
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
                      selected={toZonedTime(
                        formData.targetDate ?? new Date(),
                        "UTC",
                      )}
                      onSelect={(e) => {
                        setFormData({
                          ...formData,
                          targetDate: e,
                        });
                        setOpen(false);
                      }}
                      defaultMonth={toZonedTime(
                        formData.targetDate ?? new Date(),
                        "UTC",
                      )}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                placeholder="Descripción de tu meta..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {SAVINGS_ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition-colors ${formData.icon === icon.value ? "border-primary" : "border-transparent"}`}
                    onClick={() =>
                      setFormData({ ...formData, icon: icon.value })
                    }
                    title={icon.label}
                  >
                    <Icon
                      icon={icon.value}
                      className="w-6 h-6"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
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

      <Dialog
        open={isContributionOpen}
        onOpenChange={setIsContributionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Realizar Aportación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              {/* <Input
                type="number"
                placeholder="0.00"
                value={contributionAmount || ""}
                onChange={(e) =>
                  setContributionAmount(parseFloat(e.target.value) || 0)
                }
              /> */}
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <CurrencyInput
                  customInput={InputGroupInput} // Mantiene tus estilos
                  placeholder="0.00"
                  decimalsLimit={2}
                  value={contributionAmount || ""}
                  onValueChange={(value, name, values) => {
                    setContributionAmount(values?.float || 0);
                  }}
                />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Ej: Aporte semanal"
                value={contributionNotes}
                onChange={(e) => setContributionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContributionOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitContribution}>Aportar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsModule;
