'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { NavBar } from "@/app/dashboard/components/NavBar";
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
import { FileAudio, Edit2, Trash2, Loader2, FileText, History } from 'lucide-react';
import type { Transcription } from '@/db/schema';
import { toast } from 'sonner';

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      }
    }
  }, [session, isPending, router]);

  const fetchTranscriptions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (session) {
      fetchTranscriptions();
    }
  }, [session, fetchTranscriptions]);

  const handleRename = useCallback(async () => {
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
        toast.success('Name updated');
      } else {
        toast.error('Failed to rename');
      }
    } catch (error) {
      console.error('Failed to rename transcription:', error);
      toast.error('Failed to rename');
    } finally {
      setIsRenaming(false);
    }
  }, [editingId, editName, fetchTranscriptions]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcription?')) return;

    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTranscriptions();
        toast.success('Transcription deleted');
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete transcription:', error);
    }
  }, [fetchTranscriptions]);

  const openRenameDialog = useCallback((transcription: Transcription) => {
    setEditingId(transcription.id);
    setEditName(transcription.name);
  }, []);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const transcriptionsWithFormattedDates = useMemo(
    () => transcriptions.map(trans => ({
      ...trans,
      formattedDate: formatDate(trans.createdAt.toString()),
      statusColor: getStatusColor(trans.status)
    })),
    [transcriptions, formatDate, getStatusColor]
  );

  if (isPending || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <History className="h-8 w-8 mr-3" />
            Upload History
          </h1>
          <p className="text-gray-400">View and manage all your transcriptions</p>
        </div>

        {/* History Card */}
        <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-700 bg-gray-900">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg mr-3">
                  <FileAudio className="h-5 w-5 text-black" />
                </div>
                <div>
                  <span className="text-xl font-bold">All Transcriptions</span>
                  <p className="text-sm text-gray-400 font-normal mt-1">
                    {transcriptions.length} total recordings 🎵
                  </p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : transcriptions.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-gray-800 rounded-full mb-4">
                  <FileAudio className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-gray-300 mb-2 font-semibold text-lg">No recordings yet</p>
                <p className="text-sm text-gray-400 mb-4">Your transcription history will appear here ✨</p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Upload Your First Audio
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {transcriptionsWithFormattedDates.map((trans) => (
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
                            <span className="font-medium">{trans.formattedDate}</span>
                            <span>•</span>
                            <span className={`${trans.statusColor} font-semibold`}>{trans.status}</span>
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
      </div>
    </div>
  );
}


export const dynamic = 'force-dynamic';

export const runtime = 'edge';