import type { Tone } from '@/design-system';

export interface ConversationMessage {
  id: string;
  date: string;
  author: string;
  /** True when the author is from the customer side rather than Sia. */
  inbound: boolean;
  body: string;
}

// "Jul 15: Sarah M. (Acme): body" — the full form, with a named author.
const DATED_MESSAGE = /^([A-Za-z]{3}\s+\d{1,2}):\s*([^:]+?(?:\s*\([^)]*\))?):\s*(.+)$/;
// "Jul 22: Admin request received." — a dated line with no author segment.
// Every one of these in the mock data is a status note we wrote, not
// something a customer said, so it takes the same authorship as below.
const DATED_NOTE = /^([A-Za-z]{3}\s+\d{1,2}):\s*(.+)$/;

/**
 * Conversations are stored as a newline-separated transcript in the mock
 * data, and it is not one shape: most lines are "date: author: body", but
 * several tickets carry undated or unauthored status notes instead (see
 * sup1888, sup1955, the auto-generated tickets). The old parser only matched
 * the first shape, so every other line fell through a fallback that stamped
 * it `inbound: true` — a note we wrote ourselves, like "Admin access transfer
 * pending manager approval," rendered as a customer message. Both patterns
 * are matched explicitly now, and the fallback for genuinely dateless notes
 * defaults to us, not the customer.
 */
export function parseConversation(raw: string | undefined): ConversationMessage[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const dated = line.match(DATED_MESSAGE);
      if (dated) {
        const [, date, author, body] = dated;
        return {
          id: String(i),
          date: date.trim(),
          author: author.trim(),
          // Support/CSM replies are ours; anyone else is the customer.
          inbound: !/^(support|csm|sia)\b/i.test(author.trim()),
          body: body.trim(),
        };
      }
      const note = line.match(DATED_NOTE);
      if (note) {
        const [, date, body] = note;
        return { id: String(i), date: date.trim(), author: 'Support', inbound: false, body: body.trim() };
      }
      return { id: String(i), date: '', author: 'Support', inbound: false, body: line };
    });
}

export function severityTone(severity: string): Tone {
  if (severity === 'critical') return 'danger';
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'info';
  return 'neutral';
}

export function sentimentTone(sentiment: string): Tone {
  if (sentiment === 'negative') return 'danger';
  if (sentiment === 'positive') return 'success';
  return 'neutral';
}

export function slaTone(sla: { breached?: boolean; atRisk?: boolean }): Tone {
  if (sla.breached) return 'danger';
  if (sla.atRisk) return 'warning';
  return 'success';
}

export function statusLabel(status: string) {
  return status === 'in_progress' ? 'In progress' : status.charAt(0).toUpperCase() + status.slice(1);
}
