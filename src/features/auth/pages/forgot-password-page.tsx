import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ROUTES, BRANDING } from '@/constants';
import { authApi } from '@/lib/api/auth-api';

// Step 1: Request OTP - Email or Username
const requestOtpSchema = z.object({
  identifier: z.string().min(3, 'Please enter your email or username'),
});

// Step 2: Verify OTP
const verifyOtpSchema = z
  .object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

type Step = 'request' | 'verify' | 'success';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(true); // Toggle between email/username
  const [identifier, setIdentifier] = useState(''); // Store email/username
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form for Step 1: Request OTP
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
  });

  // Form for Step 2: Verify OTP and Reset Password
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: errorsVerify },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Step 1: Request OTP
  const handleRequestOtp = async (formData: RequestOtpFormData) => {
    setIsLoading(true);
    try {
      // Send either email or username based on toggle
      const requestData = useEmail
        ? { email: formData.identifier }
        : { username: formData.identifier };

      await authApi.requestPasswordResetOtp(requestData);

      setIdentifier(formData.identifier);
      setCurrentStep('verify');
      toast.success(`✉️ OTP sent to your ${useEmail ? 'email' : 'account'}!`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyOtp = async (formData: VerifyOtpFormData) => {
    setIsLoading(true);
    try {
      // Send either email or username based on toggle
      const verifyData = {
        ...(useEmail ? { email: identifier } : { username: identifier }),
        otp: formData.otp,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      };

      await authApi.verifyPasswordResetOtp(verifyData);

      setCurrentStep('success');
      toast.success('🎉 Password reset successful!');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Invalid OTP or failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
          {/* Back Button */}
          {currentStep === 'request' && (
            <a
              href={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </a>
          )}

          {/* Step 1: Request OTP */}
          {currentStep === 'request' && (
            <>
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-xl opacity-50" />
                    <div className="relative p-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg ring-4 ring-white/50">
                      <Mail className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    Forgot Password? 🔒
                  </h1>
                  <p className="text-gray-600 text-base">
                    Don't worry! Enter your {useEmail ? 'email' : 'username'} and we'll send you an
                    OTP
                  </p>
                </div>
              </div>

              {/* Email/Username Toggle */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        useEmail ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {useEmail ? 'Using Email Address' : 'Using Username'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {useEmail
                          ? 'We will send OTP to your email'
                          : 'Enter your registered username'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={useEmail}
                    onCheckedChange={setUseEmail}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitRequest(handleRequestOtp)} className="space-y-6">
                {/* Email/Username Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="identifier"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <span className="flex items-center justify-center w-6 h-6 bg-teal-100 rounded-full text-teal-700 text-xs font-bold">
                      {useEmail ? '📧' : '👤'}
                    </span>
                    {useEmail ? 'Email Address' : 'Username'}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="identifier"
                      type={useEmail ? 'email' : 'text'}
                      placeholder={useEmail ? 'Enter your email address' : 'Enter your username'}
                      className={cn(
                        'w-full h-14 pl-12 pr-4 rounded-xl border-2 text-base transition-all duration-200',
                        'focus:outline-none focus:ring-4',
                        errorsRequest.identifier
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-400 focus:ring-teal-100'
                      )}
                      {...registerRequest('identifier')}
                    />
                  </div>
                  {errorsRequest.identifier && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      ⚠️ {errorsRequest.identifier.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send OTP
                    </>
                  )}
                </Button>
              </form>

              {/* Info Tip */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">
                      <strong>Remember your password?</strong> Go back to{' '}
                      <a
                        href={ROUTES.AUTH.LOGIN}
                        className="font-semibold underline hover:text-blue-700"
                      >
                        sign in to {BRANDING.APP_NAME}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Verify OTP and Reset Password */}
          {currentStep === 'verify' && (
            <>
              {/* Back Button */}
              <button
                onClick={() => setCurrentStep('request')}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Send OTP
              </button>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-xl opacity-50" />
                    <div className="relative p-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg ring-4 ring-white/50">
                      <Mail className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    Verify OTP �
                  </h2>
                  <p className="text-gray-600 text-base">We've sent a 6-digit OTP to</p>
                  <p className="text-lg font-semibold text-teal-600">{identifier}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitVerify(handleVerifyOtp)} className="space-y-5">
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                    Enter 6-Digit Code
                  </Label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    className={cn(
                      'w-full h-16 text-center text-2xl font-bold tracking-[0.5em] border-2 rounded-xl transition-all',
                      'focus:outline-none focus:ring-4',
                      errorsVerify.otp
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100'
                    )}
                    {...registerVerify('otp', {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      },
                    })}
                  />
                  {errorsVerify.otp && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      ⚠️ {errorsVerify.otp.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className={cn(
                        'w-full h-14 pl-4 pr-12 rounded-xl border-2 text-base transition-all duration-200',
                        'focus:outline-none focus:ring-4',
                        errorsVerify.newPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-400 focus:ring-teal-100'
                      )}
                      {...registerVerify('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errorsVerify.newPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      ⚠️ {errorsVerify.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className={cn(
                        'w-full h-14 pl-4 pr-12 rounded-xl border-2 text-base transition-all duration-200',
                        'focus:outline-none focus:ring-4',
                        errorsVerify.confirmPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-400 focus:ring-teal-100'
                      )}
                      {...registerVerify('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errorsVerify.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      ⚠️ {errorsVerify.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Password must contain:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✓ At least 8 characters</li>
                    <li>✓ One uppercase letter (A-Z)</li>
                    <li>✓ One lowercase letter (a-z)</li>
                    <li>✓ One number (0-9)</li>
                    <li>✓ One special character (!@#$%^&*)</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentStep('request')}
                  className="text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg ring-4 ring-white/50">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Password Reset Successful! 🎉
                  </h2>
                  <p className="text-gray-600 text-base">
                    Your password has been changed successfully.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <p className="text-green-900 font-medium mb-3">
                    ✅ You can now sign in with your new password
                  </p>
                  <ul className="text-sm text-green-800 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>Keep your password secure and don't share it with anyone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>💡</span>
                      <span>Use a password manager for better security</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-xl"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
