import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, FileText } from 'lucide-react';
import type { Transcription } from '@/db/schema';

interface TranscriptionItemProps {
  transcription: Transcription & {
    formattedDate: string;
    statusColor: string;
  };
  onEdit?: (transcription: Transcription) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const TranscriptionItem = memo(function TranscriptionItem({
  transcription,
  onEdit,
  onDelete,
  showActions = true,
}: TranscriptionItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat?transcriptId=${transcription.transcriptId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(transcription);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(transcription.id);
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-white hover:bg-gray-750 transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:shadow-xl"
    >
      <div
        className="flex-1 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <FileText className="h-5 w-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate transition-colors">
              {transcription.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span className="font-medium">{transcription.formattedDate}</span>
              <span>•</span>
              <span className={`${transcription.statusColor} font-semibold`}>
                {transcription.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
