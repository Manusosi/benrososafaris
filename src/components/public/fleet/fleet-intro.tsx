import { FLEET_INTRO_COLUMNS, FLEET_INTRO_TITLE } from '@/lib/public/fleet-content';

export function FleetIntro() {
  return (
    <section className='border-b border-[var(--benroso-line)] bg-white'>
      <div className='benroso-container py-14 md:py-16 lg:py-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='benroso-heading font-display text-3xl leading-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]'>
            {FLEET_INTRO_TITLE}
          </h2>
          <span aria-hidden className='benroso-gold-line mt-6 [width:90px]' />
        </div>

        <div className='benroso-body mx-auto mt-10 grid max-w-5xl gap-8 text-base leading-8 text-[var(--benroso-muted)] md:grid-cols-2 md:gap-x-12 md:gap-y-6 md:text-[17px] md:leading-8'>
          {FLEET_INTRO_COLUMNS.map((column, columnIndex) => (
            <div className='space-y-5' key={columnIndex}>
              {column.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
