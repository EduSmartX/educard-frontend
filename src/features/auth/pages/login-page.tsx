import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, UserCircle2 } from 'lucide-react';
import { authApi, type LoginCredentials } from '@/lib/api/auth-api';
import { ROUTES, BRANDING } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/branding';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(formData as LoginCredentials);

      // Check if organization is approved
      if (response.organization && !response.organization.is_approved) {
        toast.warning('Organization pending approval');
        navigate(ROUTES.AUTH.ORGANIZATION_NOT_APPROVED, {
          state: {
            organizationName: response.organization.name,
            organizationEmail: response.organization.email,
            organizationPhone: response.organization.phone,
            isVerified: response.organization.is_verified,
          },
        });
        return;
      }

      toast.success('Login successful!');

      // Redirect to dashboard (role-based routing handled by DashboardRouter)
      navigate(ROUTES.DASHBOARD);
    } catch (error: unknown) {
      // Error handling is done in api.ts interceptor
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo variant="icon" size="xl" withGlow withRing />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-gray-600 text-base">
                Sign in to access your {BRANDING.APP_NAME} account
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <span className="flex items-center justify-center w-6 h-6 bg-teal-100 rounded-full text-teal-700 text-xs font-bold">
                  1
                </span>
                Username or Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  placeholder="Enter your username or email"
                  className="h-14 pl-12 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 text-base transition-all duration-200"
                  error={errors.username?.message}
                  {...register('username')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-teal-100 rounded-full text-teal-700 text-xs font-bold">
                    2
                  </span>
                  Password
                </Label>
                <a
                  href={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 pl-12 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 text-base transition-all duration-200"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-xl"
              isLoading={isLoading}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>

            {/* Sign Up Link */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">New to {BRANDING.APP_NAME}?</span>
              </div>
            </div>

            <div className="text-center">
              <a
                href={ROUTES.AUTH.SIGNUP}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
              >
                <UserCircle2 className="h-5 w-5" />
                Create an account
              </a>
            </div>
          </form>

          {/* Info Tip */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <p className="text-sm text-amber-900 font-medium">
                  <strong>First time?</strong> Sign up to create your organization account and start
                  managing your educational institution efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
