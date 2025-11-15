import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  tag: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  const token = process.env.REVALIDATE_TOKEN;
  if (!token || !auth || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { tag, tags } = parsed.data;
  const all = [...(tag ? [tag] : []), ...(Array.isArray(tags) ? tags : [])];

  for (const t of all) {
    revalidateTag(t, 'max');
  }

  return NextResponse.json({ ok: true, count: all.length });
}
