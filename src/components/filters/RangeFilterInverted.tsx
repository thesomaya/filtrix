import "./RangeFilterInverted.css";

export interface RangeFilterInvertedProps {
  min: number; // the database minimum, e.g. -60
  max: number; // the database maximum, e.g. 90
  // [low, high]: low is always <= 0 (the "min & below" threshold, 0 = unset),
  // high is always >= 0 (the "max & above" threshold, 0 = unset). Both start
  // at 0, sitting on top of each other at the exact center of the track.
  value: [number, number];
  unit?: string;
  numberType?: "integer" | "decimal";
  active?: boolean;
  onChange: (next: [number, number]) => void;
}

export default function RangeFilterInverted({
  min,
  max,
  value,
  unit = "",
  numberType = "decimal",
  active,
  onChange,
}: RangeFilterInvertedProps) {
  const [low, high] = value;
  const isInteger = numberType === "integer";
  const step = isInteger ? 1 : 0.1;

  const round = (n: number) =>
    isInteger ? Math.round(n) : Math.round(n * 10) / 10;

  const format = (n: number) =>
    isInteger ? String(round(n)) : round(n).toFixed(1);

  // Snap to the true bound if within one step of it — same rationale as
  // the regular RangeFilter: covers bounds that aren't a clean multiple
  // of step, which otherwise leaves a sliver near min/max unreachable.
  const snapLow = (n: number) => (n - min < step ? min : n);
  const snapHigh = (n: number) => (max - n < step ? max : n);

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This half's native input range is [min, 0], so the raw value can
    // never be positive — just snap toward min and clamp at 0.
    const next = Math.min(snapLow(round(Number(e.target.value))), 0);
    onChange([next, high]);
  };

  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(snapHigh(round(Number(e.target.value))), 0);
    onChange([low, next]);
  };

  // Percentage across each half only (0% = center/zero, 100% = that
  // half's outer edge), used to size that half's fill bar.
  const leftFillPct = min < 0 ? ((0 - low) / (0 - min)) * 100 : 0;
  const rightFillPct = max > 0 ? (high / max) * 100 : 0;

  const isActive = active ?? (low < 0 || high > 0);

  const unitSuffix = unit ? ` ${unit}` : "";
  const lowLabel = low < 0 ? `${format(low)}${unitSuffix} & below` : "";
  const highLabel = high > 0 ? `${format(high)}${unitSuffix} & above` : "";

  return (
    <div
      className={`range-filter-inverted${
        isActive ? " range-filter-inverted--active" : ""
      }`}
    >
      <div className="range-filter-inverted__values">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      <div className="range-filter-inverted__track-wrap">
        {/* Left half: represents min .. 0 */}
        <div className="range-filter-inverted__half range-filter-inverted__half--left">
          <div className="range-filter-inverted__track" />
          <div
            className="range-filter-inverted__fill"
            style={{ right: 0, width: `${leftFillPct}%` }}
          />
          <input
            type="range"
            min={min}
            max={0}
            step={step}
            value={low}
            onChange={handleLow}
            className="range-filter-inverted__input"
          />
        </div>

        <div className="range-filter-inverted__center-mark" />

        {/* Right half: represents 0 .. max */}
        <div className="range-filter-inverted__half range-filter-inverted__half--right">
          <div className="range-filter-inverted__track" />
          <div
            className="range-filter-inverted__fill"
            style={{ left: 0, width: `${rightFillPct}%` }}
          />
          <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={high}
            onChange={handleHigh}
            className="range-filter-inverted__input"
          />
        </div>
      </div>

      <div className="range-filter-inverted__bounds">
        <span>{format(min)}{unitSuffix}</span>
        <span className="range-filter-inverted__zero">0</span>
        <span>{format(max)}{unitSuffix}</span>
      </div>
    </div>
  );
}
