export function HeroSkeleton() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* title */}
        <div className="h-10 md:h-14 w-3/4 bg-muted rounded-lg animate-pulse mx-auto" />
        {/* tagline */}
        <div className="h-5 w-full max-w-3xl bg-muted rounded-lg animate-pulse mx-auto" />
        {/* buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="h-11 w-36 bg-muted rounded-md animate-pulse" />
          <div className="h-11 w-28 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}