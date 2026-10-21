import React from 'react';

interface ClayButtonProps {
  children?: React.ReactNode;
  text?: string;
  onClick?: () => void;
  color?: string;
  shadowColor?: string;
  textColor?: string;
  depth?: number;
  fontSize?: number | string;
  isExpanded?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  text,
  onClick,
  color = '#0284C7',
  shadowColor = '#0369A1',
  textColor = '#FFFFFF',
  depth = 5,
  fontSize = 16,
  isExpanded = false,
  disabled = false,
  icon,
  className = '',
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: color,
        color: textColor,
        boxShadow: disabled
          ? 'none'
          : `0 ${depth}px 0 0 ${shadowColor}, 0 ${depth + 4}px 12px rgba(0,0,0,0.15)`,
        fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
      }}
      className={`clay-btn font-extrabold tracking-wide rounded-2xl px-6 py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
        isExpanded ? 'w-full' : 'w-auto'
      } ${className}`}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {text || children}
    </button>
  );
};
