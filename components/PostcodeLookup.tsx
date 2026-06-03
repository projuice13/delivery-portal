'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PostcodeLookupProps {
  onLookup: (postcodes: string[]) => void;
  onLogout: () => void;
  loading?: boolean;
}

const HISTORY_KEY = 'pj_recent_postcodes';
const MAX_HISTORY = 10;

export function PostcodeLookup({ onLookup, onLogout, loading }: PostcodeLookupProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
      setRecentSearches(stored);
    } catch {}
  }, []);

  const { data: allPostcodes } = useQuery<{ postcodes: string[] }>({
    queryKey: ['postcodes-all'],
    queryFn: () =>
      fetch('/api/postcode/all', { credentials: 'include' }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  function updateInput(value: string) {
    setInput(value);
    const tokens = value.split(/[\n,]+/);
    const last = tokens[tokens.length - 1].trim().toUpperCase();
    if (last.length >= 2 && allPostcodes?.postcodes) {
      const matches = allPostcodes.postcodes.filter(pc => pc.startsWith(last)).slice(0, 8);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(pc: string) {
    const tokens = input.split(/[\n,]+/);
    tokens[tokens.length - 1] = pc;
    setInput(tokens.join(', '));
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const postcodes = input
      .split(/[\n,]+/)
      .map(p => p.trim().toUpperCase().replace(/\s+/g, ''))
      .filter(Boolean);
    if (!postcodes.length) return;

    // Update history
    const updated = [
      ...postcodes,
      ...recentSearches.filter(p => !postcodes.includes(p)),
    ].slice(0, MAX_HISTORY);
    setRecentSearches(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}

    onLookup(postcodes);
  }

  function useRecent(postcode: string) {
    setInput(postcode);
    onLookup([postcode]);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold text-green-700">ProJuice</div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Delivery Instructions Lookup
          </h1>

          <form onSubmit={handleSearch} className="space-y-3 relative">
            <Input
              ref={inputRef}
              placeholder="Enter postcode(s) — comma or newline separated"
              value={input}
              onChange={e => updateInput(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="text-base"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-mono"
                    onMouseDown={() => selectSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Looking up…' : 'Look up delivery instructions'}
            </Button>
          </form>

          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(pc => (
                  <button
                    key={pc}
                    onClick={() => useRecent(pc)}
                    className="text-xs bg-white border rounded-full px-3 py-1 hover:bg-gray-50 font-mono text-gray-700"
                  >
                    {pc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
