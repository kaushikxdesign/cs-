import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be taught this design system's scales.
 *
 * Out of the box it groups every `text-*` class together and keeps the last
 * one, because it cannot tell a font size from a colour. With custom token
 * names like `text-caption` and `text-on-solid` that guess is wrong, and it
 * silently dropped the colour — which is how the primary button shipped as
 * black text on a black fill, and the tooltip as dark text on a dark ground.
 * Declaring the font-size scale explicitly leaves every other `text-*` to be
 * treated as a colour, which is what they are.
 */
const FONT_SIZES = [
  'caption',
  'body-sm',
  'body',
  'body-lg',
  'title-sm',
  'title',
  'title-lg',
  'display',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
