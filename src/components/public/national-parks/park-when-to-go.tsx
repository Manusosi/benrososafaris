import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const;

const MONTH_KEYS = MONTH_ABBR.map((m) => m.toLowerCase());

/**
 * Derives which calendar months are recommended directly from the editor's
 * free-text "best time to visit" string — nothing is hardcoded per park.
 * Handles single months, ranges ("June to October", "Dec – Feb", wrapping the
 * year), and "all year round". Returns null when no months can be inferred.
 */
function recommendedMonths(summary: string): boolean[] | null {
  const lower = summary.toLowerCase();
  if (/(all year|year[\s-]?round|throughout the year|any ?time)/.test(lower)) {
    return Array.from({ length: 12 }, () => true);
  }

  const regex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/g;
  const matches: { idx: number; pos: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(lower)) !== null) {
    const idx = MONTH_KEYS.indexOf(match[1]);
    if (idx !== -1) matches.push({ idx, pos: match.index });
  }
  if (!matches.length) return null;

  const flags = Array.from({ length: 12 }, () => false);
  matches.forEach((m) => (flags[m.idx] = true));

  // Fill inclusive ranges when a connector sits between two month mentions.
  for (let i = 0; i < matches.length - 1; i += 1) {
    const between = lower.slice(matches[i].pos, matches[i + 1].pos);
    if (/(to|through|thru|until|[–—-])/.test(between)) {
      let j = matches[i].idx;
      for (let guard = 0; guard < 12; guard += 1) {
        flags[j] = true;
        if (j === matches[i + 1].idx) break;
        j = (j + 1) % 12;
      }
    }
  }

  return flags;
}

export function ParkWhenToGo({
  parkName,
  bestTimeSummary
}: {
  parkName: string;
  bestTimeSummary: string | null;
}) {
  const summary = bestTimeSummary?.trim() || '';

  // Clear empty state when the editor has not added best-time guidance yet.
  if (!summary) {
    return (
      <div className='rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-white px-8 py-14 text-center'>
        <Icons.calendar className='mx-auto size-8 text-[var(--benroso-muted)]/50' />
        <h3 className='benroso-heading mt-3 font-display text-xl'>
          Best time to visit coming soon
        </h3>
        <p className='benroso-body mx-auto mt-2 max-w-xl'>
          Seasonal travel guidance for {parkName} will appear here once it is added in the portal.
        </p>
      </div>
    );
  }

  const months = recommendedMonths(summary);

  return (
    <div>
      <div className='flex flex-wrap items-center gap-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-5 py-4'>
        <Icons.calendar className='size-5 shrink-0 text-[var(--benroso-primary)]' />
        <p className='text-[15px] leading-7 text-[var(--benroso-ink)]'>
          <span className='font-semibold'>Best time to visit {parkName}:</span> {summary}
        </p>
      </div>

      {months ? (
        <div className='mt-6'>
          <div className='grid grid-cols-6 gap-2 sm:grid-cols-12'>
            {MONTH_ABBR.map((label, index) => (
              <div
                className={cn(
                  'rounded-[5px] border px-1 py-2 text-center text-xs font-bold',
                  months[index]
                    ? 'border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white'
                    : 'border-[var(--benroso-line)] bg-white text-[var(--benroso-muted)]'
                )}
                key={label}
              >
                {label}
              </div>
            ))}
          </div>
          <p className='mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--benroso-muted)]'>
            <span className='size-3 rounded-[3px] bg-[var(--benroso-primary)]' />
            Recommended travel months
          </p>
        </div>
      ) : null}
    </div>
  );
}
