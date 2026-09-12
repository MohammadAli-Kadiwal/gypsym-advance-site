import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="pt-36 pb-28 flex items-center justify-center">
      <Container size="sm" className="text-center space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary/50 text-primary shadow-lg">
          <Terminal className="h-7 w-7" />
        </div>
        <div className="font-mono text-xs text-primary font-semibold tracking-widest uppercase">
          Error 404 • Resource Not Found
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          The requested path could not be located in the CMS registry.
        </p>
        <div className="pt-4 flex items-center justify-center">
          <Button asChild>
            <Link href="/" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Homepage
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
