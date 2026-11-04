import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${sizeClasses} rounded-full border-zinc-700 border-t-emerald-500 animate-spin`}
      />
      {text && <p className="text-xs text-zinc-400 font-medium animate-pulse">{text}</p>}
    </div>
  );
};
