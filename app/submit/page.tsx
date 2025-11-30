'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GIT_CONFIG } from '@/lib/config';

export default function SubmitPage() {
  const router = useRouter();
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [repoPath, setRepoPath] = useState(GIT_CONFIG.defaultRepoPath);
  const [author, setAuthor] = useState(GIT_CONFIG.defaultAuthor);
  const [days, setDays] = useState(GIT_CONFIG.defaultDays);
  const [importing, setImporting] = useState(false);
  
  const handleSubmit = async () => {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_date: logDate, content })
    });
    router.push('/');
  };
  
  const handleGitImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/git-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath, author, days })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`成功导入 ${data.imported} 条日志，跳过 ${data.skipped || 0} 条已存在的日志`);
        router.push('/');
      } else {
        alert(data.error || '导入失败');
      }
    } catch (error) {
      alert('导入失败，请检查路径和配置');
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">新建工作日志</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>手动输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="date" 
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
          />
          <Textarea 
            placeholder="今天完成了什么工作？"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleSubmit} className="w-full">提交日志</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>从 Git 导入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Git 仓库路径</label>
            <Input 
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">作者名称</label>
            <Input 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">导入最近几天</label>
            <Input 
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
          <Button 
            onClick={handleGitImport} 
            variant="secondary" 
            className="w-full"
            disabled={importing}
          >
            {importing ? '导入中...' : '导入 Git 提交记录'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}