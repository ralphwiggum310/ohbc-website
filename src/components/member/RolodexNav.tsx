'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function RolodexNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const activeLetter = searchParams.get('letter')?.toUpperCase() || 'ALL';

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const handleLetterClick = (letter: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (letter === 'ALL' || letter === activeLetter) {
      params.delete('letter');
    } else {
      params.set('letter', letter);
    }
    
    replace(`${pathname}?${params.toString()}`);
    
    // Scroll to top when changing letters
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap items-center justify-center gap-1 py-2 md:gap-2">
        <button
          onClick={() => handleLetterClick('ALL')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
            activeLetter === 'ALL'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          ALL
        </button>
        
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
              activeLetter === letter
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
            aria-label={`Show last names starting with ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
