export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-6 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* TODO: Add footer columns */}
          <div>
            <h3 className="mb-4 font-semibold">Finnari</h3>
            {/* Company info, description */}
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            {/* Product links */}
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            {/* Company links */}
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            {/* Legal links */}
          </div>
        </div>

        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          {/* TODO: Add copyright and social links */}
          <p>&copy; {new Date().getFullYear()} Finnari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
