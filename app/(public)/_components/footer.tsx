export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* TODO: Add footer columns */}
          <div>
            <h3 className="font-semibold mb-4">Finnari</h3>
            {/* Company info, description */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            {/* Product links */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            {/* Company links */}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            {/* Legal links */}
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {/* TODO: Add copyright and social links */}
          <p>&copy; {new Date().getFullYear()} Finnari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
