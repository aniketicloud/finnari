export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-8">
          {/* TODO: Add logo */}
          <div className="font-semibold text-xl">Finnari</div>
          
          {/* TODO: Add navigation links */}
          <nav className="hidden md:flex items-center gap-6">
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
