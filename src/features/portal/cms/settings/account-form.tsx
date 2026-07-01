'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUrlField } from './media-url-field';
import { changeAccountPassword, updateAccountProfile } from './account-actions';

type AccountFormProps = {
  initial: { fullName: string; email: string; avatarUrl: string; role: string };
};

export function AccountForm({ initial }: AccountFormProps) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingProfile, startProfile] = useTransition();
  const [savingPassword, startPassword] = useTransition();

  function onSaveProfile() {
    startProfile(async () => {
      try {
        await updateAccountProfile({ fullName, avatarUrl: avatarUrl || null });
        toast.success('Profile updated.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not update profile.');
      }
    });
  }

  function onChangePassword() {
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    startPassword(async () => {
      try {
        await changeAccountPassword({ newPassword: password });
        setPassword('');
        setConfirm('');
        toast.success('Password changed.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not change password.');
      }
    });
  }

  return (
    <div className='grid max-w-3xl gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Profile</CardTitle>
          <CardDescription>Your personal details for the team portal.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='fullName'>Full name</Label>
            <Input id='fullName' onChange={(e) => setFullName(e.target.value)} value={fullName} />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input disabled id='email' value={initial.email} />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='role'>Role</Label>
              <Input disabled id='role' value={initial.role} />
            </div>
          </div>
          <MediaUrlField
            label='Avatar'
            onChange={setAvatarUrl}
            previewShape='square'
            value={avatarUrl}
          />
          <div className='flex justify-end'>
            <Button disabled={savingProfile} onClick={onSaveProfile} type='button'>
              {savingProfile ? (
                <Icons.spinner className='h-4 w-4 animate-spin' />
              ) : (
                <Icons.check className='h-4 w-4' />
              )}
              Save profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Password</CardTitle>
          <CardDescription>Change the password you use to sign in.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='password'>New password</Label>
              <Input
                id='password'
                onChange={(e) => setPassword(e.target.value)}
                type='password'
                value={password}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='confirm'>Confirm password</Label>
              <Input
                id='confirm'
                onChange={(e) => setConfirm(e.target.value)}
                type='password'
                value={confirm}
              />
            </div>
          </div>
          <p className='text-muted-foreground text-xs'>At least 8 characters.</p>
          <div className='flex justify-end'>
            <Button disabled={savingPassword || !password} onClick={onChangePassword} type='button'>
              {savingPassword ? (
                <Icons.spinner className='h-4 w-4 animate-spin' />
              ) : (
                <Icons.lock className='h-4 w-4' />
              )}
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
