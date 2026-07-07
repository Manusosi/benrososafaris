'use client';

import * as React from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { htmlToText } from '../shared/rich-text-editor';

interface ItineraryDescriptionEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isHtmlDescription(description: string): boolean {
  return /<[a-z][\s\S]*>/i.test(description.trim());
}

function plainTextToEditorHtml(description: string): string {
  if (!description.trim()) return '';

  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: string[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listItems = [];
  }

  for (const line of lines) {
    if (/^[-•*]\s+|^\d+\.\s+/.test(line)) {
      const content = line.replace(/^[-•*]\s+|^\d+\.\s+/, '').trim();
      listItems.push(content);
      continue;
    }

    flushList();
    blocks.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  return blocks.join('');
}

export function descriptionToEditorHtml(description: string): string {
  if (!description.trim()) return '';
  if (isHtmlDescription(description)) return description;
  return plainTextToEditorHtml(description);
}

function normalizeEditorHtml(html: string): string {
  if (!htmlToText(html)) return '';
  return html;
}

export function ItineraryDescriptionEditor({
  id,
  value,
  onChange,
  placeholder
}: ItineraryDescriptionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'benroso-desc-highlight'
        }
      })
    ],
    content: descriptionToEditorHtml(value),
    editorProps: {
      attributes: {
        id,
        class: cn(
          'min-h-[140px] w-full px-3 py-2 text-sm outline-none',
          '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
          '[&_mark]:rounded-sm [&_mark]:bg-[#d9e4a0] [&_mark]:px-0.5',
          'empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]'
        ),
        'data-placeholder': placeholder ?? ''
      }
    },
    onUpdate: ({ editor: nextEditor }) => onChange(normalizeEditorHtml(nextEditor.getHTML()))
  });

  React.useEffect(() => {
    if (!editor) return;
    const nextContent = descriptionToEditorHtml(value);
    const current = normalizeEditorHtml(editor.getHTML());
    const normalizedNext = normalizeEditorHtml(nextContent);
    if (normalizedNext !== current && !editor.isFocused) {
      editor.commands.setContent(nextContent || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className='h-[172px] rounded-[3px] border border-input' />;
  }

  return (
    <div className='rounded-[3px] border border-input bg-transparent focus-within:border-ring'>
      <div className='flex flex-wrap items-center gap-0.5 border-b border-[#E5E7EB] p-1'>
        <ToolbarButton
          label='Bold (Ctrl+B)'
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Icons.bold className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          label='Highlight (Ctrl+Shift+H)'
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Icons.highlight className='size-4' />
        </ToolbarButton>
        <span className='mx-0.5 h-5 w-px bg-[#E5E7EB]' aria-hidden />
        <ToolbarButton
          label='Bullet list'
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icons.listBullet className='size-4' />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex size-8 items-center justify-center rounded-[3px] transition-colors',
        active ? 'bg-[#3c5142] text-white' : 'text-neutral-700 hover:bg-[#f3f4f6]'
      )}
    >
      {children}
    </button>
  );
}
