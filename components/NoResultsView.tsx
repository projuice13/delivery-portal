'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DriverNotesForm } from './DriverNotesForm';

interface NoResultsViewProps {
  postcode: string;
  onBack: () => void;
}

export function NoResultsView({ postcode, onBack }: NoResultsViewProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div className="font-bold text-green-700">ProJuice</div>
        <div />
      </header>

      <main className="max-w-md mx-auto px-4 py-12 space-y-6 text-center">
        <div className="text-5xl">📦</div>
        <h1 className="text-xl font-bold text-gray-800">No results for {postcode}</h1>
        <p className="text-gray-500 text-sm">
          No delivery instructions were found for this postcode.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? 'Hide' : 'Add driver note for this postcode'}
        </Button>

        {showNotes && (
          <div className="text-left bg-white rounded-xl border shadow-sm p-4 mt-4">
            <h3 className="font-semibold mb-4">Driver Note</h3>
            <DriverNotesForm postcode={postcode} onClose={() => setShowNotes(false)} />
          </div>
        )}
      </main>
    </div>
  );
}
