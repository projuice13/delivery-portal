'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

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
    const tokens = value.split(',');
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
    const tokens = input.split(',');
    tokens[tokens.length - 1] = ' ' + pc;
    setInput(tokens.join(','));
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const postcodes = input
      .split(',')
      .map(p => p.trim().toUpperCase().replace(/\s+/g, ''))
      .filter(Boolean);
    if (!postcodes.length) return;

    const updated = [
      ...postcodes,
      ...recentSearches.filter(p => !postcodes.includes(p)),
    ].slice(0, MAX_HISTORY);
    setRecentSearches(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}

    onLookup(postcodes);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Image src="/pj.png" alt="ProJuice" width={40} height={40} className="object-contain" />
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          title="Log out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-[5px] p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Search Postcode</h1>

          <form onSubmit={handleSearch} className="relative space-y-3">
            <input
              ref={inputRef}
              placeholder="Enter postcode(s), separated by commas"
              value={input}
              onChange={e => updateInput(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full h-14 rounded-[5px] border border-gray-200 bg-white px-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-[5px] shadow-lg mt-1 overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-mono text-gray-700 cursor-pointer"
                    onMouseDown={() => selectSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-[5px] transition cursor-pointer"
            >
              {loading ? 'Looking up…' : 'Search Instructions'}
            </button>
          </form>

          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(pc => (
                  <button
                    key={pc}
                    onClick={() => { setInput(pc); onLookup([pc]); }}
                    className="text-xs bg-white border border-gray-200 rounded-[5px] px-3 py-1.5 hover:border-blue-300 hover:text-blue-600 font-mono text-gray-600 transition cursor-pointer"
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
