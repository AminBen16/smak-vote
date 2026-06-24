import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { studentNumber } = await request.json();

  if (!studentNumber) {
    return NextResponse.json({ error: 'Student number is required.' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('profiles')
    .select('email')
    .eq('student_number', studentNumber)
    .single();

  if (error || !data?.email) {
    return NextResponse.json({ error: 'Student number not found.' }, { status: 404 });
  }

  return NextResponse.json({ email: data.email });
}
