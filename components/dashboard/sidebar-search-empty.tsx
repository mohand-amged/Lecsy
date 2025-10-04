import { Search } from "lucide-react"

export function SidebarSearchEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <Search className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-sm font-semibold text-foreground mb-2">No results found</h3>
      <p className="text-xs text-muted-foreground px-4">Try adjusting your search terms</p>
    </div>
  )
}