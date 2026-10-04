import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface MultiSelectComboBoxProps {
  options: string[];
  placeholder?: string;
  value?: string[]; // controlled from parent
  onChange?: (values: string[]) => void;
  className?: string;
  maxSelected?: number; // maximum number of selections allowed
  titleText?: string; // lable above the box
}

const MultiSelectComboBox: React.FC<MultiSelectComboBoxProps> = ({
  options,
  placeholder = "Select...",
  value,
  onChange,
  className = "", // for customization!
  maxSelected=5,
  titleText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filtered, setFiltered] = useState<string[]>(options);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled / internal state
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selected = value ?? internalSelected;

  const atMax =
    typeof maxSelected === "number" ? selected.length >= maxSelected : false;

  // Filter options with prioritization and locale-aware sorting
  useEffect(() => {
    const lower = inputValue.toLowerCase();

    const localeCompare = (a: string, b: string) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
        numeric: true,
      });

    if (!lower.trim()) {
      setFiltered(
        options
          .filter((opt) => !selected.includes(opt))
          .sort(localeCompare)
      );
      return;
    }

    const startsWith = options
      .filter(
        (opt) =>
          opt.toLowerCase().startsWith(lower) && !selected.includes(opt)
      )
      .sort(localeCompare);

    const includes = options
      .filter(
        (opt) =>
          !opt.toLowerCase().startsWith(lower) &&
          opt.toLowerCase().includes(lower) &&
          !selected.includes(opt)
      )
      .sort(localeCompare);

    setFiltered([...startsWith, ...includes]);
  }, [inputValue, selected, options]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSelection = (newSelection: string[]) => {
    if (value === undefined) setInternalSelected(newSelection);
    if (onChange) onChange(newSelection);
  };

  const addItem = (item: string) => {
    if (selected.includes(item) || atMax) return;
    updateSelection([...selected, item]);
    setInputValue("");
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const removeItem = (item: string) => {
    const newSel = selected.filter((s) => s !== item);
    updateSelection(newSel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions && filtered.length > 0) setShowSuggestions(true);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered.length > 0) {
          const target =
            activeIndex >= 0 ? filtered[activeIndex] : filtered[0];
          if (target) addItem(target);
        }
        break;
      case "Backspace":
        if (inputValue === "" && selected.length > 0) {
          const last = selected[selected.length - 1];
          removeItem(last);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {titleText && (
        <h3 className="block mb-1 text-sm font-bold text-primary-400">
          {titleText}
        </h3>
      )}

      <div ref={containerRef} className="relative w-full">
        <div className="flex flex-wrap items-center gap-1 p-1 border border-primary-400 rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
          {selected.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 px-2 py-1 bg-(--tertiary-100)/60 text-primary-400-foreground rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                className="hover:text-destructive"
                onClick={() => removeItem(item)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <Input
            value={inputValue}
            placeholder={
              selected.length === 0
                ? placeholder
                : atMax
                ? `Max ${maxSelected} selected`
                : ""
            }
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            disabled={atMax}
            className="flex-1 border-none shadow-none focus-visible:ring-0"
          />
        </div>

        {showSuggestions && filtered.length > 0 && (
          <Card className="absolute mt-1 w-full max-h-60 overflow-auto z-5 shadow-lg">
            {filtered.map((option, idx) => (
              <div
                key={option}
                className={`cursor-pointer px-3 py-2 text-sm rounded ${
                  idx === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
                onMouseDown={() => addItem(option)}
              >
                {option}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiSelectComboBox;
