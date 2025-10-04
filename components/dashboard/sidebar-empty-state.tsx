import { FileAudio } from "lucide-react"

export function SidebarEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
        <FileAudio className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-2">No transcriptions yet</h3>
      <p className="text-xs text-muted-foreground mb-4 px-4">Upload your first recording to get started</p>
    </div>
  )
}