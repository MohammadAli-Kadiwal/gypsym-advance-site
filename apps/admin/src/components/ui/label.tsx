import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => (
    <label
      ref={ref}
      className={`text-xs font-semibold text-slate-700 dark:text-slate-200 select-none ${className}`}
      {...props}
    />
  )
);
Label.displayName = 'Label';
