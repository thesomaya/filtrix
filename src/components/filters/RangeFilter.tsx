import "./RangeFilter.css";

export interface RangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  unit?: string;
  // Controls step size and display precision: "integer" steps by whole
  // numbers with no decimal shown; "decimal" (the default, for backward
  // compatibility with attributes that don't specify one) steps by tenths
  // and always shows one decimal place.
  numberType?: "integer" | "decimal";
  onChange: (next: [number, number]) => void;
}

export default function RangeFilter({
  min,
  max,
  value,
  unit = "",
  numberType = "decimal",
  onChange,
}: RangeFilterProps) {
  const [low, high] = value;
  const isInteger = numberType === "integer";
  const step = isInteger ? 1 : 0.1;

  // Round to the step's precision so dragging never accumulates
  // floating-point noise like 80.9939019785531.
  const round = (n: number) => (isInteger ? Math.round(n) : Math.round(n * 10) / 10);

  // Whole numbers show with no decimal; tenths always show one decimal
  // place (e.g. "4.0", not just "4") so the precision is visually clear.
  const format = (n: number) => (isInteger ? String(round(n)) : round(n).toFixed(1));

  // If the value is within one step of either edge, snap all the way to
// that edge. This covers ranges where (max - min) isn't a clean multiple
// of step, which otherwise leaves a sliver near min/max unreachable by
// dragging (e.g. min=0, max=10.3, step=1 can only reach 10, never 10.3).
const snapToEdge = (n: number) => {
  if (n - min < step) return min;
  if (max - n < step) return max;
  return n;
};

const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
  const next = Math.min(snapToEdge(round(Number(e.target.value))), high);
  onChange([next, high]);
};

const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
  const next = Math.max(snapToEdge(round(Number(e.target.value))), low);
  onChange([low, next]);
};

  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  // The two thumbs are separate, fully-overlapping <input type="range">
  // elements. Whichever renders second normally sits on top and "wins" any
  // click where the thumbs are close together or overlapping — which makes
  // the other thumb impossible to grab and drag back to its edge. Give
  // priority to whichever thumb has crossed into the other's half of the
  // track, since that's the one the user is actively trying to move.
  const midpoint = (min + max) / 2;
  const lowOnTop = low > midpoint;

  return (
    <div className="range-filter">
      <div className="range-filter__values">
        <span>
          {format(low)}
          {unit && ` ${unit}`}
        </span>
        <span>
          {format(high)}
          {unit && ` ${unit}`}
        </span>
      </div>
      <div className="range-filter__track-wrap">
        <div className="range-filter__track" />
        <div
          className="range-filter__fill"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLow}
          className="range-filter__input"
          style={{ zIndex: lowOnTop ? 2 : 1 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHigh}
          className="range-filter__input"
          style={{ zIndex: lowOnTop ? 1 : 2 }}
        />
      </div>
    </div>
  );
}