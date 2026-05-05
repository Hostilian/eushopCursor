/**
 * Minimal Markdown -> React renderer.
 *
 * Intentionally tiny: we only support the subset used by our long-form
 * editorial / investor surfaces (headings, paragraphs, hr, blockquote,
 * unordered lists, ordered lists, tables, bold/italic/code, links).
 *
 * No third-party deps. Safe for server rendering. We escape attributes and
 * never render raw HTML from the source — only structured nodes built here.
 */
import type { ReactNode } from 'react';

type Block =
  | { kind: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'hr' }
  | { kind: 'blockquote'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'code'; lang: string | null; text: string };

function tokenize(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || null;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) {
        buf.push(lines[i]!);
        i++;
      }
      i++;
      blocks.push({ kind: 'code', lang, text: buf.join('\n') });
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const hashes = headingMatch[1]!;
      const title = headingMatch[2] ?? '';
      const level = hashes.length as 1 | 2 | 3 | 4;
      const map = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;
      blocks.push({ kind: map[level], text: title });
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push({ kind: 'hr' });
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('> ')) {
        buf.push(lines[i]!.slice(2));
        i++;
      }
      blocks.push({ kind: 'blockquote', text: buf.join(' ') });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('|')) {
        tableLines.push(lines[i]!);
        i++;
      }
      if (tableLines.length >= 2) {
        const header = splitRow(tableLines[0]!);
        const rows = tableLines.slice(2).map(splitRow);
        blocks.push({ kind: 'table', header, rows });
        continue;
      }
    }

    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !/^(#{1,4}\s|>\s|---|\d+\.\s|[-*]\s|\|)/.test(lines[i]!) &&
      !lines[i]!.startsWith('```')
    ) {
      buf.push(lines[i]!);
      i++;
    }
    blocks.push({ kind: 'p', text: buf.join(' ') });
  }

  return blocks;
}

function splitRow(row: string): string[] {
  return row
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let key = 0;
  // Order matters: we process matches sequentially across the string.
  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      nodes.push(<em key={key++}>{match[6]}</em>);
    } else if (match[7]) {
      nodes.push(
        <code key={key++} className="bg-ink/5 rounded px-1.5 py-0.5 font-mono text-[0.92em]">
          {match[8]}
        </code>,
      );
    } else if (match[9]) {
      const label = match[10];
      const href = match[11];
      if (label === undefined || href === undefined) {
        lastIndex = pattern.lastIndex;
        continue;
      }
      const safeHref = /^(https?:|mailto:|\/)/i.test(href) ? href : '#';
      nodes.push(
        <a key={key++} href={safeHref} className="text-ink underline underline-offset-4">
          {label}
        </a>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function MarkdownArticle({ source }: { source: string }) {
  const blocks = tokenize(source);
  /* eslint-disable react/no-array-index-key -- tokenizer output is deterministic and this renderer is static-only */
  return (
    <article className="text-ink/85 max-w-2xl space-y-5 text-base leading-relaxed text-pretty">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'h1':
            return (
              <h1 key={i} className="text-ink mt-10 font-serif text-4xl">
                {renderInline(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={i} className="text-ink mt-10 font-serif text-2xl">
                {renderInline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="text-ink mt-6 font-serif text-xl">
                {renderInline(block.text)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={i} className="text-ink mt-4 font-serif text-lg">
                {renderInline(block.text)}
              </h4>
            );
          case 'hr':
            return <hr key={i} className="border-ink/10 my-8" />;
          case 'blockquote':
            return (
              <blockquote key={i} className="border-ink/30 text-ink/70 border-l-2 pl-4 italic">
                {renderInline(block.text)}
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="list-decimal space-y-1.5 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case 'table':
            return (
              <div key={i} className="border-ink/10 overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5">
                    <tr>
                      {block.header.map((cell, j) => (
                        <th key={j} className="text-ink px-3 py-2 text-left font-semibold">
                          {renderInline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="border-ink/10 border-t">
                        {row.map((cell, ci) => (
                          <td key={ci} className="text-ink/80 px-3 py-2">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'code':
            return (
              <pre
                key={i}
                className="border-ink/10 bg-ink/[0.04] overflow-x-auto rounded-xl border p-4 font-mono text-xs"
              >
                <code>{block.text}</code>
              </pre>
            );
        }
      })}
    </article>
  );
  /* eslint-enable react/no-array-index-key */
}
