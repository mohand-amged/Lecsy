'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileAudio, Edit2, Trash2, Loader2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Transcription } from '@/db/schema';

export function RecentRecordings() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const router = useRouter();

  const fetchTranscriptions = async () => {
    try {
      const response = await fetch('/api/transcriptions');
      if (response.ok) {
        const data = await response.json();
        setTranscriptions(data.transcriptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const handleRename = async () => {
    if (!editingId || !editName.trim()) return;

    setIsRenaming(true);
    try {
      const response = await fetch(`/api/transcriptions/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        await fetchTranscriptions();
        setEditingId(null);
        setEditName('');
      }
    } catch (error) {
      console.error('Failed to rename transcription:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcription?')) return;

    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTranscriptions();
      }
    } catch (error) {
      console.error('Failed to delete transcription:', error);
    }
  };

  const openRenameDialog = (transcription: Transcription) => {
    setEditingId(transcription.id);
    setEditName(transcription.name);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
      case 'queued':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <>
      <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-700 bg-gray-900">
          <CardTitle className="flex items-center text-white">
            <div className="p-2 bg-white rounded-lg mr-3">
              <FileAudio className="h-5 w-5 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold">Recent Recordings</span>
              <p className="text-sm text-gray-400 font-normal mt-1">Your latest transcriptions 🎵</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : transcriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-800 rounded-full mb-4">
                <FileAudio className="h-12 w-12 text-gray-500" />
              </div>
              <p className="text-gray-300 mb-2 font-semibold text-lg">No recordings yet</p>
              <p className="text-sm text-gray-400">Your transcription history will appear here ✨</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {transcriptions.slice(0, 10).map((trans) => (
                <div
                  key={trans.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-white hover:bg-gray-750 transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/chat?transcriptId=${trans.transcriptId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <FileText className="h-5 w-5 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate transition-colors">{trans.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="font-medium">{formatDate(trans.createdAt.toString())}</span>
                          <span>•</span>
                          <span className={`${getStatusColor(trans.status)} font-semibold`}>{trans.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(trans);
                      }}
                      className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(trans.id);
                      }}
                      className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={editingId !== null} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Rename Transcription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for this transcription.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Transcription name"
            className="bg-black border-gray-700 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingId(null)}
              className="border-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !editName.trim()}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
