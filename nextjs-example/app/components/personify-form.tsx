'use client';
import { cn } from '@/src/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, WandSparkles } from 'lucide-react';
import { type SubmitEvent, Fragment, useState } from 'react';
import { ApiAccessNote } from '@/app/components/api-access-note';
import type { ApiErrorResponse, PersonifyResponse } from '@/src/lib/types';
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from '@/components/ui/card';

type RawPreset = { label: string; raw: string };

const rawPresets: RawPreset[] = [
  {
    label: 'Support',
    raw: 'Your API key may be expired or missing from the Authorization header. Regenerate it in Playground and retry the request.',
  },
  {
    label: 'Coach',
    raw: 'Take one small step first. Write down the task, choose the easiest part, and work on it for ten minutes.',
  },
  {
    label: 'Product',
    raw: 'The new endpoint rewrites a base model response into the selected persona voice while preserving the original meaning.',
  },
];

export function PersonifyForm() {
  const [error, setError] = useState('');
  const [raw, setRaw] = useState(rawPresets[0].raw);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRawIndex, setSelectedRawIndex] = useState<number>(0);
  const [result, setResult] = useState<PersonifyResponse | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!raw.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/personify', {
        method: 'POST',
        body: JSON.stringify({ raw }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        throw new Error(body.error.message);
      }

      const body = (await response.json()) as PersonifyResponse;
      setResult(body);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function applyRaw(index: number) {
    setSelectedRawIndex(index);
    setRaw(rawPresets[index].raw);
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span title="Personify icon" className="inline-flex">
            <WandSparkles className="size-5" aria-hidden="true" />
          </span>
          Personify
        </CardTitle>
        <CardDescription>
          <code className="font-mono text-xs">POST /api/personify</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <fieldset className="space-y-2">
            <legend className="mono-meta text-foreground">Base Replies</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Base replies">
              {rawPresets.map((preset, index) => {
                const isSelected = selectedRawIndex === index;

                return (
                  <Button
                    size="sm"
                    type="button"
                    key={preset.label}
                    aria-pressed={isSelected}
                    onClick={() => applyRaw(index)}
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
              <label htmlFor="personify-raw" className="text-sm font-medium">
                Raw
              </label>
              <span className="mono-meta">{raw.trim().length}</span>
            </div>
            <Textarea
              rows={7}
              value={raw}
              id="personify-raw"
              placeholder="Enter base response"
              aria-describedby="personify-raw-help"
              onChange={event => setRaw(event.target.value)}
            />
            <p id="personify-raw-help" className="mono-meta text-[11px]">
              Native personify call.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isLoading || !raw.trim()} title="Personify response">
              {isLoading ? (
                <Fragment>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Personify
                </Fragment>
              ) : (
                <Fragment>
                  <WandSparkles className="size-4" aria-hidden="true" />
                  Personify
                </Fragment>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRaw(rawPresets[selectedRawIndex].raw);
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
                <p className="whitespace-pre-wrap text-sm leading-6">{result.personified}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
