import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabaseServer } from '@/lib/supabaseServer';

interface ElectionRow {
  id: string;
  title: string;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface TurnoutRow {
  class_name: string;
  registered_students: number;
  votes_cast: number;
  turnout_percentage: number;
}

export async function GET() {
  const [{ data: elections }, { data: turnout }] = await Promise.all([
    supabaseServer.from('elections').select('id, title, status, start_time, end_time, created_at'),
    supabaseServer.rpc('election_turnout_report')
  ]);

  const electionRows = ((elections as ElectionRow[] | null) ?? []).map((election) => ({
    'Election ID': election.id,
    Title: election.title,
    Status: election.status,
    'Start Time': election.start_time,
    'End Time': election.end_time,
    'Created At': election.created_at
  }));

  const sheet = XLSX.utils.json_to_sheet(electionRows, {
    header: ['Election ID', 'Title', 'Status', 'Start Time', 'End Time', 'Created At']
  });

  const turnoutSection: (string | number)[][] = [[], ['Turnout Summary'], ['Class', 'Registered Students', 'Votes Cast', 'Turnout Percentage']];
  if (Array.isArray(turnout)) {
    (turnout as TurnoutRow[]).forEach((row) => {
      turnoutSection.push([row.class_name, row.registered_students, row.votes_cast, row.turnout_percentage]);
    });
  }
  XLSX.utils.sheet_add_aoa(sheet, turnoutSection, { origin: -1 });
  sheet['!cols'] = [{ wch: 24 }, { wch: 40 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 24 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Election Report');

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="election-report.xlsx"'
    }
  });
}
