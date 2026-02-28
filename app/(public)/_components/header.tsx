import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-8">
          {/* TODO: Add logo */}
          <Link href="/" className="text-xl font-semibold">
            Finnari
          </Link>

          {/* TODO: Add navigation links */}
          <nav className="hidden items-center gap-6 md:flex">
            {/* Features, Pricing, About, etc. */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* TODO: Add theme toggle */}
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
