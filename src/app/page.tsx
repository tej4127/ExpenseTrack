'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// This is a client-side check. Middleware handles the initial server-side redirect.
// This component handles the case where a user lands here directly client-side.
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The middleware is the primary guard. This is a fallback.
    // We will attempt to redirect to the dashboard, and the middleware will
    // handle redirecting to /login if there's no session.
    router.replace('/dashboard');

    // We don't want to show the loading screen for too long if redirection fails
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
