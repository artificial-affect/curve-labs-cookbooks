'use client';
import { cn } from '@/src/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { type SubmitEvent, Fragment, useState } from 'react';
import { ApiAccessNote } from '@/app/components/api-access-note';
import type { ApiErrorResponse, QuickstartResponse } from '@/src/lib/types';
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from '@/components/ui/card';

type PromptPreset = { label: string; prompt: string };

const promptPresets: PromptPreset[] = [
  {
    label: 'Support',
    prompt: 'I rotated my API key and now every call to /api/v1/completions returns 401. What should I check first?',
  },
  {
    label: 'Companion',
    prompt: "Hey, I'm feeling really drained tonight and can't stop overthinking everything.",
  },
  {
    label: 'Creative',
    prompt: "I have an idea for a sci-fi story where all sound disappears overnight, but I don't know how to start.",
  },
  {
    label: 'Tutor',
    prompt: "I'm a beginner in Spanish. How do I order a coffee politely?",
  },
];

export function QuickstartForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState(promptPresets[0].prompt);
  const [result, setResult] = useState<QuickstartResponse | null>(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/quickstart', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        throw new Error(body.error.message);
      }

      const body = (await response.json()) as QuickstartResponse;
      setResult(body);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function applyPrompt(index: number) {
    setSelectedPromptIndex(index);
    setPrompt(promptPresets[index].prompt);
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span title="Quickstart icon" className="inline-flex">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          Quickstart
        </CardTitle>
        <CardDescription>
          <code className="font-mono text-xs">POST /api/quickstart</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <fieldset className="space-y-2">
            <legend className="mono-meta text-foreground">Use Cases</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Use-case prompts">
              {promptPresets.map((preset, index) => {
                const isSelected = selectedPromptIndex === index;

                return (
                  <Button
                    size="sm"
                    type="button"
                    key={preset.label}
                    aria-pressed={isSelected}
                    onClick={() => applyPrompt(index)}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn('justify-start px-2', !isSelected && 'bg-background')}
                  >
                    <span
                      className={cn(
                        'size-2 border',
                        isSelected ? 'border-primary-foreground bg-primary-foreground' : 'border-foreground/30 bg-transparent'
                      )}
                      aria-hidden="true"
                    />
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </fieldset>
          <ApiAccessNote />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="quickstart-prompt" className="text-sm font-medium">
                Prompt
              </Label>
              <span className="mono-meta">{prompt.trim().length}</span>
            </div>
            <Textarea
              rows={6}
              value={prompt}
              id="quickstart-prompt"
              placeholder="Enter prompt"
              aria-describedby="quickstart-prompt-help"
              onChange={event => setPrompt(event.target.value)}
            />
            <p id="quickstart-prompt-help" className="mono-meta text-[11px]">
              Completion call. Single response.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isLoading || !prompt.trim()} title="Generate completion">
              {isLoading ? (
                <Fragment>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Generate
                </Fragment>
              ) : (
                'Generate'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPrompt(promptPresets[selectedPromptIndex].prompt);
                setResult(null);
                setError('');
              }}
            >
              Reset
            </Button>
          </div>
        </form>
        {error || result ? (
          <div role="status" aria-live="polite" aria-atomic="true" className="space-y-3">
            {error ? (
              <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Error: {error}
              </p>
            ) : null}
            {result ? (
              <div className="border border-foreground/15 bg-secondary/20 p-4 animate-fade-in">
                <p className="mono-meta mb-2 text-[11px] text-foreground">Result</p>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Persona ID:</span> <code className="font-mono text-xs">{result.model}</code>
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6">{result.text}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
