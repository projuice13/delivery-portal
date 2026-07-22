'use client';

import { useState } from 'react';

const DRIVERS = ['Andy', 'Dan', 'Ian', 'Karol', 'Lee', 'Marlon', 'Peter', 'Rafal', 'Shaun'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Compress image client-side using Canvas before sending.
// Vercel has a 4.5MB request body limit; base64 adds ~33% overhead,
// so we resize and compress to keep the payload well under that.
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      // ~0.7 quality JPEG keeps a 5MB phone photo under 300KB
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface DriverNotesFormProps {
  postcode: string;
  onClose?: () => void;
  targetLibraryEntryId?: string;
  initialWhat3words?: string;
  initialNotes?: string;
  initialBusinessName?: string;
}

export function DriverNotesForm({ postcode, onClose, targetLibraryEntryId, initialWhat3words, initialNotes, initialBusinessName }: DriverNotesFormProps) {
  const isEditRequest = Boolean(targetLibraryEntryId);
  const [driverName, setDriverName] = useState('');
  const [businessName, setBusinessName] = useState(initialBusinessName ?? '');
  const [what3words, setWhat3words] = useState(initialWhat3words ?? '');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError('');
    if (f && f.size > MAX_FILE_BYTES) {
      setFileError('File must be under 10MB');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driverName) return;
    setSubmitting(true);
    setError('');

    let fileName = '';
    let fileContent = '';

    if (file) {
      fileName = file.name;
      // Compress images before sending to stay within Vercel's 4.5MB body limit
      if (file.type.startsWith('image/')) {
        fileContent = await compressImage(file);
      } else {
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }

    try {
      const res = await fetch('/api/driver-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ driverName, businessName, postcode, what3words, notes, fileName, fileContent, targetLibraryEntryId: targetLibraryEntryId ?? null }),
      });
      if (!res.ok) {
        setError('Failed to submit. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[5px] bg-green-50 border border-green-100 p-4 text-center space-y-2">
        <p className="font-medium text-green-800">{isEditRequest ? 'Edit request submitted!' : 'Note submitted successfully!'}</p>
        {onClose && (
          <button onClick={onClose} className="text-sm text-green-700 underline cursor-pointer">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Driver name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={driverName}
            onChange={e => setDriverName(e.target.value)}
            required
            className="w-full h-10 rounded-[5px] border border-gray-200 bg-white px-3 pr-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer"
          >
            <option value="">Please select</option>
            {DRIVERS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Business name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Business name, or customer name if residential"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          required
          className="w-full h-10 rounded-[5px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
        <p className="mt-1 text-xs text-gray-400">If it&apos;s a residential address, please state the customer&apos;s name if possible.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What3Words <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="Enter What3Words if applicable"
          value={what3words}
          onChange={e => setWhat3words(e.target.value)}
          className="w-full h-10 rounded-[5px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {isEditRequest ? 'Updated notes' : 'Additional driver notes'} <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder={isEditRequest ? 'Describe the changes needed…' : 'Enter any additional notes or observations about this delivery...'}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          required
          className="w-full rounded-[5px] border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Attachment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="file"
          onChange={handleFile}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-[5px] file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition border border-gray-200 rounded-[5px] cursor-pointer"
        />
        {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-[5px] px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !driverName || !businessName || !notes}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-[5px] transition flex items-center justify-center gap-2 cursor-pointer"
      >
        {submitting ? (
          'Submitting…'
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {isEditRequest ? 'Submit Edit Request' : 'Submit Notes'}
          </>
        )}
      </button>
    </form>
  );
}
