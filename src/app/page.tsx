
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This component now immediately redirects to the dashboard, bypassing login.


export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
