import React from "react";

interface TextInputFieldProps {
  titleText?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  titleText,
  value,
  onChange,
  placeholder = "Enter text",
  maxLength = 50,
}) => {
  return (
    <div className="w-full">
      {titleText && (
        <h3 className="block mb-1 text-sm font-bold text-primary-400">
          {titleText}
        </h3>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-primary-400 rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      <div className="text-right text-xs text-gray-500 mt-1">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default TextInputField;
