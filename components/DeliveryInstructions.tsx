'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DriverNotesForm } from './DriverNotesForm';
import type { DeliveryData } from '@/lib/types';

interface DeliveryInstructionsProps {
  data: DeliveryData;
  onBack: () => void;
}

export function DeliveryInstructions({ data, onBack }: DeliveryInstructionsProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <header className="bg-white border-b px-4 py-3 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div className="font-bold text-green-700">ProJuice</div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print / PDF
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            {data.postcode}
          </h1>
          <Badge variant="secondary">{data.entries.length} {data.entries.length === 1 ? 'result' : 'results'}</Badge>
        </div>

        {data.entries.length === 1 ? (
          <EntryCard entry={data.entries[0]} onImageClick={setLightboxUrl} />
        ) : (
          <Accordion className="space-y-2">
            {data.entries.map((entry, i) => (
              <AccordionItem key={i} value={String(i)} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <AccordionTrigger className="px-4 py-3 font-semibold text-left hover:no-underline">
                  {entry.companyName}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <EntryCard entry={entry} onImageClick={setLightboxUrl} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="pt-4 print:hidden">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? 'Hide' : 'Add driver note'}
          </Button>
          {showNotes && (
            <div className="mt-4 bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold mb-4">Driver Note</h3>
              <DriverNotesForm postcode={data.postcode} onClose={() => setShowNotes(false)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EntryCard({
  entry,
  onImageClick,
}: {
  entry: import('@/lib/types').DeliveryEntry;
  onImageClick: (url: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">{entry.companyName}</h3>

      {entry.what3words.length > 0 && (
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">What3Words</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {entry.what3words.map((w, i) => (
              <a
                key={i}
                href={`https://what3words.com/${w}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono"
              >
                ///{w}
              </a>
            ))}
          </div>
        </div>
      )}

      {entry.phone.length > 0 && (
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
          <div className="flex flex-wrap gap-3 mt-1">
            {entry.phone.map((p, i) => (
              <a key={i} href={`tel:${p.canonical}`} className="text-sm text-blue-600 hover:underline">
                {p.display}
              </a>
            ))}
          </div>
        </div>
      )}

      {entry.instructions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Instructions</span>
          {entry.instructions.map((inst, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <Badge variant={inst.source === 'import' ? 'default' : 'secondary'} className="text-xs">
                {inst.label}
              </Badge>
              <p className="whitespace-pre-wrap text-gray-700">{inst.text}</p>
            </div>
          ))}
        </div>
      )}

      {(entry.image1Url || entry.image2Url) && (
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Images</span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {[entry.image1Url, entry.image2Url].filter(Boolean).map((url, i) => (
              <button key={i} onClick={() => onImageClick(url!)} className="focus:outline-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Delivery image ${i + 1}`}
                  className="h-24 w-24 object-cover rounded-lg border hover:opacity-80 transition"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
