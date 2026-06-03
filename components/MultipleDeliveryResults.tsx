'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DriverNotesForm } from './DriverNotesForm';
import type { DeliveryResult } from '@/lib/types';

interface MultipleDeliveryResultsProps {
  results: DeliveryResult[];
  onBack: () => void;
}

export function MultipleDeliveryResults({ results, onBack }: MultipleDeliveryResultsProps) {
  const [notesPostcode, setNotesPostcode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div className="font-bold text-green-700">ProJuice</div>
        <div />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Multiple Postcodes</h1>

        {results.map(result => (
          <div key={result.postcode} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b bg-gray-50">
              <span className="font-mono font-semibold text-gray-800">{result.postcode}</span>
              {result.data ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {result.data.entries.length} {result.data.entries.length === 1 ? 'entry' : 'entries'}
                </Badge>
              ) : (
                <Badge variant="destructive">Not found</Badge>
              )}
            </div>

            <div className="px-4 py-3 space-y-2">
              {result.data ? (
                result.data.entries.map((entry, i) => (
                  <div key={i} className="text-sm space-y-1">
                    <p className="font-medium">{entry.companyName}</p>
                    {entry.instructions.map((inst, j) => (
                      <p key={j} className="text-gray-600 text-xs pl-2 border-l-2 border-gray-200">
                        {inst.text}
                      </p>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No delivery instructions found.</p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setNotesPostcode(result.postcode)}
              >
                Add note
              </Button>
            </div>
          </div>
        ))}
      </main>

      <Dialog open={!!notesPostcode} onOpenChange={() => setNotesPostcode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Note — {notesPostcode}</DialogTitle>
          </DialogHeader>
          {notesPostcode && (
            <DriverNotesForm postcode={notesPostcode} onClose={() => setNotesPostcode(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
