import * as React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-ink/10 bg-porcelain rounded-3xl border p-6 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardTitle = ({ children, className }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-ink font-serif text-xl', className)}>{children}</h3>
);

export const CardSub = ({ children, className }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-ash text-sm', className)}>{children}</p>
);
