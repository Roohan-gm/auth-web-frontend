export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, NextAuth, and Prisma. © 2024 AuthWeb. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy
          </a>
          <a href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms
          </a>
        </div>
      </div>
    </footer>
  )
}
