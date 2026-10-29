interface CompoundWordLoaderProps {
  message?: string;
}

const WORD_PARTS = [
  { german: "Wort", english: "Word" },
  { german: "Schatz", english: "Treasure" },
  { german: "Test", english: "Test" },
] as const;

export default function CompoundWordLoader({
  message = "Generating your vocabulary questions...",
}: CompoundWordLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-col items-center gap-6 py-10"
    >
      {/* Heading */}
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Building your vocabulary quiz...
        </h2>

        <p className="text-sm text-[var(--muted)]">
          A little German word magic!
        </p>
      </div>

      {/* Animation container */}
      <div
        aria-hidden="true"
        className="relative flex min-h-36 w-full max-w-md
                   items-center justify-center overflow-hidden"
      >
        {/* Stage 1 and 2: Separate blocks move together */}
        <div className="compound-assembly flex items-center justify-center gap-1">
          {WORD_PARTS.map((part, index) => (
            <div
              key={part.german}
              className="flex items-center gap-1"
            >
              {index > 0 && (
                <span className="compound-plus text-base font-bold text-[var(--primary)]">
                  +
                </span>
              )}

              <div
                className={`
                  compound-word-block
                  compound-word-block-${index}
                  flex min-w-0 flex-col items-center
                  gap-1 rounded-xl border-2
                  border-[#CDE7D9] bg-[#E4F3EC]
                  px-3 py-3
                `}
              >
                <span className="text-sm font-bold text-[var(--primary)] sm:text-base">
                  {part.german}
                </span>

                <span className="text-[10px] text-[var(--muted)] sm:text-xs">
                  {part.english}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stage 3: Final compound word */}
        <div
          className="compound-result absolute inset-0
                     flex flex-col items-center justify-center
                     gap-2 text-center"
        >
          <div className="rounded-2xl border-2 border-[#CDE7D9] bg-[#E4F3EC] px-5 py-4">
            <p className="text-xl font-bold tracking-tight text-[var(--primary)] sm:text-2xl">
              Wortschatztest
            </p>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Vocabulary test
          </p>
        </div>
      </div>

      {/* Static loading message */}
      <p className="text-center text-sm font-medium text-[var(--muted)]">
        {message}
      </p>
    </div>
  );
}
