import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getGitLogs(repoPath: string, author: string, days: number = 7) {
  try {
    const since = `${days}.days.ago`;
    const command = `git -C "${repoPath}" log --author="${author}" --since="${since}" --pretty=format:"%h|%an|%ad|%s" --date=short`;
    
    const { stdout } = await execAsync(command);
    
    if (!stdout) {
      return [];
    }
    
    const logs = stdout.split('\n').filter(line => line).map(line => {
      const [hash, author, date, message] = line.split('|');
      return { hash, author, date, message };
    });
    
    return logs;
  } catch (error) {
    console.error('Git log 读取失败:', error);
    return [];
  }
}

export function formatGitLogsToContent(logs: any[]) {
  const groupedByDate = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, any[]>);
  
  return Object.entries(groupedByDate).map(([date, commits]) => {
    const content = commits.map(c => `- ${c.message} (${c.hash})`).join('\n');
    return { date, content };
  });
}