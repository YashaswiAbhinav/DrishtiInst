import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowLeft, Smartphone } from "lucide-react";
import { useAdvancedAuth } from "@/hooks/useAdvancedAuth";

interface AuthFormsProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onRegister: (userData: RegisterData) => Promise<void>;
  onBack: () => void;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  password: string;
}

export default function AuthForms({ onLogin, onRegister, onBack }: AuthFormsProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    name: '',
    email: '',
    phone: '',
    class: '',
    password: ''
  });
  const [forgotData, setForgotData] = useState({ identifier: '', otpSent: false, otp: '', newPassword: '' });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationOTP, setRegistrationOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [pendingUserData, setPendingUserData] = useState<RegisterData | null>(null);
  const [oauthPrefilled, setOauthPrefilled] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergePassword, setMergePassword] = useState('');
  const [mergeError, setMergeError] = useState('');
  // field-specific errors to display under inputs (email, username, phone, etc.)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { sendPhoneOTP, verifyOTP, signInWithGoogle } = useAdvancedAuth();
  const { mergeGoogleToExistingEmail } = useAdvancedAuth();

  // On mount, check if there's an oauth prefill saved (from Google sign-in)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('oauth_prefill');
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string; name?: string; emailVerified?: boolean };
        setRegisterData((prev) => ({
          ...prev,
          email: parsed.email || prev.email,
          name: parsed.name || prev.name
        }));
        setOauthPrefilled(true);
        setActiveTab('register');
        // remove after reading
        localStorage.removeItem('oauth_prefill');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin(loginData.username, loginData.password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res: any = await signInWithGoogle();
      // If user exists in Firestore, auth state listener will route to dashboard
      if (res && res.exists === false && res.prefill) {
        // Prefill registration form and switch to register tab
        setRegisterData({
          username: '',
          name: res.prefill.name || '',
          email: res.prefill.email || '',
          phone: '',
          class: '',
          password: ''
        });
        setActiveTab('register');
      }
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      setIsLoading(false);
      return;
    }

    // Password validation: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(registerData.password)) {
      setFieldErrors({ 
        password: 'Password must be at least 8 characters long and include: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).' 
      });
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_\-]{3,20}$/.test(registerData.username)) {
      setFieldErrors({ username: 'Username must be 3-20 characters and may contain letters, numbers, underscore or hyphen.' });
      setIsLoading(false);
      return;
    }

    try {
      // Direct registration with email/password (no OTP required)
      await onRegister(registerData);

      // Only show success if registration succeeded
      if (oauthPrefilled) {
        setSuccess('Registration complete. Redirecting to dashboard...');
      } else {
        setSuccess('Registration successful! Please check your email for verification link.');
      }
    } catch (error: any) {
      // Handle errors and set field-specific messages
      console.log('Registration error:', error);
      setFieldErrors({});
      
      if (error.code === 'auth/email-already-in-use') {
        const msg = error.meta?.existingEmail
          ? `The email ${error.meta.existingEmail} is already registered.`
          : 'This email is already registered. Please login instead or use a different email.';
        setFieldErrors({ email: msg });
        setError(`${msg} ${error.meta?.existingUid ? 'If this is your account, please login or use Merge Accounts.' : ''}`.trim());
        setSuccess(''); // Clear any success message
      } else if (error.message && error.message.includes('credential-already-in-use')) {
        setError('This email is already linked to another account. You can merge accounts by signing into the other account and linking providers.');
        setMergeMode(true);
        setSuccess(''); // Clear any success message
      } else if (error.code === 'auth/username-already-in-use') {
        setFieldErrors({ username: 'This username is already taken. Please choose another username.' });
        setError('This username is already taken. Please choose another username.');
        setSuccess(''); // Clear any success message
      } else if (error.code === 'auth/phone-already-in-use') {
        setFieldErrors({ phone: 'This phone number is already registered. Please use a different phone number.' });
        setError('This phone number is already registered. Please use a different phone number.');
        setSuccess(''); // Clear any success message
      } else {
        // For any other error
        setError(error.message || 'Registration failed');
        setSuccess(''); // Clear any success message
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    setMergeError('');
    if (!registerData.email) return setMergeError('Missing email');
    if (!mergePassword) return setMergeError('Enter the password for the existing account');
    try {
      await mergeGoogleToExistingEmail(registerData.email, mergePassword);
      // After successful merge, the auth state should update and redirect
      setMergeMode(false);
    } catch (e: any) {
      setMergeError(e.message || 'Merge failed');
    }
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (confirmationResult && registrationOTP && pendingUserData) {
        await verifyOTP(confirmationResult, registrationOTP, pendingUserData);
        setShowOTPModal(false);
        setPendingUserData(null);
        console.log('Phone verification and registration successful');
      } else {
        throw new Error('Invalid OTP or confirmation result');
      }
    } catch (error: any) {
      setError(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { resetPassword } = useAdvancedAuth();
      await resetPassword(forgotData.identifier);
      setSuccess('Password reset email sent! Check your inbox and click the link to reset your password.');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6"
    >
      {/* OTP Modal */}
      <AnimatePresence>
        {showOTPModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Verify Phone Number</span>
              </CardTitle>
              <CardDescription>
                Enter the 6-digit OTP sent to {registerData.phone}
              </CardDescription>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> Use OTP: <code className="bg-blue-100 px-2 py-1 rounded">123456</code>
                </p>
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  value={registrationOTP}
                  onChange={(e) => setRegistrationOTP(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  data-testid="input-otp"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleOTPVerification} className="flex-1" disabled={isLoading} data-testid="button-verify-otp">
                  {isLoading ? 'Verifying...' : 'Verify & Register'}
                </Button>
                <Button variant="outline" onClick={() => setShowOTPModal(false)}>
                  Cancel
                </Button>
              </div>
              <Button variant="ghost" className="w-full text-sm" data-testid="button-resend-otp">
                Resend OTP
              </Button>
            </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recaptcha container for phone authentication */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-primary">Drishti Institute</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Access your learning dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'login' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('login')}
            className="flex-1"
            data-testid="tab-login"
          >
            Login
          </Button>
          <Button
            variant={activeTab === 'register' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('register')}
            className="flex-1"
            data-testid="tab-register"
          >
            Register
          </Button>
          <Button
            variant={activeTab === 'forgot' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('forgot')}
            className="flex-1"
            data-testid="tab-forgot"
          >
            Reset
          </Button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>Enter your credentials to continue learning</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                    required
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    data-testid="input-password"
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full mt-3"
                  data-testid="button-google-signin"
                >
                  Sign in with Google
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('forgot')}
                  className="w-full text-sm"
                  data-testid="button-forgot-password"
                >
                  Forgot Password?
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
              <CardDescription>Join thousands of successful students</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      placeholder="Choose username"
                      required
                      data-testid="input-reg-username"
                    />
                    {fieldErrors.username && (
                      <div className="text-red-500 text-sm mt-1">{fieldErrors.username}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      data-testid="input-reg-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                      readOnly={oauthPrefilled}
                      data-testid="input-reg-email"
                    />
                  {fieldErrors.email && (
                    <div className="text-red-500 text-sm mt-1">{fieldErrors.email}</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <Input
                      id="reg-phone"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      required
                      data-testid="input-reg-phone"
                    />
                    {fieldErrors.phone && (
                      <div className="text-red-500 text-sm mt-1">{fieldErrors.phone}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reg-class">Class</Label>
                    <Select value={registerData.class} onValueChange={(value) => setRegisterData({ ...registerData, class: value })}>
                      <SelectTrigger data-testid="select-reg-class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">Class 9</SelectItem>
                        <SelectItem value="10">Class 10</SelectItem>
                        <SelectItem value="11">Class 11</SelectItem>
                        <SelectItem value="12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Create strong password"
                    required
                    data-testid="input-reg-password"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Password must contain:
                    <ul className="list-disc list-inside ml-1 space-y-1">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (@$!%*?&)</li>
                    </ul>
                  </div>
                  {fieldErrors.password && (
                    <div className="text-red-500 text-sm mt-1">{fieldErrors.password}</div>
                  )}
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                {success && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{success}</div>
                )}
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                    {isLoading ? 'Creating Account...' : 'Register Account'}
                  </Button>

                  {mergeMode && (
                    <div className="mt-4 p-3 border rounded">
                      <div className="text-sm mb-2">This email already exists. To merge your Google account into the existing account, enter the existing account's password:</div>
                      <Label htmlFor="merge-password">Existing account password</Label>
                      <Input id="merge-password" type="password" value={mergePassword} onChange={(e) => setMergePassword(e.target.value)} />
                      {mergeError && <div className="text-red-500 text-sm mt-2">{mergeError}</div>}
                      <div className="flex gap-2 mt-3">
                        <Button onClick={handleMerge} className="flex-1">Merge Accounts</Button>
                        <Button variant="outline" onClick={() => setMergeMode(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotData.identifier}
                    onChange={(e) => setForgotData({ ...forgotData, identifier: e.target.value })}
                    placeholder="Enter your email"
                    required
                    data-testid="input-forgot-email"
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                {success && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 text-sm">{success}</p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-forgot-submit"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('login')}
                  className="w-full"
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}