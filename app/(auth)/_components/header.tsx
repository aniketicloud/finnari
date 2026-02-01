import { ModeSwitcher } from "@/components/theme/mode-switcher"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <SidebarTrigger />

        <div className="flex items-center gap-4">
          <ModeSwitcher />
          {/* TODO: Add notifications */}
          {/* TODO: Add user menu */}
        </div>
      </div>
    </header>
  )
}
