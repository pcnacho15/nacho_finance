import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson } from '@/lib/api-utils';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, registerSchema);
  if ('error' in parsed) return parsed.error;
  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });
    return json(user, { status: 201 });
  } catch (error) {
    return handleError('POST /api/auth/register', error);
  }
}
