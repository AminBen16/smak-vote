import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getUserProfileFromToken, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
  const profile = await getUserProfileFromToken(token);
  if (!profile || profile.role !== 'admin') {
    return unauthorizedResponse();
  }

  const [students, votes, elections] = await Promise.all([
    supabaseServer.from('profiles').select('id', { count: 'exact' }),
    supabaseServer.from('votes').select('id', { count: 'exact' }),
    supabaseServer.from('elections').select('id, status')
  ]);

  return NextResponse.json({
    students: students.count ?? 0,
    votes: votes.count ?? 0,
    elections: elections.data ?? []
  });
}
