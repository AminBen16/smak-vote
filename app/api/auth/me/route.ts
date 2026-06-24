import { NextResponse } from 'next/server';
import { getUserProfileFromToken, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
  const profile = await getUserProfileFromToken(token);
  if (!profile) {
    return unauthorizedResponse();
  }
  return NextResponse.json({ id: profile.id, role: profile.role });
}
