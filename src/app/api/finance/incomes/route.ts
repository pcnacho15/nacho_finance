import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ error: 'Error fetching incomes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const income = await prisma.income.create({
      data: {
        amount: Number(body.amount),
        description: body.description,
        categoryId: body.categoryId,
        categoryName: body.categoryName,
        categoryColor: body.categoryColor,
        date: new Date(body.date),
      },
    });
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Error creating income' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const income = await prisma.income.update({
      where: { id },
      data: {
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date),
      },
    });
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json({ error: 'Error updating income' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Income ID required' }, { status: 400 });
    }
    await prisma.income.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ error: 'Error deleting income' }, { status: 500 });
  }
}
