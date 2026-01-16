'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';

export default function MemberSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search members..."
        className="w-full pl-9"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  );
}
