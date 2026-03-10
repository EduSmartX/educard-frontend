import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';
import {
  validateVerificationToken,
  verifyEmailAndSetPassword,
} from '@/features/teachers/api/teachers-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/constants/app-config';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: {
        [key: string]: string[];
      };
    };
  };
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Validate token and fetch user details
  const {
    data: userDetails,
    isLoading: isValidating,
    error: validationError,
  } = useQuery({
    queryKey: ['validateToken', token],
    queryFn: () => validateVerificationToken(token!),
    enabled: !!token,
    retry: false,
  });

  // Set password mutation
  const setPasswordMutation = useMutation({
    mutationFn: (data: { token: string; password: string; confirm_password: string }) =>
      verifyEmailAndSetPassword(data),
    onSuccess: () => {
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.AUTH.LOGIN);
      }, 3000);
    },
  });

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.AUTH.LOGIN);
    }
  }, [token, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validate password
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordMutation.mutate({
      token: token!,
      password,
      confirm_password: confirmPassword,
    });
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg font-medium text-gray-700">Validating verification link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - Invalid or expired token
  if (validationError || !userDetails) {
    const error = validationError as ApiError;
    const errorMessage =
      error?.response?.data?.errors?.token?.[0] ||
      error?.response?.data?.message ||
      'Invalid or expired verification link';

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
            <CardDescription className="text-base">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(ROUTES.AUTH.LOGIN)} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - Password set successfully
  if (setPasswordMutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Success!</CardTitle>
            <CardDescription className="text-base">
              Your email has been verified and password has been set successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-center text-sm text-green-800">
                You can now log in with your username: <strong>{userDetails.username}</strong>
              </AlertDescription>
            </Alert>
            <p className="text-center text-sm text-gray-500">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form - Set password
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Your Password</CardTitle>
          <CardDescription className="text-base">
            Welcome, {userDetails.first_name} {userDetails.last_name}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Display */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userDetails.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Username Display */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={userDetails.username}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Use this username to log in</p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(passwordError || setPasswordMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {passwordError ||
                    (() => {
                      const error = setPasswordMutation.error as ApiError;
                      return (
                        error?.response?.data?.errors?.password?.[0] ||
                        error?.response?.data?.message ||
                        'Failed to set password'
                      );
                    })()}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={setPasswordMutation.isPending}
            >
              {setPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                'Set Password & Activate Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
