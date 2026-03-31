import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { debtId, amount, notes } = body;

    const payment = await prisma.debtPayment.create({
      data: {
        debtId,
        amount: Number(amount),
        date: new Date(),
        notes,
      },
    });

    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
    });

    if (debt) {
      const newCurrentAmount = Math.max(0, debt.currentAmount - Number(amount));
      const newPaidAmount = debt.paidAmount + Number(amount);
      const newStatus = newCurrentAmount <= 0 ? 'paid' : debt.status;

      await prisma.debt.update({
        where: { id: debtId },
        data: {
          currentAmount: newCurrentAmount,
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Error creating payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }
    await prisma.debtPayment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Error deleting payment' }, { status: 500 });
  }
}
