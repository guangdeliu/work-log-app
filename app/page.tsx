'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    setLogs(data);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/logs?id=${id}`, { method: 'DELETE' });
    fetchLogs();
  };

  const handleEdit = (log: any) => {
    setEditingId(log.id);
    setEditContent(log.content);
  };

  const handleSave = async (id: number) => {
    await fetch(`/api/logs?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent })
    });
    setEditingId(null);
    fetchLogs();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📝 工作日志</h1>
        <Link href="/submit">
          <Button size="sm">新建日志</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {logs.map((log: any) => {
          return (
            <Card key={log.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium">
                    {log.log_date}
                  </CardTitle>
                  <Badge variant={log.source === 'git' ? 'secondary' : 'default'} className="text-xs">
                    {log.source}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                    编辑
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(log.id)}>
                    删除
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {editingId === log.id ? (
                  <div className="space-y-2">
                    <textarea 
                      className="w-full p-2 border rounded text-sm"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(log.id)}>保存</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{log.content}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}