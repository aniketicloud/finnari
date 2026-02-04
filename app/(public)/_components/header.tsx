export function Header() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-8">
          {/* TODO: Add logo */}
          <div className="text-xl font-semibold">Finnari</div>

          {/* TODO: Add navigation links */}
          <nav className="hidden items-center gap-6 md:flex">
            {/* Features, Pricing, About, etc. */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* TODO: Add theme toggle */}
          {/* TODO: Add CTA buttons (Sign In, Sign Up) */}
        </div>
      </div>
    </header>
  )
}
