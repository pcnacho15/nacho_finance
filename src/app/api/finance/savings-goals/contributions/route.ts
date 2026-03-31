import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, amount, notes } = body;

    const contribution = await prisma.savingsContribution.create({
      data: {
        goalId,
        amount: Number(amount),
        date: new Date(),
        notes,
      },
    });

    const goal = await prisma.savingsGoal.findUnique({
      where: { id: goalId },
    });

    if (goal) {
      const newCurrentAmount = goal.currentAmount + Number(amount);
      const newStatus = newCurrentAmount >= goal.targetAmount ? 'completed' : goal.status;

      await prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount,
          status: newStatus,
        },
      });
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({ error: 'Error creating contribution' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Contribution ID required' }, { status: 400 });
    }
    await prisma.savingsContribution.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json({ error: 'Error deleting contribution' }, { status: 500 });
  }
}
