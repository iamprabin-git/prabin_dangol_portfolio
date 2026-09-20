export function Stars({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const className = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--accent)]" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= Math.round(value);
        return (
          <svg key={index} viewBox="0 0 16 16" className={className} aria-hidden>
            <path
              d="M8 1.6 9.9 5.5l4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 1.8.7-4.3-3.1-3 4.3-.6L8 1.6Z"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        );
      })}
    </span>
  );
}
