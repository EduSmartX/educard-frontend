/**
 * Phone Update Form
 * Update phone with OTP verification
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Phone, Send } from 'lucide-react';
import { z } from 'zod';
import { PhoneInput } from '@/components/forms/phone-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CommonUiText, FormPlaceholders } from '@/constants';
import { isValidTenDigitPhone } from '@/lib/phone-utils';
import { useUserProfile } from '../hooks/queries';
import { useSendOTP, useUpdatePhone } from '../hooks/mutations';

const PHONE_ERROR_MESSAGE = 'Please enter a valid 10-digit phone number';

const phoneSchema = z.object({
  new_phone: z.string().refine(isValidTenDigitPhone, {
    message: PHONE_ERROR_MESSAGE,
  }),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export function PhoneUpdateForm() {
  const { data: profile } = useUserProfile();
  const sendOTPMutation = useSendOTP();
  const updatePhoneMutation = useUpdatePhone();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpWindowActive = otpSent && countdown > 0;

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      new_phone: '',
      otp: '',
    },
  });

  useEffect(() => {
    if (!otpWindowActive) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpWindowActive, countdown]);

  const resetOtpState = () => {
    setOtpSent(false);
    setCountdown(0);
    form.setValue('otp', '');
    form.clearErrors('otp');
  };

  const handleSendOTP = () => {
    const phone = form.getValues('new_phone');
    if (!phone || !isValidTenDigitPhone(phone)) {
      form.setError('new_phone', {
        message: PHONE_ERROR_MESSAGE,
      });
      return;
    }

    form.clearErrors('new_phone');

    sendOTPMutation.mutate(
      { phone, purpose: 'PHONE_VERIFICATION' },
      {
        onSuccess: (data) => {
          setOtpSent(true);
          form.setValue('otp', '');
          form.clearErrors('otp');
          const expiresIn = data.data?.expires_in_minutes || 10;
          setCountdown(expiresIn * 60);
        },
      }
    );
  };

  const onSubmit = (values: PhoneFormValues) => {
    updatePhoneMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        resetOtpState();
      },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Update Phone Number</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Current Phone:</strong> {profile?.phone || 'Not set'}
          </p>
          <p className="mt-2 text-xs text-blue-700">
            An OTP will be sent to your new phone number for verification
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="new_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <PhoneInput
                      id="new_phone"
                      value={field.value}
                      onChange={(value) => {
                        if (otpSent && value !== field.value) {
                          resetOtpState();
                        }
                        field.onChange(value);
                      }}
                      error={form.formState.errors.new_phone?.message}
                      placeholder={FormPlaceholders.PHONE_EXAMPLE}
                      disabled={otpWindowActive}
                      compact
                      className="border-input bg-background ring-offset-background focus:border-ring focus:ring-ring h-10 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2"
                    />
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpWindowActive || sendOTPMutation.isPending}
                    >
                      {sendOTPMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {otpSent ? 'Resend OTP' : CommonUiText.SEND_OTP}
                        </>
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    {otpWindowActive ? (
                      <span className="text-green-600">
                        {sendOTPMutation.data?.message || 'OTP sent successfully.'} Expires in{' '}
                        {formatTime(countdown)}
                      </span>
                    ) : otpSent ? (
                      <span className="text-amber-600">
                        OTP expired. Send a new code to continue.
                      </span>
                    ) : (
                      'Send OTP to the new mobile number before verifying the change.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OTP Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={FormPlaceholders.ENTER_OTP_6_DIGIT}
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter the OTP sent to your new phone number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  resetOtpState();
                }}
                disabled={updatePhoneMutation.isPending}
              >
                {CommonUiText.RESET}
              </Button>
              <Button
                type="submit"
                disabled={!otpSent || !otpWindowActive || updatePhoneMutation.isPending}
              >
                {updatePhoneMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Phone className="mr-2 h-4 w-4" />
                {CommonUiText.UPDATE_PHONE}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
