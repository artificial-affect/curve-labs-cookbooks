'use client';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ApiAccessNote } from '@/app/components/api-access-note';
import { Loader2Icon, MessageCircleMore, RotateCcw, Send } from 'lucide-react';
import type { ApiErrorResponse, ChatMessage, ChatResponse } from '@/src/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SubmitEvent, type KeyboardEvent, useRef, useMemo, Fragment, useState, useEffect } from 'react';

type Turn = ChatMessage & { id: string };
type PromptPreset = { label: string; message: string };

const createTurnId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);

const starterMessages: PromptPreset[] = [
  {
    label: 'Support',
    message: "I rotated my API key and now every request returns 401. Can you help me figure out what's wrong?",
  },
  {
    label: 'Companion',
    message: "I've been feeling really anxious all day and can't seem to calm down.",
  },
  {
    label: 'Creative',
    message: "I have a story idea about a city where all sound disappears overnight, but I'm stuck on the opening.",
  },
  {
    label: 'Tutor',
    message: "I'm new to French. How would I order a coffee politely?",
  },
];

export function ChatClient() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStarterIndex, setSelectedStarterIndex] = useState<number>(0);
  const [messages, setMessages] = useState<Turn[]>([]);

  const formRef = useRef<HTMLFormElement>(null);
  const transcriptRef = useRef<HTMLUListElement>(null);
  const transcript = useMemo(() => messages, [messages]);
  const hasTranscriptContent = transcript.length > 0 || isLoading;

  useEffect(() => {
    const element = transcriptRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [transcript.length, isLoading]);

  async function sendMessage(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const outgoingTurn: Turn = { id: createTurnId(), role: 'user', content: input.trim() };
    const history = [...messages, outgoingTurn];

    setMessages(history);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        throw new Error(body.error.message);
      }

      const body = (await response.json()) as ChatResponse;
      setMessages(previous => [...previous, { id: createTurnId(), role: 'assistant', content: body.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetConversation() {
    setMessages([]);
    setInput(starterMessages[selectedStarterIndex].message);
    setError('');
  }

  function useStarterMessage(index: number) {
    setSelectedStarterIndex(index);
    setInput(starterMessages[index].message);
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span title="Chat icon" className="inline-flex">
            <MessageCircleMore className="size-5" aria-hidden="true" />
          </span>
          Chat
        </CardTitle>
        <CardDescription>Multi-turn state stays in the client. Full history sent on each non-stream request.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="mono-meta text-foreground">Use Cases</legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Starter messages">
            {starterMessages.map((starter, index) => {
              const isSelected = selectedStarterIndex === index;

              return (
                <Button
                  size="sm"
                  type="button"
                  key={starter.label}
                  aria-pressed={isSelected}
                  onClick={() => useStarterMessage(index)}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn('px-2', !isSelected && 'bg-background')}
                >
                  <span
                    className={cn(
                      'size-2 border',
                      isSelected ? 'border-primary-foreground bg-primary-foreground' : 'border-foreground/30 bg-transparent'
                    )}
                    aria-hidden="true"
                  />
                  {starter.label}
                </Button>
              );
            })}
          </div>
        </fieldset>
        <ApiAccessNote />
        {hasTranscriptContent ? (
          <div className="overflow-hidden overscroll-none border border-foreground/15 bg-background">
            <ul
              aria-live="polite"
              ref={transcriptRef}
              aria-relevant="additions text"
              className="max-h-[28rem] space-y-4 overflow-y-auto overscroll-none p-4"
            >
              {transcript.map(message => {
                const isAssistant = message.role === 'assistant';

                return (
                  <li key={message.id} className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}>
                    <article
                      className={cn(
                        'max-w-[88%] space-y-2 border px-3 py-2 animate-fade-in',
                        isAssistant
                          ? 'border-foreground/15 bg-secondary/30 text-foreground'
                          : 'border-foreground bg-foreground text-background'
                      )}
                    >
                      <header className="flex items-center gap-2">
                        <Badge
                          variant={isAssistant ? 'secondary' : 'outline'}
                          className="font-mono text-[10px] tracking-widest"
                        >
                          {isAssistant ? 'Assistant' : 'You'}
                        </Badge>
                      </header>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                    </article>
                  </li>
                );
              })}
              {isLoading ? (
                <li className="flex justify-start" role="status" aria-label="Assistant is responding">
                  <div className="inline-flex items-center gap-2 border border-foreground/15 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                    Thinking
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        <form ref={formRef} className="space-y-4" onSubmit={sendMessage}>
          <div className="space-y-1.5">
            <label htmlFor="chat-input" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              rows={4}
              value={input}
              id="chat-input"
              disabled={isLoading}
              onKeyDown={onComposerKeyDown}
              aria-describedby="chat-input-help"
              placeholder="Enter sends. Shift+Enter newline."
              onChange={event => setInput(event.target.value)}
            />
            <p id="chat-input-help" className="mono-meta text-[11px]">
              Multi-turn with local message state.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isLoading || !input.trim()} title="Send message">
              {isLoading ? (
                <Fragment>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                  Send
                </Fragment>
              ) : (
                <Fragment>
                  <Send className="size-4" aria-hidden="true" />
                  Send
                </Fragment>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetConversation} title="Reset conversation">
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </form>
        {error ? (
          <div role="status" aria-live="polite" aria-atomic="true">
            <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Error: {error}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
