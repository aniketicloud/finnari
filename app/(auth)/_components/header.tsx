import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <SidebarTrigger />
        
        <div className="flex items-center gap-4">
          {/* TODO: Add theme toggle */}
          {/* TODO: Add notifications */}
          {/* TODO: Add user menu */}
        </div>
      </div>
    </header>
  )
}
