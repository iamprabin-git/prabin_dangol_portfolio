import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          404
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold">Page not found</h1>
        <Link href="/" className="mt-6 inline-block text-[var(--accent)]">
          Back home →
        </Link>
      </div>
    </div>
  );
}
