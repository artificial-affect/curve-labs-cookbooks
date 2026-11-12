'use client';
import { cn } from '@/src/lib/utils';
import { Root } from '@radix-ui/react-label';
import { type VariantProps, cva } from 'class-variance-authority';
import { type ElementRef, type ComponentPropsWithoutRef, forwardRef } from 'react';
const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');

const Label = forwardRef<ElementRef<typeof Root>, ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof labelVariants>>(
  function Label({ className, ...props }, ref) {
    return <Root ref={ref} data-slot="label" className={cn(labelVariants(), className)} {...props} />;
  }
);

export { Label };
