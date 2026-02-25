import { Fragment } from 'react';

export default function Loading() {
  return (
    <Fragment>
      <header className="space-y-4 border-b border-foreground/15 pb-6">
        <div className="h-3 w-56 animate-pulse bg-foreground/10" />
        <div className="h-10 w-2/3 animate-pulse bg-foreground/10" />
        <div className="h-5 w-full max-w-3xl animate-pulse bg-foreground/10" />
        <div className="h-6 w-52 animate-pulse bg-foreground/10" />
      </header>
      <section className="space-y-3 pt-6">
        <div className="h-28 w-full animate-pulse bg-foreground/10" />
        <div className="h-24 w-5/6 animate-pulse bg-foreground/10" />
        <div className="h-24 w-3/4 animate-pulse bg-foreground/10" />
      </section>
    </Fragment>
  );
}
