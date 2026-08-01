import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-3xl sm:text-4xl mb-3">
        MISSION LOST
      </h1>
      <p className="text-sm text-text-gray mb-2">
        Objective not found. The coordinates you requested don&apos;t match any known position.
      </p>
      <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-text-gray/50 mb-8">
        Error 404 — Return to Base
      </p>
      <Button variant="primary" size="md" href="/">
        Return to Base
      </Button>
    </div>
  );
}
