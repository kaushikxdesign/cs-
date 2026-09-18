import type React from 'react';
import { CommunityBuilder } from './CommunityBuilder';
import { ConversationsBuilder } from './ConversationsBuilder';
import { CsatBuilder } from './CsatBuilder';
import { HygieneBuilder } from './HygieneBuilder';
import { LinkedInBuilder } from './LinkedInBuilder';
import { NpsBuilder } from './NpsBuilder';
import { SentimentBuilder } from './SentimentBuilder';
import { UsageBuilder } from './UsageBuilder';
import type { BuilderProps } from './shared';

/** Per-source configuration, keyed by signal id. */
export const SIGNAL_BUILDERS: Record<
  string,
  { label: string; Component: React.ComponentType<BuilderProps> }
> = {
  usage: { label: 'Listener and event tagging', Component: UsageBuilder },
  sentiment: { label: 'Scoring and lexicon', Component: SentimentBuilder },
  convos: { label: 'Transcript import', Component: ConversationsBuilder },
  community: { label: 'Community builder', Component: CommunityBuilder },
  linkedin: { label: 'Contact monitoring', Component: LinkedInBuilder },
  csat: { label: 'Survey builder', Component: CsatBuilder },
  nps: { label: 'NPS builder', Component: NpsBuilder },
  hygiene: { label: 'Hygiene rules', Component: HygieneBuilder },
};

export { BuilderTabs, BuilderSplit } from './shared';
export type { BuilderProps } from './shared';
