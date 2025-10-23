import { useEffect, useState } from 'react';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Mail, Lock } from 'lucide-react';

interface EmailActionHandlerProps {
  onBack: () => void;
}

export default function EmailActionHandler({ onBack }: EmailActionHandlerProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Invalid or missing parameters');
      return;
    }

    setMode(mode);
    setActionCode(oobCode);

    if (mode === 'verifyEmail') {
      handleEmailVerification(oobCode);
    } else if (mode === 'resetPassword') {
      handlePasswordResetVerification(oobCode);
    }
  }, []);

  const handleEmailVerification = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage('Email verified successfully! You can now access your dashboard.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email');
    }
  };

  const handlePasswordResetVerification = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus('success');
      setMessage('Please enter your new password below.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Invalid or expired reset code');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setMessage('Password reset successfully! You can now login with your new password.');
      setTimeout(() => onBack(), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Failed to reset password');
    }
  };

  const handleContinue = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="h-12 w-12 text-red-500" />
            ) : mode === 'verifyEmail' ? (
              <Mail className="h-12 w-12 text-blue-500" />
            ) : (
              <Lock className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle>
            {mode === 'verifyEmail' ? 'Email Verification' : 'Password Reset'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Processing your request...' : message}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === 'success' && mode === 'resetPassword' && message.includes('enter your new password') ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          ) : status !== 'loading' ? (
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}