import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getUserProfileFromToken, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
  const profile = await getUserProfileFromToken(token);
  if (!profile || !['officer', 'admin'].includes(profile.role)) {
    return unauthorizedResponse();
  }

  const [verifiedStudents, managedPositions] = await Promise.all([
    supabaseServer.from('profiles').select('id', { count: 'exact' }).neq('role', 'admin'),
    supabaseServer.from('positions').select('id', { count: 'exact' })
  ]);

  return NextResponse.json({
    users: verifiedStudents.count ?? 0,
    positions: managedPositions.count ?? 0
  });
}
