import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChatClient } from '@/app/components/chat-client';

export default function ChatPage() {
  return (
    <Fragment>
      <header className="space-y-4 border-b border-foreground/15 pb-6">
        <p className="mono-meta">ThinkFeel Chat SDK Adaptation</p>
        <h1 className="text-balance font-serif text-3xl tracking-tighter sm:text-4xl">Multi-Turn Chat UI</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base font-[family-name:var(--font-geist-mono)]">
          Client state keeps every turn. Full history sent each request.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest">
            Multi-Turn Conversation
          </Badge>
        </div>
      </header>
      <ChatClient />
    </Fragment>
  );
}
