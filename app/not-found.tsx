// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-lg">
        {/* Big western decorative number */}
        <p className="text-[120px] leading-none font-bold text-primary/20 select-none">
          404
        </p>

        {/* Divider with stars */}
        <div className="flex items-center justify-center gap-3 my-4">
          <span className="text-primary/40 text-lg">✦</span>
          <div className="h-px w-16 bg-border" />
          <span className="text-primary/40 text-lg">✦</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-wide uppercase">
          Whoa there, partner!
        </h1>

        {/* Subheading */}
        <p className="text-muted-foreground text-base mb-2">
          Sorry — this page could not be found.
        </p>

        {/* Flavor text */}
        <p className="text-muted-foreground/70 text-sm italic mb-8">
          Looks like dev is takin&rsquo; a nap on the haystacks.
          <br />
          Ride back home and we&rsquo;ll rustle somethin&rsquo; up for ya.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">Head Back to the Ranch</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/shop">Browse the Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}