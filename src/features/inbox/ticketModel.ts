import type { Tone } from '@/design-system';

export interface ConversationMessage {
  id: string;
  date: string;
  author: string;
  /** True when the author is from the customer side rather than Sia. */
  inbound: boolean;
  body: string;
}

/**
 * Conversations are stored as a newline-separated transcript in the mock data,
 * each line shaped "Jul 15: Sarah M. (Acme): body". Parsed here so the
 * conversation pane can render real messages rather than a wall of text.
 */
export function parseConversation(raw: string | undefined): ConversationMessage[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const match = line.match(/^([A-Za-z]{3}\s+\d{1,2}):\s*([^:]+):\s*(.*)$/);
      if (!match) return { id: String(i), date: '', author: '', inbound: true, body: line };
      const [, date, author, body] = match;
      return {
        id: String(i),
        date: date.trim(),
        author: author.trim(),
        // Support/CSM replies are ours; anyone else is the customer.
        inbound: !/^(support|csm)\b/i.test(author.trim()),
        body: body.trim(),
      };
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
