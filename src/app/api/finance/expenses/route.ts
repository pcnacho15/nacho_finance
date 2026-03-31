import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expense = await prisma.expense.create({
      data: {
        amount: Number(body.amount),
        description: body.description,
        categoryId: body.categoryId,
        categoryName: body.categoryName,
        categoryColor: body.categoryColor,
        date: new Date(body.date),
        isRecurring: body.isRecurring || false,
        recurringFrequency: body.recurringFrequency,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Error creating expense' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date),
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Error updating expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }
    await prisma.expense.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Error deleting expense' }, { status: 500 });
  }
}
