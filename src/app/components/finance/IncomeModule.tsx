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
import { IncomeFormData } from '@/app/(DashboardLayout)/types/finance';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const IncomeModule: React.FC = () => {
  const { incomes, categories, addIncome, updateIncome, deleteIncome } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: 0,
    description: '',
    categoryId: '',
    date: new Date(),
  });

  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleSubmit = () => {
    if (formData.amount <= 0 || !formData.categoryId || !formData.description) return;

    if (editingId) {
      updateIncome(editingId, formData);
    } else {
      addIncome(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ amount: 0, description: '', categoryId: '', date: new Date() });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setFormData({
        amount: income.amount,
        description: income.description,
        categoryId: income.categoryId,
        date: new Date(income.date),
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      deleteIncome(id);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ingresos</h2>
          <p className="text-muted-foreground">Gestiona tus ingresos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-success">
              ${totalIncome.toLocaleString()}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Icon icon="solar:add-circle-bold" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      <CardBox>
        {incomes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="solar:money-bag-bold" className="text-5xl mb-3 mx-auto opacity-30" />
            <p className="text-lg">No hay ingresos registrados</p>
            <p className="text-sm">Agrega tu primer ingreso usando el botón de arriba</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ borderColor: income.categoryColor, color: income.categoryColor }}>
                      {income.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(income.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    +${income.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(income.id)}>
                        <Icon icon="solar:pen-bold" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)} className="text-error hover:text-error">
                        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBox>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Ej: Pago de nómina"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
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
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              />
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

export default IncomeModule;
