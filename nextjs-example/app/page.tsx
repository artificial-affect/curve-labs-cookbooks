import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { QuickstartForm } from '@/app/components/quickstart-form';

export default function HomePage() {
  return (
    <Fragment>
      <header className="space-y-4 border-b border-foreground/15 pb-6">
        <p className="mono-meta">ThinkFeel AI SDK Cookbook</p>
        <h1 className="text-balance font-serif text-3xl tracking-tighter sm:text-4xl">
          Quickstart + Chat Adapter for ThinkFeel
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base font-[family-name:var(--font-geist-mono)]">
          Minimal UI. Strong focus states. ThinkFeel-first prompts.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest">
            Non-stream Completion Flow
          </Badge>
        </div>
      </header>
      <QuickstartForm />
    </Fragment>
  );
}
