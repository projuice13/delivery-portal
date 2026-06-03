'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DRIVERS = ['Andy', 'Dan', 'Ian', 'Karol', 'Lee', 'Marlon', 'Peter', 'Rafal', 'Shaun'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface DriverNotesFormProps {
  postcode: string;
  onClose?: () => void;
}

export function DriverNotesForm({ postcode, onClose }: DriverNotesFormProps) {
  const [driverName, setDriverName] = useState('');
  const [what3words, setWhat3words] = useState('');
  const [notes, setNotes] = useState('');
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
      fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const res = await fetch('/api/driver-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ driverName, postcode, what3words, notes, fileName, fileContent }),
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
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center space-y-2">
        <p className="font-semibold text-green-800">Note submitted successfully!</p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Driver name *</Label>
        <Select value={driverName} onValueChange={v => setDriverName(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Select driver…" />
          </SelectTrigger>
          <SelectContent>
            {DRIVERS.map(d => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="w3w">What3Words (optional)</Label>
        <Input
          id="w3w"
          placeholder="e.g. filled.count.soap"
          value={what3words}
          onChange={e => setWhat3words(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes *</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Enter delivery notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="file">Attachment (optional, max 10MB)</Label>
        <Input id="file" type="file" onChange={handleFile} />
        {fileError && <p className="text-sm text-red-600">{fileError}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={submitting || !driverName || !notes}
          className="bg-green-700 hover:bg-green-800"
        >
          {submitting ? 'Submitting…' : 'Submit note'}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
