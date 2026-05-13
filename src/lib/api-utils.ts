import { NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { ZodError, ZodType } from 'zod';
import { auth } from '@/auth';

export async function requireUser(): Promise<{ userId: string } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: 'Validación fallida', issues: result.error.issues },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}

export function requireId(request: Request): { id: string } | { error: NextResponse } {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return { error: NextResponse.json({ error: 'id requerido' }, { status: 400 }) };
  }
  return { id };
}

export function handleError(scope: string, error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Validación fallida', issues: error.issues }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 });
    }
  }
  console.error(`[${scope}]`, error);
  return NextResponse.json({ error: 'Error interno' }, { status: 500 });
}

type DecimalLike = { toNumber: () => number };

function isDecimal(value: unknown): value is DecimalLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as DecimalLike).toNumber === 'function' &&
    value.constructor?.name === 'Decimal'
  );
}

export function serialize<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (isDecimal(value)) return value.toNumber() as unknown as T;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => serialize(item)) as unknown as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serialize(val);
    }
    return out as T;
  }
  return value;
}

export function json<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(serialize(data), init);
}
