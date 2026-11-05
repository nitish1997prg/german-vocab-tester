
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { playSound } from "@/lib/sound-effects";
import { playHaptic } from "@/lib/haptics";

interface FloatingLetter {
  id: number;
  char: string;
  base: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  driftX: number;
  driftY: number;
  duration: number;
  generation: number;
  colors: string;
}

interface CatchBurst {
  id: number;
  x: number;
  y: number;
}

const INITIAL_LETTERS: FloatingLetter[] = [
  {
    id: 1, char: "Ä", base: "A",
    x: 18, y: 26, anchorX: 18, anchorY: 26,
    driftX: 14, driftY: 10, duration: 4.6,
    generation: 0,
    colors: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  },
  {
    id: 2, char: "Ö", base: "O",
    x: 50, y: 25, anchorX: 50, anchorY: 25,
    driftX: -17, driftY: 13, duration: 5.2,
    generation: 0,
    colors: "border-rose-500/50 bg-rose-500/10 text-rose-300",
  },
  {
    id: 3, char: "Ü", base: "U",
    x: 82, y: 26, anchorX: 82, anchorY: 26,
    driftX: -12, driftY: 16, duration: 4.9,
    generation: 0,
    colors: "border-blue-500/50 bg-blue-500/10 text-blue-300",
  },
  {
    id: 4, char: "ä", base: "a",
    x: 18, y: 73, anchorX: 18, anchorY: 73,
    driftX: 18, driftY: -14, duration: 5.5,
    generation: 0,
    colors: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300",
  },
  {
    id: 5, char: "ö", base: "o",
    x: 50, y: 74, anchorX: 50, anchorY: 74,
    driftX: -14, driftY: -13, duration: 4.4,
    generation: 0,
    colors: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  },
  {
    id: 6, char: "ü", base: "u",
    x: 82, y: 73, anchorX: 82, anchorY: 73,
    driftX: -17, driftY: -10, duration: 5.8,
    generation: 0,
    colors: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  },
];

// Helper function placed outside the component to satisfy purity rules
function getRandomPosition(anchorX: number, anchorY: number) {
  const newX = Math.max(
    13,
    Math.min(
      87,
      anchorX + (Math.random() - 0.5) * 14
    )
  );

  const newY = Math.max(
    17,
    Math.min(
      83,
      anchorY + (Math.random() - 0.5) * 16
    )
  );

  return { newX, newY };
}

interface UmlautCatcherLoaderProps {
  active: boolean;
}

export default function UmlautCatcherLoader({
  active,
}: UmlautCatcherLoaderProps) {
  const [letters, setLetters] = useState(INITIAL_LETTERS);
  const [caught, setCaught] = useState(0);
  const [burst, setBurst] = useState<CatchBurst | null>(null);

  const nextBurstId = useRef(0);
  const burstTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (burstTimer.current !== null) {
        window.clearTimeout(burstTimer.current);
      }
    };
  }, []);

  function handleCatch(letter: FloatingLetter) {
    if (!active) return;

    playSound("success");
    playHaptic("tap");

    setCaught((previous) => previous + 1);

    // Display a temporary +10 reward at the
    // letter's previous position.
    const burstId = ++nextBurstId.current;

    setBurst({
      id: burstId,
      x: letter.x,
      y: letter.y,
    });

    if (burstTimer.current !== null) {
      window.clearTimeout(burstTimer.current);
    }

    burstTimer.current = window.setTimeout(() => {
      setBurst(null);
      burstTimer.current = null;
    }, 450);

    // Respawn within the letter's own region
    const { newX, newY } = getRandomPosition(letter.anchorX, letter.anchorY);

    setLetters((previous) =>
      previous.map((item) =>
        item.id === letter.id
          ? {
              ...item,
              x: newX,
              y: newY,
              generation: item.generation + 1,
            }
          : item
      )
    );
  }

  return (
    <section
      aria-label="Umlaut Catcher loading game"
      aria-hidden={!active}
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-[var(--wm-canvas)]
        px-4 py-4
        transition-opacity duration-200
        motion-reduce:transition-none
        ${
          active
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }
      `}
    >
      <div
        className="
          flex max-h-dvh w-full max-w-md
          flex-col gap-4 overflow-y-auto
          rounded-2xl border
          border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          p-4 shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black tracking-widest text-amber-400">
              UMLAUT CATCHER
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Tap the floating German letters
            </p>
          </div>

          <div
            className="
              shrink-0 rounded-full
              border border-[var(--wm-border)]
              bg-[var(--wm-surface-raised)]
              px-3 py-2 text-xs
              font-bold text-amber-300
            "
          >
            ★ {caught * 10} pts
          </div>
        </div>

        {/* Interactive play area */}
        <div
          className="
            wm-umlaut-board
            relative h-[clamp(240px,44dvh,360px)]
            w-full shrink-0 overflow-hidden
            rounded-xl border
            border-[var(--wm-border)]
            bg-[#11151F]
            select-none
          "
          aria-label="Catch the umlauts"
        >
          {letters.map((letter) => {
            const motionStyle = {
              left: `${letter.x}%`,
              top: `${letter.y}%`,
              "--wm-drift-x": `${letter.driftX}px`,
              "--wm-drift-y": `${letter.driftY}px`,
              animationDuration: `${letter.duration}s`,
              animationDelay: `${-letter.id * 0.43}s`,
              animationPlayState: active
                ? "running"
                : "paused",
            } as CSSProperties;

            return (
              <div
                key={`${letter.id}-${letter.generation}`}
                className="wm-umlaut-drift absolute"
                style={motionStyle}
              >
                <button
                  type="button"
                  disabled={!active}
                  aria-label={`Catch ${letter.char}`}
                  onClick={() => handleCatch(letter)}
                  className={`
                    relative flex h-12 w-12
                    touch-manipulation
                    items-center justify-center
                    rounded-xl border
                    text-2xl font-black
                    shadow-lg backdrop-blur-sm
                    transition-transform duration-150
                    hover:scale-110
                    active:scale-90
                    motion-reduce:transition-none
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-amber-400
                    ${letter.colors}
                  `}
                >
                  {/* Decorative glowing umlaut dots */}
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute left-1/2 top-[6px]
                      flex -translate-x-1/2 gap-[5px]
                    "
                  >
                    <span
                      className="
                        h-[4px] w-[4px]
                        rounded-full bg-current
                        shadow-[0_0_7px_currentColor]
                      "
                    />
                    <span
                      className="
                        h-[4px] w-[4px]
                        rounded-full bg-current
                        shadow-[0_0_7px_currentColor]
                      "
                    />
                  </span>

                  <span aria-hidden="true" className="pt-1">
                    {letter.base}
                  </span>
                </button>
              </div>
            );
          })}

          {/* Temporary reward animation */}
          {burst && (
            <span
              key={burst.id}
              aria-hidden="true"
              className="
                wm-umlaut-burst
                pointer-events-none absolute
                z-10 text-sm font-black
                text-amber-300
              "
              style={{
                left: `${burst.x}%`,
                top: `${burst.y}%`,
              }}
            >
              +10
            </span>
          )}
        </div>

        {/* Real loading status */}
        <div
          className="space-y-2 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-gray-100">
            Preparing your challenge
            <span className="wm-umlaut-ellipsis">...</span>
          </p>

          <p className="text-xs leading-relaxed text-gray-400">
            Keep catching while your questions load.
          </p>
        </div>

        {/* Indeterminate indicator, not fake progress */}
        <div
          className="
            h-1.5 w-full overflow-hidden
            rounded-full bg-[#2A2F3D]
          "
          aria-hidden="true"
        >
          <div className="wm-umlaut-loading-bar h-full w-1/3 rounded-full bg-amber-400" />
        </div>

        <p className="text-center text-[11px] text-gray-500">
          Catcher points are just for fun!
        </p>
      </div>
    </section>
  );
}
