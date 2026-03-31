import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const debts = await prisma.debt.findMany({
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(debts);
  } catch (error) {
    console.error('Error fetching debts:', error);
    return NextResponse.json({ error: 'Error fetching debts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const debt = await prisma.debt.create({
      data: {
        name: body.name,
        type: body.type,
        creditor: body.creditor,
        originalAmount: Number(body.originalAmount),
        currentAmount: Number(body.currentAmount),
        interestRate: Number(body.interestRate),
        monthlyPayment: Number(body.monthlyPayment),
        startDate: new Date(body.startDate),
        dueDate: new Date(body.dueDate),
        notes: body.notes,
        status: 'active',
        paidAmount: 0,
      },
    });
    return NextResponse.json(debt);
  } catch (error) {
    console.error('Error creating debt:', error);
    return NextResponse.json({ error: 'Error creating debt' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...data,
        originalAmount: Number(data.originalAmount),
        currentAmount: Number(data.currentAmount),
        interestRate: Number(data.interestRate),
        monthlyPayment: Number(data.monthlyPayment),
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
      },
    });
    return NextResponse.json(debt);
  } catch (error) {
    console.error('Error updating debt:', error);
    return NextResponse.json({ error: 'Error updating debt' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Debt ID required' }, { status: 400 });
    }
    await prisma.debt.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting debt:', error);
    return NextResponse.json({ error: 'Error deleting debt' }, { status: 500 });
  }
}
