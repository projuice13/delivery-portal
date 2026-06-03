import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface NoteEmailParams {
  driverName: string;
  postcode: string;
  what3words: string;
  notes: string;
  fileName: string;
  fileContent: string; // raw base64, no data-url prefix
}

export async function sendNoteEmail(params: NoteEmailParams) {
  const { driverName, postcode, what3words, notes, fileName, fileContent } = params;

  const w3wLink = what3words
    ? `<a href="https://what3words.com/${what3words}">${what3words}</a>`
    : 'N/A';

  const html = `
    <h2>Delivery Notes Update From Driver</h2>
    <p><strong>Driver:</strong> ${driverName}</p>
    <p><strong>Postcode:</strong> ${postcode}</p>
    <p><strong>What3Words:</strong> ${w3wLink}</p>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-GB')}</p>
    <p><strong>Notes:</strong></p>
    <p>${notes.replace(/\n/g, '<br>')}</p>
  `;

  const text = `Delivery Notes Update From Driver\n\nDriver: ${driverName}\nPostcode: ${postcode}\nWhat3Words: ${what3words || 'N/A'}\nTimestamp: ${new Date().toLocaleString('en-GB')}\n\nNotes:\n${notes}`;

  const attachments =
    fileName && fileContent
      ? [{ filename: fileName, content: fileContent }]
      : [];

  await getResend().emails.send({
    from: 'ProJuice Delivery Portal <notifications@pro-juice.co.uk>',
    to: ['drivers@projuice.co.uk'],
    subject: 'Delivery Notes Update From Driver',
    html,
    text,
    attachments,
  });
}
