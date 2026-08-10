'use client';

import * as React from 'react';
import type { ChainedCommands, Editor } from '@tiptap/react';

import { Icons } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { CMS_SURFACE } from './surface';

/** Smallest grid shown before the user hovers, and the hard ceiling it grows to. */
const MIN_GRID = 5;
const MAX_GRID = 12;

function useEditorRevision(editor: Editor) {
  const [, setRevision] = React.useState(0);

  React.useEffect(() => {
    const update = () => setRevision((value) => value + 1);
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);
}

interface TableInsertPickerProps {
  editor: Editor;
}

export function TableInsertPicker({ editor }: TableInsertPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState({ rows: 0, cols: 0 });
  const [withHeaderRow, setWithHeaderRow] = React.useState(true);

  // The grid grows toward the edge the user is hovering (Google-Docs style), so
  // there's no fixed cap on how large a table you can start.
  const gridRows = Math.min(MAX_GRID, Math.max(MIN_GRID, hover.rows + 1));
  const gridCols = Math.min(MAX_GRID, Math.max(MIN_GRID, hover.cols + 1));

  function resetPicker() {
    setHover({ rows: 0, cols: 0 });
    setWithHeaderRow(true);
  }

  function insertTable(rows: number, cols: number) {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    setOpen(false);
    resetPicker();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetPicker();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Insert table'
          aria-label='Insert table'
          className='flex size-8 items-center justify-center rounded-[3px] text-neutral-700 transition-colors hover:bg-[#f3f4f6]'
        >
          <Icons.table className='size-4' />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className={cn(CMS_SURFACE, 'w-auto rounded-[3px] p-3 shadow-none')}
      >
        <div className='grid gap-3'>
          <p className='text-sm font-medium text-neutral-900'>Insert table</p>
          <div
            className='grid gap-0.5'
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
          >
            {Array.from({ length: gridRows * gridCols }, (_, index) => {
              const row = Math.floor(index / gridCols) + 1;
              const col = (index % gridCols) + 1;
              const selected = row <= hover.rows && col <= hover.cols;

              return (
                <button
                  key={index}
                  type='button'
                  aria-label={`${row} by ${col} table`}
                  className={cn(
                    'size-5 rounded-[2px] border border-[#E5E7EB] transition-colors',
                    selected ? 'border-[#3c5142] bg-[#3c5142]' : 'bg-white hover:border-[#3c5142]'
                  )}
                  onMouseEnter={() => setHover({ rows: row, cols: col })}
                  onClick={() => insertTable(row, col)}
                />
              );
            })}
          </div>
          <p className='text-muted-foreground text-xs'>
            {hover.rows > 0 && hover.cols > 0
              ? `${hover.rows} × ${hover.cols} table`
              : 'Hover to choose size — the grid grows as you go'}
          </p>
          <Label htmlFor='table-header-row' className='flex items-center gap-2 text-sm'>
            <Checkbox
              id='table-header-row'
              checked={withHeaderRow}
              onCheckedChange={(checked) => setWithHeaderRow(checked === true)}
            />
            Include header row
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TableContextToolbarProps {
  editor: Editor;
}

export function TableContextToolbar({ editor }: TableContextToolbarProps) {
  useEditorRevision(editor);

  if (!editor.isActive('table')) return null;

  const canMerge = editor.can().mergeCells();
  const canSplit = editor.can().splitCell();

  return (
    <div className='flex flex-wrap items-center gap-1 border-b border-[#E5E7EB] bg-[#f8f5ef] p-1.5'>
      <span className='inline-flex items-center gap-1 px-1 text-xs font-semibold text-[#3c5142]'>
        <Icons.table className='size-3.5' />
        Table
      </span>

      <ToolbarDivider />
      <TableToolbarButton
        editor={editor}
        label='Add row above'
        onRun={(chain) => chain.addRowBefore()}
      >
        <Icons.add className='size-3' />
        Row above
      </TableToolbarButton>
      <TableToolbarButton
        editor={editor}
        label='Add row below'
        onRun={(chain) => chain.addRowAfter()}
      >
        <Icons.add className='size-3' />
        Row below
      </TableToolbarButton>
      <TableToolbarButton editor={editor} label='Delete row' onRun={(chain) => chain.deleteRow()}>
        <Icons.trash className='size-3' />
        Row
      </TableToolbarButton>

      <ToolbarDivider />
      <TableToolbarButton
        editor={editor}
        label='Add column left'
        onRun={(chain) => chain.addColumnBefore()}
      >
        <Icons.add className='size-3' />
        Col left
      </TableToolbarButton>
      <TableToolbarButton
        editor={editor}
        label='Add column right'
        onRun={(chain) => chain.addColumnAfter()}
      >
        <Icons.add className='size-3' />
        Col right
      </TableToolbarButton>
      <TableToolbarButton
        editor={editor}
        label='Delete column'
        onRun={(chain) => chain.deleteColumn()}
      >
        <Icons.trash className='size-3' />
        Col
      </TableToolbarButton>

      <ToolbarDivider />
      <TableToolbarButton
        editor={editor}
        label='Toggle header row'
        onRun={(chain) => chain.toggleHeaderRow()}
      >
        Header row
      </TableToolbarButton>
      <TableToolbarButton
        editor={editor}
        label='Toggle header column'
        onRun={(chain) => chain.toggleHeaderColumn()}
      >
        Header col
      </TableToolbarButton>
      {canMerge ? (
        <TableToolbarButton
          editor={editor}
          label='Merge cells'
          onRun={(chain) => chain.mergeCells()}
        >
          Merge
        </TableToolbarButton>
      ) : null}
      {canSplit ? (
        <TableToolbarButton editor={editor} label='Split cell' onRun={(chain) => chain.splitCell()}>
          Split
        </TableToolbarButton>
      ) : null}

      <ToolbarDivider />
      <TableToolbarButton
        editor={editor}
        label='Delete table'
        variant='danger'
        onRun={(chain) => chain.deleteTable()}
      >
        <Icons.trash className='size-3.5' />
        Delete table
      </TableToolbarButton>
    </div>
  );
}

function TableToolbarButton({
  editor,
  label,
  variant = 'default',
  onRun,
  children
}: {
  editor: Editor;
  label: string;
  variant?: 'default' | 'danger';
  onRun: (chain: ChainedCommands) => ChainedCommands;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      // Prevent the click from stealing focus/selection from the table cell,
      // so the command always applies to the cell the caret is in.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onRun(editor.chain().focus()).run()}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-[3px] border px-2 text-xs font-medium transition-colors',
        variant === 'danger'
          ? 'border-transparent text-red-600 hover:border-red-200 hover:bg-red-50'
          : 'border-[#E5E7EB] bg-white text-neutral-700 hover:border-[#3c5142] hover:text-[#3c5142]'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className='mx-0.5 h-4 w-px bg-[#E5E7EB]' aria-hidden />;
}
