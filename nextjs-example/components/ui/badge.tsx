import { cn } from '@/src/lib/utils';
import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4',
  {
    variants: {
      variant: {
        outline: 'text-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  }
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
