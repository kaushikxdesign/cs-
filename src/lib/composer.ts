/**
 * Composer tools.
 *
 * These are deterministic text transforms, not a model. That is a deliberate
 * limit rather than a shortcut: a demo that fakes a round trip teaches the
 * wrong thing about latency and failure, and a transform you can read is a
 * transform a reviewer can argue with. Each one states what it did so the
 * writer can undo it knowingly.
 */

export interface ComposerTool {
  id: string;
  label: string;
  hint: string;
  apply: (draft: string, ctx: ComposerContext) => string;
}

export interface ComposerContext {
  /** First name of the person being written to. */
  recipient?: string;
  sender?: string;
  /** Account name, where the thread has one. */
  account?: string;
  subject?: string;
}

const firstName = (s?: string) => (s ?? '').trim().split(/\s+/)[0] || 'there';

const HEDGES = [
  /\bjust\s+/gi, /\bactually\s+/gi, /\bbasically\s+/gi, /\breally\s+/gi,
  /\bvery\s+/gi, /\bquite\s+/gi, /\bI think that\s+/gi, /\bsort of\s+/gi,
  /\bkind of\s+/gi, /\bat this point in time\b/gi,
];

const FORMAL: Array<[RegExp, string]> = [
  [/\bcan't\b/gi, 'cannot'], [/\bwon't\b/gi, 'will not'], [/\bdon't\b/gi, 'do not'],
  [/\bit's\b/gi, 'it is'], [/\bwe're\b/gi, 'we are'], [/\bI'm\b/g, 'I am'],
  [/\bI've\b/g, 'I have'], [/\byou're\b/gi, 'you are'], [/\bthanks\b/gi, 'thank you'],
  [/\bASAP\b/g, 'as soon as possible'],
];

const WARM: Array<[RegExp, string]> = [
  [/\bcannot\b/gi, "can't"], [/\bwill not\b/gi, "won't"], [/\bdo not\b/gi, "don't"],
  [/\bit is\b/gi, "it's"], [/\bwe are\b/gi, "we're"],
  [/\bas soon as possible\b/gi, 'as quickly as we can'],
  [/\bper my previous email\b/gi, 'following up on my last note'],
];

const body = (draft: string) => draft.trim();

export const COMPOSER_TOOLS: ComposerTool[] = [
  {
    id: 'tighten',
    label: 'Tighten',
    hint: 'Strip hedges and filler',
    apply: (draft) => {
      let out = body(draft);
      for (const h of HEDGES) out = out.replace(h, '');
      // Collapse the whitespace the removals leave, without eating the
      // paragraph breaks that carry the structure.
      out = out.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
      return out.replace(/(^|\n)\s*([a-z])/g, (_m, p, c) => p + c.toUpperCase());
    },
  },
  {
    id: 'warmer',
    label: 'Warmer',
    hint: 'Contractions, softer openings',
    apply: (draft, ctx) => {
      let out = body(draft);
      for (const [re, to] of WARM) out = out.replace(re, to);
      if (!/^(hi|hello|hey)\b/i.test(out)) {
        out = `Hi ${firstName(ctx.recipient)},\n\n${out}`;
      }
      if (!/thank/i.test(out)) {
        out = out.replace(/\n\n(Best|Regards|Thanks)/i, '\n\nThanks for bearing with us.\n\n$1');
      }
      return out;
    },
  },
  {
    id: 'formal',
    label: 'More formal',
    hint: 'Expand contractions, neutral register',
    apply: (draft) => {
      let out = body(draft);
      for (const [re, to] of FORMAL) out = out.replace(re, to);
      return out;
    },
  },
  {
    id: 'nextsteps',
    label: 'Add next steps',
    hint: 'Append a dated commitment block',
    apply: (draft, ctx) => {
      const out = body(draft);
      if (/next steps/i.test(out)) return out;
      const block = [
        '',
        'Next steps:',
        '1. I will confirm the fix date with engineering and come back to you by end of day tomorrow.',
        '2. You will have a written status every 24 hours until this is closed.',
        ctx.account
          ? `3. We will review the impact on ${ctx.account} at our next call.`
          : '3. We will review the impact at our next call.',
        '',
      ].join('\n');
      // Sits above the sign-off, because a commitment under a signature
      // reads as an afterthought.
      const signoff = out.search(/\n(Best|Regards|Thanks|Kind regards)\b/i);
      return signoff === -1 ? out + '\n' + block : out.slice(0, signoff) + '\n' + block + out.slice(signoff);
    },
  },
  {
    id: 'shorten',
    label: 'Shorten',
    hint: 'Keep the first line of each paragraph',
    apply: (draft) => {
      const paras = body(draft).split(/\n{2,}/);
      return paras
        .map((p) => {
          const sentences = p.split(/(?<=[.!?])\s+/);
          return sentences.length > 2 ? sentences.slice(0, 2).join(' ') : p;
        })
        .join('\n\n');
    },
  },
];

// ── Suggested replies ───────────────────────────────────────────────

export interface Suggestion {
  id: string;
  label: string;
  /** Why this one is being offered, shown on hover. */
  why: string;
  build: (ctx: ComposerContext) => string;
}

/**
 * Three openers at most, chosen from the thread's own state rather than a
 * fixed list — an SLA breach and a happy renewal thread should not be
 * offered the same first sentence.
 */
export function suggestReplies(input: {
  slaState?: string;
  sentiment?: string;
  status?: string;
  ageDays?: number;
}): Suggestion[] {
  const out: Suggestion[] = [];

  if (input.slaState === 'breached') {
    out.push({
      id: 'recover',
      label: 'Own the delay',
      why: 'The SLA has already breached, so the reply has to lead with the miss.',
      build: (c) =>
        `Hi ${firstName(c.recipient)},\n\nWe missed our own response time on this and I am sorry — you should not have had to chase us.\n\nHere is where it actually stands:\n\n\nI will send you an update every 24 hours until it is closed, whether or not there is news.\n\nBest,\n${c.sender ?? 'Maya Chen'}`,
    });
  } else if (input.slaState === 'at_risk') {
    out.push({
      id: 'holding',
      label: 'Holding update',
      why: 'The clock is close; an interim note costs less than a breach.',
      build: (c) =>
        `Hi ${firstName(c.recipient)},\n\nQuick update so you are not waiting on silence: this is with the team now and I expect to have a firm answer for you shortly.\n\nI will come back to you either way before the end of the day.\n\nBest,\n${c.sender ?? 'Maya Chen'}`,
    });
  }

  if (input.sentiment === 'unhappy') {
    out.push({
      id: 'deescalate',
      label: 'Acknowledge the frustration',
      why: 'Sentiment on the thread reads unhappy.',
      build: (c) =>
        `Hi ${firstName(c.recipient)},\n\nThank you for being direct about this — it is a fair reaction and I would be frustrated too.\n\nLet me set out what we are doing and by when:\n\n\nIf that is not enough, tell me and I will escalate it further on my side.\n\nBest,\n${c.sender ?? 'Maya Chen'}`,
    });
  }

  if ((input.ageDays ?? 0) >= 5) {
    out.push({
      id: 'aging',
      label: 'Explain the delay',
      why: `Open ${input.ageDays} days — the age itself now needs addressing.`,
      build: (c) =>
        `Hi ${firstName(c.recipient)},\n\nThis has been open longer than it should have been, and that is on us. Here is what has happened since you raised it and what remains:\n\n\nBest,\n${c.sender ?? 'Maya Chen'}`,
    });
  }

  out.push({
    id: 'confirm',
    label: 'Confirm and commit',
    why: 'A neutral opener that still carries a date.',
    build: (c) =>
      `Hi ${firstName(c.recipient)},\n\nThanks for flagging this${c.subject ? ` — on “${c.subject}”` : ''}.\n\nI have picked it up and will confirm a firm date with you by end of day tomorrow.\n\nBest,\n${c.sender ?? 'Maya Chen'}`,
  });

  return out.slice(0, 3);
}
