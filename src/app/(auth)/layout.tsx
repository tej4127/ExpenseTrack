import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgImage = placeholderImages.find(p => p.id === 'auth-background');

  return (
    <div className="relative flex min-h-screen flex-col">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover object-center"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-grow items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-3 rounded-lg bg-background/80 p-4 backdrop-blur-sm">
                <Logo className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold text-foreground font-headline">
                ExpenseWise
                </h1>
            </div>
          </div>
          <div className="rounded-lg border bg-card/80 text-card-foreground shadow-sm backdrop-blur-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
