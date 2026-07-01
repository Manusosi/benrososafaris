'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MediaUrlField } from './media-url-field';
import {
  saveContact,
  saveGeneralBranding,
  saveNotifications,
  saveSeoAnalytics,
  saveSocial
} from './settings-actions';
import type {
  ContactValues,
  GeneralBrandingValues,
  NotificationsValues,
  SeoAnalyticsValues,
  SettingsFormValues,
  SocialValues
} from './schema';

/* -------------------------------------------------------------------------- */
/* Small field helpers                                                          */
/* -------------------------------------------------------------------------- */

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text'
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {hint ? <p className='text-muted-foreground text-xs'>{hint}</p> : null}
    </div>
  );
}

function SaveBar({ onSave, isPending }: { onSave: () => void; isPending: boolean }) {
  return (
    <div className='flex justify-end pt-2'>
      <Button disabled={isPending} onClick={onSave} type='button'>
        {isPending ? (
          <Icons.spinner className='h-4 w-4 animate-spin' />
        ) : (
          <Icons.check className='h-4 w-4' />
        )}
        Save changes
      </Button>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className='space-y-4'>{children}</CardContent>
    </Card>
  );
}

function useTabSave<T>(action: (values: T) => Promise<unknown>) {
  const [isPending, startTransition] = useTransition();
  function save(values: T) {
    startTransition(async () => {
      try {
        await action(values);
        toast.success('Settings saved.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save settings.');
      }
    });
  }
  return { isPending, save };
}

/* -------------------------------------------------------------------------- */
/* General & Branding                                                           */
/* -------------------------------------------------------------------------- */

function GeneralTab({ initial }: { initial: GeneralBrandingValues }) {
  const [values, setValues] = useState(initial);
  const { isPending, save } = useTabSave(saveGeneralBranding);
  const set = (patch: Partial<GeneralBrandingValues>) => setValues((v) => ({ ...v, ...patch }));

  return (
    <div className='space-y-4'>
      <SectionCard title='Identity' description='How the brand is named across the site.'>
        <TextField
          id='companyName'
          label='Company name'
          onChange={(companyName) => set({ companyName })}
          value={values.companyName ?? ''}
        />
        <TextField
          id='tagline'
          label='Tagline'
          hint='A short slogan shown in the footer and share previews.'
          onChange={(tagline) => set({ tagline })}
          placeholder='Unforgettable East African safaris, crafted around you'
          value={values.tagline ?? ''}
        />
        <TextField
          id='themeColor'
          label='Theme colour'
          hint='Browser address-bar colour (hex), e.g. #3C5142.'
          onChange={(themeColor) => set({ themeColor })}
          placeholder='#3C5142'
          value={values.themeColor ?? ''}
        />
      </SectionCard>

      <SectionCard title='Branding' description='Logo, favicon, and default share image.'>
        <MediaUrlField
          id='logoUrl'
          label='Logo'
          hint='Shown in the header and footer.'
          onChange={(logoUrl) => set({ logoUrl })}
          value={values.logoUrl ?? ''}
        />
        <MediaUrlField
          id='faviconUrl'
          label='Favicon'
          hint='The small icon shown in browser tabs. Use a square PNG/ICO.'
          onChange={(faviconUrl) => set({ faviconUrl })}
          previewShape='square'
          value={values.faviconUrl ?? ''}
        />
        <MediaUrlField
          id='ogDefaultImageUrl'
          label='Default social-share image'
          hint='Used when a page has no specific share image (1200×630 recommended).'
          onChange={(ogDefaultImageUrl) => set({ ogDefaultImageUrl })}
          value={values.ogDefaultImageUrl ?? ''}
        />
      </SectionCard>

      <SaveBar isPending={isPending} onSave={() => save(values)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Contact                                                                      */
/* -------------------------------------------------------------------------- */

function ContactTab({ initial }: { initial: ContactValues }) {
  const [values, setValues] = useState(initial);
  const { isPending, save } = useTabSave(saveContact);
  const set = (patch: Partial<ContactValues>) => setValues((v) => ({ ...v, ...patch }));

  return (
    <div className='space-y-4'>
      <SectionCard
        title='Contact details'
        description='Used across the site, footer, and enquiry replies.'
      >
        <div className='grid gap-4 sm:grid-cols-2'>
          <TextField
            id='email'
            label='Email'
            onChange={(email) => set({ email })}
            type='email'
            value={values.email ?? ''}
          />
          <TextField
            id='phonePrimary'
            label='Primary phone'
            onChange={(phonePrimary) => set({ phonePrimary })}
            value={values.phonePrimary ?? ''}
          />
          <TextField
            id='phoneSecondary'
            label='Secondary phone'
            onChange={(phoneSecondary) => set({ phoneSecondary })}
            value={values.phoneSecondary ?? ''}
          />
          <TextField
            id='phoneOffice'
            label='Office phone'
            onChange={(phoneOffice) => set({ phoneOffice })}
            value={values.phoneOffice ?? ''}
          />
        </div>
        <TextField
          id='addressShort'
          label='Address'
          onChange={(addressShort) => set({ addressShort })}
          value={values.addressShort ?? ''}
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          <TextField
            id='postalAddress'
            label='Postal address'
            onChange={(postalAddress) => set({ postalAddress })}
            value={values.postalAddress ?? ''}
          />
          <TextField
            id='katoAddress'
            label='KATO address'
            onChange={(katoAddress) => set({ katoAddress })}
            value={values.katoAddress ?? ''}
          />
        </div>
      </SectionCard>

      <SectionCard title='WhatsApp' description='The pre-filled message used by WhatsApp links.'>
        <TextField
          id='whatsappMessage'
          label='Default WhatsApp message'
          onChange={(whatsappMessage) => set({ whatsappMessage })}
          placeholder='Hello Benroso Safaris, I would like help planning a safari.'
          value={values.whatsappMessage ?? ''}
        />
      </SectionCard>

      <SaveBar isPending={isPending} onSave={() => save(values)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Social                                                                       */
/* -------------------------------------------------------------------------- */

const SOCIAL_FIELDS: { key: keyof SocialValues; label: string; placeholder: string }[] = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/…' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/…' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…' }
];

function SocialTab({ initial }: { initial: SocialValues }) {
  const [values, setValues] = useState(initial);
  const { isPending, save } = useTabSave(saveSocial);
  const set = (patch: Partial<SocialValues>) => setValues((v) => ({ ...v, ...patch }));

  return (
    <div className='space-y-4'>
      <SectionCard
        title='Social profiles'
        description='These power the social icons in the website footer. Leave a field blank to hide it.'
      >
        <div className='grid gap-4 sm:grid-cols-2'>
          {SOCIAL_FIELDS.map((field) => (
            <TextField
              id={field.key}
              key={field.key}
              label={field.label}
              onChange={(value) => set({ [field.key]: value } as Partial<SocialValues>)}
              placeholder={field.placeholder}
              value={(values[field.key] as string) ?? ''}
            />
          ))}
        </div>
      </SectionCard>

      <SaveBar isPending={isPending} onSave={() => save(values)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                                 */
/* -------------------------------------------------------------------------- */

function NotificationsTab({ initial }: { initial: NotificationsValues }) {
  const [emailsText, setEmailsText] = useState((initial.notifyEmails ?? []).join('\n'));
  const [enquiryEmailEnabled, setEmailEnabled] = useState(initial.enquiryEmailEnabled);
  const [enquiryWhatsappEnabled, setWhatsappEnabled] = useState(initial.enquiryWhatsappEnabled);
  const [whatsappNotifyPhone, setPhone] = useState(initial.whatsappNotifyPhone ?? '');
  const { isPending, save } = useTabSave(saveNotifications);

  function onSave() {
    const notifyEmails = emailsText
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    save({ notifyEmails, enquiryEmailEnabled, enquiryWhatsappEnabled, whatsappNotifyPhone });
  }

  return (
    <div className='space-y-4'>
      <SectionCard title='Enquiry alerts' description='Where new enquiry notifications are sent.'>
        <div className='space-y-1.5'>
          <Label htmlFor='notifyEmails'>Recipient emails</Label>
          <Textarea
            id='notifyEmails'
            onChange={(event) => setEmailsText(event.target.value)}
            placeholder='sales@benrososafaris.co.ke'
            rows={3}
            value={emailsText}
          />
          <p className='text-muted-foreground text-xs'>One email per line (or comma-separated).</p>
        </div>
        <label className='flex items-center justify-between gap-4 rounded-md border p-3'>
          <span className='text-sm'>
            <span className='font-medium'>Email alerts</span>
            <span className='text-muted-foreground block text-xs'>
              Notify recipients by email on new enquiries.
            </span>
          </span>
          <Switch checked={enquiryEmailEnabled} onCheckedChange={setEmailEnabled} />
        </label>
        <label className='flex items-center justify-between gap-4 rounded-md border p-3'>
          <span className='text-sm'>
            <span className='font-medium'>WhatsApp alerts</span>
            <span className='text-muted-foreground block text-xs'>
              Notify the team on WhatsApp on new enquiries.
            </span>
          </span>
          <Switch checked={enquiryWhatsappEnabled} onCheckedChange={setWhatsappEnabled} />
        </label>
        <TextField
          id='whatsappNotifyPhone'
          label='WhatsApp alert number'
          hint='International format, e.g. +254731201500.'
          onChange={setPhone}
          placeholder='+254731201500'
          value={whatsappNotifyPhone}
        />
      </SectionCard>

      <SaveBar isPending={isPending} onSave={onSave} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SEO & Analytics                                                               */
/* -------------------------------------------------------------------------- */

function SeoTab({ initial }: { initial: SeoAnalyticsValues }) {
  const [values, setValues] = useState(initial);
  const { isPending, save } = useTabSave(saveSeoAnalytics);
  const set = (patch: Partial<SeoAnalyticsValues>) => setValues((v) => ({ ...v, ...patch }));

  return (
    <div className='space-y-4'>
      <SectionCard
        title='SEO defaults'
        description='Fallback title and description for pages without their own.'
      >
        <TextField
          id='seoTitle'
          label='Default meta title'
          onChange={(seoTitle) => set({ seoTitle })}
          value={values.seoTitle ?? ''}
        />
        <div className='space-y-1.5'>
          <Label htmlFor='seoDescription'>Default meta description</Label>
          <Textarea
            id='seoDescription'
            onChange={(event) => set({ seoDescription: event.target.value })}
            rows={3}
            value={values.seoDescription ?? ''}
          />
        </div>
      </SectionCard>

      <SectionCard
        title='Analytics & verification'
        description='Connect analytics and verify ownership with search engines.'
      >
        <div className='grid gap-4 sm:grid-cols-2'>
          <TextField
            id='gaMeasurementId'
            label='Google Analytics ID'
            hint='e.g. G-XXXXXXX'
            onChange={(gaMeasurementId) => set({ gaMeasurementId })}
            placeholder='G-XXXXXXX'
            value={values.gaMeasurementId ?? ''}
          />
          <TextField
            id='gtmId'
            label='Google Tag Manager ID'
            hint='e.g. GTM-XXXXXX'
            onChange={(gtmId) => set({ gtmId })}
            placeholder='GTM-XXXXXX'
            value={values.gtmId ?? ''}
          />
          <TextField
            id='metaPixelId'
            label='Meta Pixel ID'
            onChange={(metaPixelId) => set({ metaPixelId })}
            value={values.metaPixelId ?? ''}
          />
        </div>
        <TextField
          id='googleSiteVerification'
          label='Google site verification'
          hint='The content value of the google-site-verification meta tag.'
          onChange={(googleSiteVerification) => set({ googleSiteVerification })}
          value={values.googleSiteVerification ?? ''}
        />
        <TextField
          id='bingSiteVerification'
          label='Bing site verification'
          hint='The content value of the msvalidate.01 meta tag.'
          onChange={(bingSiteVerification) => set({ bingSiteVerification })}
          value={values.bingSiteVerification ?? ''}
        />
      </SectionCard>

      <SaveBar isPending={isPending} onSave={() => save(values)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                        */
/* -------------------------------------------------------------------------- */

const TABS = [
  { value: 'general', label: 'General & Branding', icon: Icons.settings },
  { value: 'contact', label: 'Contact', icon: Icons.phone },
  { value: 'social', label: 'Social', icon: Icons.world },
  { value: 'notifications', label: 'Notifications', icon: Icons.mail },
  { value: 'seo', label: 'SEO & Analytics', icon: Icons.search }
] as const;

export function SiteSettingsForm({ initial }: { initial: SettingsFormValues }) {
  return (
    <Tabs className='gap-6' defaultValue='general'>
      <TabsList className='h-auto flex-wrap'>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <tab.icon className='h-4 w-4' />
            <span className='hidden sm:inline'>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value='general'>
        <GeneralTab initial={initial.general} />
      </TabsContent>
      <TabsContent value='contact'>
        <ContactTab initial={initial.contact} />
      </TabsContent>
      <TabsContent value='social'>
        <SocialTab initial={initial.social} />
      </TabsContent>
      <TabsContent value='notifications'>
        <NotificationsTab initial={initial.notifications} />
      </TabsContent>
      <TabsContent value='seo'>
        <SeoTab initial={initial.seo} />
      </TabsContent>
    </Tabs>
  );
}
