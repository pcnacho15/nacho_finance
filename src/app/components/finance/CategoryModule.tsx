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
import { CategoryFormData } from '@/app/(DashboardLayout)/types/finance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const CategoryModule: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    color: '#6b7280',
    icon: 'solar:add-circle-bold',
  });

  const ICONS = [
    { value: "solar:money-bag-bold", label: "Dinero" },
    { value: "solar:laptop-bold", label: "Trabajo" },
    { value: "solar:ufo-3-bold", label: "Transporte" },
    { value: "solar:home-bold", label: "Casa" },
    { value: "solar:bolt-bold", label: "Servicios" },
    { value: "solar:heart-bold", label: "Salud" },
    { value: "solar:gamepad-bold", label: "Entretenimiento" },
    { value: "solar:book-bold", label: "Educación" },
    { value: "solar:cup-bold", label: "Alimentación" },
    { value: "solar:cart-3-bold", label: "Compras" },
    { value: "solar:chart-2-bold", label: "Inversiones" },
    { value: "solar:hand-money-linear", label: "Ahorro" },
    { value: "solar:add-circle-bold", label: "Otro" },
  ];

  const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#ec4899', '#6b7280',
  ];

  const filteredCategories = filterType === 'all'
    ? categories
    : categories.filter(c => c.type === filterType);

  const handleSubmit = () => {
    if (!formData.name || !formData.type) return;

    if (editingId) {
      updateCategory(editingId, formData);
    } else {
      addCategory(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', color: '#6b7280', icon: 'solar:add-circle-bold' });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat) {
      setFormData({
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="text-muted-foreground">Gestiona las categorías de tus finanzas</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Icon icon="solar:add-circle-bold" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardBox>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon icon="solar:arrow-right-up-bold" className="text-success" />
              Ingresos ({incomeCategories.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {incomeCategories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <Icon icon={cat.icon} style={{ color: cat.color }} />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(cat.id)}>
                      <Icon icon="solar:pen-bold" className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-error hover:text-error" onClick={() => handleDelete(cat.id)}>
                      <Icon icon="solar:trash-bin-trash-bold" className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBox>

        <CardBox>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon icon="solar:arrow-right-down-bold" className="text-error" />
              Gastos ({expenseCategories.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {expenseCategories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <Icon icon={cat.icon} style={{ color: cat.color }} />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(cat.id)}>
                      <Icon icon="solar:pen-bold" className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-error hover:text-error" onClick={() => handleDelete(cat.id)}>
                      <Icon icon="solar:trash-bin-trash-bold" className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBox>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nueva'} Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Salario"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'income' | 'expense' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition-colors ${formData.icon === icon.value ? 'border-primary' : 'border-transparent bg-muted'}`}
                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                    title={icon.label}
                  >
                    <Icon icon={icon.value} className="w-5 h-5" />
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
                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryModule;
