export type SmtpMailbox = 'enquiry' | 'guest' | 'newsletter';

const MAILBOX_USERS: Record<SmtpMailbox, string> = {
  enquiry: 'inquiries@benrososafaris.co.ke',
  guest: 'no-reply@benrososafaris.co.ke',
  newsletter: 'news@benrososafaris.co.ke'
};

const MAILBOX_FROM: Record<SmtpMailbox, string> = {
  enquiry: 'Benroso Safaris <inquiries@benrososafaris.co.ke>',
  guest: 'Benroso Safaris <no-reply@benrososafaris.co.ke>',
  newsletter: 'Benroso Safaris <news@benrososafaris.co.ke>'
};

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_PASSWORD?.trim());
}

export function smtpAuthUser(mailbox: SmtpMailbox) {
  const envKey = {
    enquiry: 'SMTP_ENQUIRY_USER',
    guest: 'SMTP_GUEST_USER',
    newsletter: 'SMTP_NEWSLETTER_USER'
  }[mailbox];

  return process.env[envKey]?.trim() || MAILBOX_USERS[mailbox];
}

export function smtpFromAddress(mailbox: SmtpMailbox) {
  const envKey = {
    enquiry: 'SMTP_ENQUIRY_FROM',
    guest: 'SMTP_GUEST_FROM',
    newsletter: 'SMTP_NEWSLETTER_FROM'
  }[mailbox];

  return process.env[envKey]?.trim() || MAILBOX_FROM[mailbox];
}

export function enquiryNotificationEmail() {
  return (
    process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim() ||
    process.env.BENROSO_ENQUIRY_EMAIL?.trim() ||
    'info@benrososafaris.co.ke'
  );
}

export function enquiryReplyToEmail() {
  return process.env.ENQUIRY_REPLY_TO?.trim() || enquiryNotificationEmail();
}
