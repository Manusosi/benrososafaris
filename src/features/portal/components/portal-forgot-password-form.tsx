'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PortalAuthButton } from '@/features/portal/components/portal-auth-button';
import { PortalAuthLogo } from '@/features/portal/components/portal-auth-logo';
import { PortalAuthShell } from '@/features/portal/components/portal-auth-shell';
import { portalAbsoluteUrl } from '@/lib/portal-url';
import { createClient } from '@/lib/supabase/browser';

const fieldClassName =
  'h-12 rounded-lg border-[#E5E7EB] bg-white px-4 text-[15px] text-[#2A2A2A] shadow-none placeholder:text-[#9CA3AF] focus-visible:border-[#3C5142] focus-visible:ring-[#3C5142]/20';

const labelClassName = 'text-[13px] font-normal text-[#9CA3AF]';

export function PortalForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const supabase = createClient();
    const redirectTo = portalAbsoluteUrl('/portal/login/reset-password');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess('Password reset link sent. Check your email to continue.');
  }

  return (
    <PortalAuthShell>
      <div className='mx-auto w-full max-w-[360px]'>
        <PortalAuthLogo />

        <div className='mb-8 text-center'>
          <h1 className='text-[28px] font-semibold tracking-tight text-[#111827]'>
            Forgot password?
          </h1>
          <p className='mt-2 text-[15px] leading-relaxed text-[#6B7280]'>
            Enter the email linked to your portal account and we&apos;ll send a reset link.
          </p>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label className={labelClassName} htmlFor='email'>
              Enter email id
            </Label>
            <Input
              autoComplete='email'
              className={fieldClassName}
              id='email'
              onChange={(event) => setEmail(event.target.value)}
              placeholder='user@email.com'
              required
              type='email'
              value={email}
            />
          </div>

          {error ? <p className='text-[14px] text-red-600'>{error}</p> : null}
          {success ? <p className='text-[14px] text-[#3C5142]'>{success}</p> : null}

          <PortalAuthButton isLoading={isLoading} type='submit'>
            Send reset link
          </PortalAuthButton>
        </form>

        <p className='mt-8 text-center text-[15px] text-[#6B7280]'>
          Remember your password?{' '}
          <Link className='font-medium text-[#3C5142] hover:underline' href='/portal/login'>
            Back to login
          </Link>
        </p>
      </div>
    </PortalAuthShell>
  );
}
