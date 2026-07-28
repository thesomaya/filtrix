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

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), high);
    onChange([next, high]);
  };

  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), low);
    onChange([low, next]);
  };

  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  return (
    <div className="range-filter">
      <div className="range-filter__values">
        <span>
          {low}
          {unit}
        </span>
        <span>
          {high}
          {unit}
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
          value={low}
          onChange={handleLow}
          className="range-filter__input"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={handleHigh}
          className="range-filter__input"
        />
      </div>
    </div>
  );
}