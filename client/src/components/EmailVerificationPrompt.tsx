import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAdvancedAuth } from '@/hooks/useAdvancedAuth';

interface EmailVerificationPromptProps {
  userEmail: string;
  onBack: () => void;
  onResendEmail: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function EmailVerificationPrompt({ userEmail, onBack, onResendEmail, onRefresh }: EmailVerificationPromptProps) {
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Poll for verification status every 6 seconds while component is mounted
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      if (!mounted) return;
      try {
        await onRefresh();
      } catch (e) {
        // ignore errors during polling
      }
    }, 6000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [onRefresh]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      await onResendEmail();
      setResendMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Resend email error:', error);
      if (error.message?.includes('already verified')) {
        setResendMessage('Your email is already verified! Click "I\'ve Verified My Email" to continue.');
      } else {
        setResendMessage('Failed to send email. Please try again in a few minutes.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    setResendMessage('');
    try {
      await onRefresh();
      setResendMessage('Verification status refreshed! If you verified your email, you should be redirected shortly.');
    } catch (error) {
      setResendMessage('Failed to refresh. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-gray-900">{userEmail}</p>
            <p className="text-sm text-gray-500">
              Please check your inbox and spam folder, then click the verification link to access your dashboard.
            </p>
          </div>

          {resendMessage && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              resendMessage.includes('sent') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {resendMessage}
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleRefreshVerification} 
              disabled={isRefreshing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleResendEmail} 
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            After clicking the verification link in your email, click "I've Verified My Email" above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}