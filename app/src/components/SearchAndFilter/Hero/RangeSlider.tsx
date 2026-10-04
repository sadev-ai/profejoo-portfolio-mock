import React, { useEffect, useState } from "react";

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  /** Controlled values */
  value?: [number, number];
  /** Default if uncontrolled */
  defaultValue?: [number, number];
  /** Emits { min, max } on change */
  onChange?: (range: { min: number; max: number }) => void;
  /** Optional formatter for labels */
  formatValue?: (v: number) => string;
  /** Optional title */
  titleText?: string;
};

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = [min, max],
  onChange,
  titleText,
}) => {
  const [internal, setInternal] = useState<[number, number]>(defaultValue);
  const range = value ?? internal;

  const minVal = Math.min(range[0], range[1]);
  const maxVal = Math.max(range[0], range[1]);
  const [minInput, setMinInput] = useState(() => `${minVal}`);
  const [maxInput, setMaxInput] = useState(() => `${maxVal}`);
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);

  const percent = (val: number) => ((val - min) / (max - min)) * 100;
  const leftPct = percent(minVal);
  const rightPct = percent(maxVal);
  const widthPct = Math.max(0, rightPct - leftPct);

  useEffect(() => {
    if (!isEditingMin) setMinInput(`${minVal}`);
    if (!isEditingMax) setMaxInput(`${maxVal}`);
  }, [isEditingMin, isEditingMax, minVal, maxVal]);

  const update = (next: [number, number]) => {
    if (value === undefined) setInternal(next);
    onChange?.({ min: next[0], max: next[1] });
  };

  const handleThumb = (index: 0 | 1, newVal: number) => {
    const clamped = Math.min(Math.max(newVal, min), max);
    const next: [number, number] =
      index === 0 ? [clamped, range[1]] : [range[0], clamped];
    if (next[0] > next[1]) next.reverse();
    update(next);
  };

  const commitMinInput = () => {
    let n = Number(minInput);
    if (Number.isNaN(n)) n = min;
    if (n < min) n = min;
    if (n > maxVal) n = maxVal;
    handleThumb(0, n);
  };

  const commitMaxInput = () => {
    let n = Number(maxInput);
    if (Number.isNaN(n)) n = max;
    if (n > max) n = max;
    if (n < minVal) n = minVal;
    handleThumb(1, n);
  };

  return (
    <div className="w-full">
      {titleText && (
        <h3 className="block mb-1 text-sm font-bold text-primary-400">
          {titleText}
        </h3>
      )}

      {/* Slider container */}
      <div className="relative w-full h-4">
        {/* Base track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-neutral-300" />

        {/* Selected range bar (no useEffect, no DOM mutation) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-primary-400"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />

        {/* Thumbs */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => handleThumb(0, Number(e.target.value))}
          className="
            absolute inset-x-0 top-1/2 -translate-y-1/2
            h-4 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-primary-400
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--tertiary-100)
            [&::-moz-range-thumb]:pointer-events:auto
            [&::-moz-range-thumb]:appearance:none
            [&::-moz-range-thumb]:width:1rem [&::-moz-range-thumb]:height:1rem
            [&::-moz-range-thumb]:background:var(--primary-400)
            [&::-moz-range-thumb]:border:2px solid white
            [&::-moz-range-thumb]:border-radius:9999px
            [&::-moz-range-track]:background:transparent
            [&::-moz-range-track]:height:0
          "
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => handleThumb(1, Number(e.target.value))}
          className="
            absolute inset-x-0 top-1/2 -translate-y-1/2
            h-4 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-primary-400
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--tertiary-100)
            [&::-moz-range-thumb]:pointer-events:auto
            [&::-moz-range-thumb]:appearance:none
            [&::-moz-range-thumb]:width:1rem [&::-moz-range-thumb]:height:1rem
            [&::-moz-range-thumb]:background:var(--primary-400)
            [&::-moz-range-thumb]:border:2px solid white
            [&::-moz-range-thumb]:border-radius:9999px
            [&::-moz-range-track]:background:transparent
            [&::-moz-range-track]:height:0
          "
        />
      </div>

      {/* Editable labels (below, not covered) */}
      <div className="flex justify-between items-center mt-2 text-sm font-semibold text-gray-800">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-xs">Min:</span>
          <input
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onFocus={() => setIsEditingMin(true)}
            onBlur={() => {
              commitMinInput();
              setIsEditingMin(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-20 border border-gray-300 rounded-md px-2 py-0.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-xs">Max:</span>
          <input
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onFocus={() => setIsEditingMax(true)}
            onBlur={() => {
              commitMaxInput();
              setIsEditingMax(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-20 border border-gray-300 rounded-md px-2 py-0.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
