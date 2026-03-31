import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.savingsGoal.findMany({
      include: {
        contributions: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return NextResponse.json({ error: 'Error fetching savings goals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goal = await prisma.savingsGoal.create({
      data: {
        name: body.name,
        targetAmount: Number(body.targetAmount),
        currentAmount: 0,
        targetDate: new Date(body.targetDate),
        status: 'in_progress',
        icon: body.icon,
        color: body.color,
        description: body.description,
      },
    });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return NextResponse.json({ error: 'Error creating savings goal' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...data,
        targetAmount: data.targetAmount ? Number(data.targetAmount) : undefined,
        currentAmount: data.currentAmount ? Number(data.currentAmount) : undefined,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return NextResponse.json({ error: 'Error updating savings goal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }
    await prisma.savingsGoal.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return NextResponse.json({ error: 'Error deleting savings goal' }, { status: 500 });
  }
}
