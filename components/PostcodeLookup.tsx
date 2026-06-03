'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

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

    const updated = [
      ...postcodes,
      ...recentSearches.filter(p => !postcodes.includes(p)),
    ].slice(0, MAX_HISTORY);
    setRecentSearches(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}

    onLookup(postcodes);
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <ProJuiceLogo />
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-gray-600 transition"
          title="Log out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Delivery Lookup</h1>
          <p className="text-sm text-gray-500">Search by postcode to view delivery instructions</p>
        </div>

        <form onSubmit={handleSearch} className="relative space-y-3">
          <input
            ref={inputRef}
            placeholder="Enter postcode(s) — comma or newline separated"
            value={input}
            onChange={e => updateInput(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          {showSuggestions && (
            <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-mono text-gray-700"
                  onMouseDown={() => selectSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
          >
            {loading ? 'Looking up…' : 'Look up instructions'}
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
                  className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-300 hover:text-blue-600 font-mono text-gray-600 transition"
                >
                  {pc}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ProJuiceLogo() {
  return (
    <div className="inline-flex items-center gap-0.5">
      <span className="text-xl font-bold text-gray-900">Pro</span>
      <span className="text-xl font-bold text-orange-500">Juice</span>
    </div>
  );
}
