import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { PortalContentRow } from '@/features/portal/api/types';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'published') return 'default';
  if (status === 'draft') return 'secondary';
  if (['trash', 'archived', 'deleted'].includes(status)) return 'destructive';
  return 'outline';
}

function statusLabel(status: string): string {
  if (['trash', 'archived', 'deleted'].includes(status)) return 'trash';
  return status.replace(/_/g, ' ');
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

interface PortalContentTableProps {
  rows: PortalContentRow[];
  emptyTitle?: string;
  emptyMessage?: string;
  /** When set, each row title links to `${editBasePath}/${row.id}` for editing. */
  editBasePath?: string;
}

export function PortalContentTable({
  rows,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'Records added in this module will appear here.',
  editBasePath
}: PortalContentTableProps) {
  return (
    <div className='bg-card overflow-hidden rounded-[5px] border shadow-xs'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30 hover:bg-muted/30'>
            <TableHead className='h-11 pl-4'>Title</TableHead>
            <TableHead className='h-11'>Status</TableHead>
            <TableHead className='h-11'>Locale</TableHead>
            <TableHead className='h-11 pr-4 text-right'>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} className='group'>
                <TableCell className='max-w-[28rem] pl-4 font-medium'>
                  {editBasePath ? (
                    <Link
                      className='underline-offset-4 transition-colors group-hover:text-primary hover:underline'
                      href={`${editBasePath}/${row.id}`}
                    >
                      {row.title}
                    </Link>
                  ) : (
                    row.title
                  )}
                </TableCell>
                <TableCell>
                  <Badge className='capitalize' variant={statusVariant(row.status)}>
                    {statusLabel(row.status)}
                  </Badge>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm uppercase'>
                  {row.locale}
                </TableCell>
                <TableCell className='text-muted-foreground pr-4 text-right text-sm'>
                  {formatUpdatedAt(row.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='h-48 text-center'>
                <div className='flex flex-col items-center gap-3 px-6 py-10'>
                  <div className='bg-muted flex size-11 items-center justify-center rounded-md border'>
                    <Icons.page className='text-muted-foreground size-5' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>{emptyTitle}</p>
                    <p className='text-muted-foreground mx-auto max-w-md text-sm leading-6'>
                      {emptyMessage}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
