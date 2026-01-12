interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function ScrollArea({ children, className = '', maxHeight = '400px' }: ScrollAreaProps) {
  return (
    <div
      className={`overflow-y-auto custom-scrollbar ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
