import { ContactFormSection } from '@/components/public/contact/contact-form-section';
import { ContactHero } from '@/components/public/contact/contact-hero';
import { ContactKatoSection } from '@/components/public/contact/contact-kato-section';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicSiteSettings } from '@/lib/public/site-data';

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const [siteSettings, pageHero] = await Promise.all([
    getPublicSiteSettings(),
    getPageHero('contact')
  ]);

  return (
    <>
      <ContactHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Contact' }]}
        description='Tell us about your dream East Africa safari and receive a free, no-obligation quote from our expert planners. We aim to respond within 24 hours. No payment is collected on this website.'
        hero={pageHero}
        title='Request a Free Safari Quote!'
      />

      <section className='bg-[var(--benroso-contact-body-bg)]'>
        <div className='benroso-container benroso-section'>
          <ContactFormSection locale={locale} siteSettings={siteSettings} />
        </div>
      </section>

      <ContactKatoSection />
    </>
  );
}
