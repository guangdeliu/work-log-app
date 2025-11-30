import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// 获取所有日志
export async function GET() {
  const logs = db.prepare('SELECT * FROM work_logs ORDER BY log_date DESC').all();
  return NextResponse.json(logs);
}

// 创建新日志
export async function POST(request: NextRequest) {
  const { log_date, content, source = 'manual' } = await request.json();
  
  const result = db.prepare(
    'INSERT INTO work_logs (log_date, content, source) VALUES (?, ?, ?)'
  ).run(log_date, content, source);
  
  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}

// 删除日志
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  db.prepare('DELETE FROM work_logs WHERE id = ?').run(id);
  
  return NextResponse.json({ success: true });
}

// 更新日志
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const { content } = await request.json();
  
  db.prepare('UPDATE work_logs SET content = ? WHERE id = ?').run(content, id);
  
  return NextResponse.json({ success: true });
}