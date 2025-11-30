import { NextRequest, NextResponse } from 'next/server';
import { getGitLogs, formatGitLogsToContent } from '@/lib/git-parser';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { repoPath, author, days = 7 } = await request.json();
    
    const gitLogs = await getGitLogs(repoPath, author, days);
    const formatted = formatGitLogsToContent(gitLogs);
    
    let imported = 0;
    let skipped = 0;
    
    // 检查是否已存在
    const checkStmt = db.prepare(
      'SELECT COUNT(*) as count FROM work_logs WHERE log_date = ? AND source = ?'
    );
    
    const insertStmt = db.prepare(
      'INSERT INTO work_logs (log_date, content, source) VALUES (?, ?, ?)'
    );
    
    formatted.forEach(({ date, content }) => {
      const result = checkStmt.get(date, 'git') as { count: number };
      
      if (result.count === 0) {
        insertStmt.run(date, content, 'git');
        imported++;
      } else {
        skipped++;
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      imported,
      skipped
    });
  } catch (error) {
    console.error('Git 导入错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}