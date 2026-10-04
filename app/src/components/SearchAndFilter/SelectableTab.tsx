import { forwardRef } from "react";

interface SelectableTabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  hover_bg_color?: string;
}


// This is the former SortTabs, I change the name because it has vast usage
const SelectableTab = forwardRef<HTMLButtonElement, SelectableTabProps>(
  
  ({ label, active = false, onClick, hover_bg_color="white/40"}, ref) => (
    
    <button
      ref={ref}
      onClick={onClick}
      className={`
        relative z-3 mx-1 px-6 py-2 fnt-h5 rounded-[24px]
        transition-all duration-100 ease-out whitespace-nowrap
        ${active
          ? "text-primary-400"
          : `text-(--better-black) hover:text-primary-400
              hover:bg-${hover_bg_color} hover:-translate-y-[1px]
              hover:scale-[1.03] hover:cursor-pointer`
        }
      `}
    >
      {label}
    </button>
    
  )
);

export default SelectableTab;
