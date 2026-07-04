import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { PersonifyForm } from '@/app/components/personify-form';

export default function PersonifyPage() {
  return (
    <Fragment>
      <header className="space-y-4 border-b border-foreground/15 pb-6">
        <p className="mono-meta">ThinkFeel Personify API</p>
        <h1 className="text-balance font-serif text-3xl tracking-tighter sm:text-4xl">Personify Raw Replies</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base font-[family-name:var(--font-geist-mono)]">
          Rewrite base responses through the native ThinkFeel endpoint.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest">
            Native Personify Flow
          </Badge>
        </div>
      </header>
      <PersonifyForm />
    </Fragment>
  );
}
