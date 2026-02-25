import Link from 'next/link';

export function ApiAccessNote() {
  return (
    <p className="border border-dashed border-foreground/25 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
      To configure everything, visit{' '}
      <Link
        target="_blank"
        rel="noreferrer"
        href="https://curvelabs.org/request-api-access"
        className="underline underline-offset-4 transition hover:text-foreground"
      >
        curvelabs.org/request-api-access
      </Link>
      .
    </p>
  );
}
