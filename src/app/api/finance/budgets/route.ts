import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Error fetching budgets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const budget = await prisma.budget.create({
      data: {
        categoryId: body.categoryId,
        categoryName: body.categoryName,
        categoryColor: body.categoryColor,
        amount: Number(body.amount),
        spent: 0,
        period: body.period,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: true,
      },
    });
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Error creating budget' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...data,
        amount: data.amount ? Number(data.amount) : undefined,
        spent: data.spent ? Number(data.spent) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Error updating budget' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Budget ID required' }, { status: 400 });
    }
    await prisma.budget.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Error deleting budget' }, { status: 500 });
  }
}
