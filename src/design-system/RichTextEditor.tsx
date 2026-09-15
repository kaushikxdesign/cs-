import React from 'react';
import { Bold, Code, Italic, Link2, List, ListOrdered, Quote, Underline } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

type Cmd = { cmd: string; icon: React.ReactNode; label: string; arg?: string };

const TOOLS: Cmd[] = [
  { cmd: 'bold', icon: <Bold className="size-4" strokeWidth={1.5} />, label: 'Bold' },
  { cmd: 'italic', icon: <Italic className="size-4" strokeWidth={1.5} />, label: 'Italic' },
  { cmd: 'underline', icon: <Underline className="size-4" strokeWidth={1.5} />, label: 'Underline' },
  { cmd: 'insertUnorderedList', icon: <List className="size-4" strokeWidth={1.5} />, label: 'Bulleted list' },
  { cmd: 'insertOrderedList', icon: <ListOrdered className="size-4" strokeWidth={1.5} />, label: 'Numbered list' },
  { cmd: 'formatBlock', arg: 'blockquote', icon: <Quote className="size-4" strokeWidth={1.5} />, label: 'Quote' },
  { cmd: 'formatBlock', arg: 'pre', icon: <Code className="size-4" strokeWidth={1.5} />, label: 'Code block' },
];

/**
 * Contenteditable composer. Deliberately does not reuse the legacy
 * `.cx-editor` class — that stylesheet is deleted with the legacy module, and
 * its fixed 180px min-height is too tall for a docked composer in a narrow
 * pane. Typography lives in `.cx-rte` in globals.css instead.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write a message…',
  footer,
  className,
  minHeight = 'min-h-20',
}: {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  footer?: React.ReactNode;
  className?: string;
  /** Tailwind min-height class for the editing surface. */
  minHeight?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current && value !== undefined && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function exec(t: Cmd) {
    document.execCommand(t.cmd, false, t.arg);
    ref.current?.focus();
    onChange?.(ref.current?.innerHTML ?? '');
  }

  function insertLink() {
    const url = window.prompt('Link URL');
    if (url) exec({ cmd: 'createLink', arg: url, icon: null, label: 'Link' });
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border-default bg-surface', className)}>
      <div className="flex items-center gap-0.5 border-b border-border-default px-1.5 py-1">
        {TOOLS.map((t) => (
          <IconButton key={t.label} size="sm" label={t.label} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(t)}>
            {t.icon}
          </IconButton>
        ))}
        <IconButton size="sm" label="Link" onMouseDown={(e) => e.preventDefault()} onClick={insertLink}>
          <Link2 className="size-4" strokeWidth={1.5} />
        </IconButton>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={() => onChange?.(ref.current?.innerHTML ?? '')}
        className={cn('cx-rte px-3 py-2.5 text-body text-on-surface outline-none overflow-y-auto', minHeight)}
      />
      {footer && <div className="border-t border-border-default px-3 py-2">{footer}</div>}
    </div>
  );
}
