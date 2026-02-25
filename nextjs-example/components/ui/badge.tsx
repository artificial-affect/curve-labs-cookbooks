import { cn } from '@/src/lib/utils';
import { type HTMLAttributes } from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4',
  {
    variants: {
      variant: {
        outline: 'text-foreground',
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
