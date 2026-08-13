import "./RangeFilter.css";

export interface RangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  unit?: string;
  onChange: (next: [number, number]) => void;
}

export default function RangeFilter({
  min,
  max,
  value,
  unit = "",
  onChange,
}: RangeFilterProps) {
  const [low, high] = value;

  // Round to 1 decimal place (matching the 0.1 step below) so dragging
  // never accumulates floating-point noise like 80.9939019785531.
  const round = (n: number) => Math.round(n * 10) / 10;

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(round(Number(e.target.value)), high);
    onChange([next, high]);
  };

  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(round(Number(e.target.value)), low);
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
          {round(low)}
          {unit && ` ${unit}`}
        </span>
        <span>
          {round(high)}
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
          step={0.1}
          value={low}
          onChange={handleLow}
          className="range-filter__input"
          style={{ zIndex: lowOnTop ? 2 : 1 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={high}
          onChange={handleHigh}
          className="range-filter__input"
          style={{ zIndex: lowOnTop ? 1 : 2 }}
        />
      </div>
    </div>
  );
}