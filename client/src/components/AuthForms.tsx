import { useState } from "react";
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
  const { sendPhoneOTP, verifyOTP } = useAdvancedAuth();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // Direct registration with email/password (no OTP required)
      await onRegister(registerData);
      setSuccess('Registration successful! Please check your email for verification link.');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
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

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.otpSent) {
      console.log('Send OTP to:', forgotData.identifier);
      setForgotData({ ...forgotData, otpSent: true });
    } else {
      console.log('Reset password with OTP:', forgotData.otp);
      setActiveTab('login');
      setForgotData({ identifier: '', otpSent: false, otp: '', newPassword: '' });
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
                    data-testid="input-reg-email"
                  />
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
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {!forgotData.otpSent 
                  ? "Enter your email or phone number to receive an OTP"
                  : "Enter the OTP and your new password"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {!forgotData.otpSent ? (
                  <div>
                    <Label htmlFor="identifier">Email or Phone</Label>
                    <Input
                      id="identifier"
                      value={forgotData.identifier}
                      onChange={(e) => setForgotData({ ...forgotData, identifier: e.target.value })}
                      placeholder="Enter email or phone number"
                      required
                      data-testid="input-identifier"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="reset-otp">OTP Code</Label>
                      <Input
                        id="reset-otp"
                        value={forgotData.otp}
                        onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value })}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                        data-testid="input-reset-otp"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={forgotData.newPassword}
                        onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                        data-testid="input-new-password"
                      />
                    </div>
                  </>
                )}
                <Button type="submit" className="w-full" data-testid="button-forgot-submit">
                  {!forgotData.otpSent ? 'Send OTP' : 'Reset Password'}
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