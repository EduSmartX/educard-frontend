/**
 * Leave Request Form Page (Rewritten)
 * Matches replit demo with all features: holidays table, half-day, working days calculation
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  useLeaveRequest,
  useMyLeaveBalancesSummary,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useCalculateWorkingDays,
} from '../hooks';
import { leaveRequestFormSchema, type LeaveRequestFormData } from '../schemas';
import type { HolidayInfo } from '../types';
import { LEAVE_STATUS_CONFIG } from '../types';

type PageMode = 'create' | 'edit' | 'view';

export function LeaveRequestFormPageNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const formPopulated = useRef(false);

  const getMode = (): PageMode => {
    if (!id) return 'create';
    if (location.pathname.endsWith('/edit')) return 'edit';
    return 'view';
  };

  const mode = getMode();

  const { data: balancesData, isLoading: isLoadingBalances } = useMyLeaveBalancesSummary();
  const { data: requestData, isLoading: isLoadingRequest } = useLeaveRequest(id, false);

  const balances = balancesData?.data || [];
  const request = requestData?.data;

  const createMutation = useCreateLeaveRequest();
  const updateMutation = useUpdateLeaveRequest();
  const calculateMutation = useCalculateWorkingDays();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      leave_balance: '',
      start_date: '',
      end_date: '',
      is_half_day: false,
      number_of_days: 1,
      reason: '',
    },
  });

  // Populate form for edit/view mode
  useEffect(() => {
    if (request && (mode === 'edit' || mode === 'view') && !formPopulated.current) {
      form.reset(
        {
          leave_balance: request.leave_balance_public_id,
          start_date: request.start_date,
          end_date: request.end_date,
          number_of_days: parseFloat(request.number_of_days.toString()),
          reason: request.reason,
        },
        { keepDefaultValues: false }
      );

      formPopulated.current = true;
      setTimeout(() => {
        isInitialMount.current = false;
      }, 100);
    }
  }, [request, mode, form]);

  // Auto-calculate working days
  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

  useEffect(() => {
    if (startDate && endDate) {
      if (mode === 'view') return;
      if (mode === 'edit' && isInitialMount.current) return;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        setDateRangeError('End date must be on or after start date');
        setHolidays([]);
        form.setValue('number_of_days', 0);
        return;
      }

      setDateRangeError(null);

      calculateMutation.mutate(
        { start_date: startDate, end_date: endDate },
        {
          onSuccess: (response) => {
            const calculation = response.data;
            setHolidays(calculation.holidays || []);
            form.setValue('number_of_days', calculation.working_days);
          },
          onError: (error) => {
            const errorMessage = getErrorMessage(error, 'Failed to calculate working days');
            setDateRangeError(errorMessage);
            setHolidays([]);
            form.setValue('number_of_days', 0);
          },
        }
      );
    } else {
      setHolidays([]);
      setDateRangeError(null);
    }
  }, [startDate, endDate, mode, form, calculateMutation]);

  const onSubmit = (data: LeaveRequestFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Leave Request Submitted', {
            description: 'Your leave request has been submitted successfully.',
          });
          navigate('/leave/dashboard');
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error, 'Failed to submit leave request');
          toast.error('Submission Failed', { description: errorMessage });
        },
      });
    } else if (mode === 'edit' && id) {
      updateMutation.mutate(
        { publicId: id, data },
        {
          onSuccess: () => {
            toast.success('Leave Request Updated', {
              description: 'Your leave request has been updated successfully.',
            });
            navigate('/leave/dashboard');
          },
          onError: (error) => {
            const errorMessage = getErrorMessage(error, 'Failed to update leave request');
            toast.error('Update Failed', { description: errorMessage });
          },
        }
      );
    }
  };

  const handleBack = () => navigate('/leave/dashboard');

  const handleEdit = () => {
    if (id) navigate(`/leave/requests/${id}/edit`);
  };

  const isLoading = isLoadingBalances || (!!id && isLoadingRequest);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const title =
    mode === 'create'
      ? 'Apply Leave'
      : mode === 'edit'
        ? 'Edit Leave Request'
        : 'Leave Request Details';

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        icon={Briefcase}
        description={mode === 'create' ? 'Make sure you have sufficient leave balance' : undefined}
      >
        {mode === 'view' && request?.status === 'pending' && (
          <Button
            onClick={handleEdit}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Edit
          </Button>
        )}
        <Button
          onClick={handleBack}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Leave Type */}
              <FormField
                control={form.control}
                name="leave_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type *</FormLabel>
                    <Select
                      key={`${id}-${field.value}`}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mode === 'view'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {balances.map((balance) => (
                          <SelectItem key={balance.public_id} value={balance.public_id}>
                            <div className="flex items-center gap-2">
                              <span>
                                {balance.leave_type_name} ({balance.leave_type_code})
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {balance.available} available
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose from your available leave types</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={mode === 'view'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={mode === 'view'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Range Error */}
              {dateRangeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-line">
                    {dateRangeError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Holidays Table */}
              {holidays.length > 0 && !dateRangeError && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Holidays & Non-Working Days</p>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holidays.map((holiday, index) => {
                          const isWeekend = holiday.type === 'WEEKEND';
                          return (
                            <TableRow key={`${holiday.date}-${index}`}>
                              <TableCell className="font-medium">
                                {new Date(holiday.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </TableCell>
                              <TableCell>
                                {holiday.description || holiday.name || 'Holiday'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={isWeekend ? 'secondary' : 'default'}>
                                  {holiday.type}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Half Day Checkbox */}
              {mode !== 'view' && (
                <FormField
                  control={form.control}
                  name="is_half_day"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            const currentDays = form.getValues('number_of_days');
                            if (checked) {
                              form.setValue('number_of_days', Math.max(0.5, currentDays - 0.5));
                            } else {
                              form.setValue('number_of_days', currentDays + 0.5);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Half Day Leave</FormLabel>
                        <FormDescription>
                          Check this to reduce 0.5 days from the total
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {/* Number of Days (Read-only) */}
              <FormField
                control={form.control}
                name="number_of_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Days *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        {...field}
                        value={field.value}
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Automatically calculated based on dates and half-day selection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter reason for leave..."
                        rows={4}
                        disabled={mode === 'view'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (View mode only) */}
              {mode === 'view' && request && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div>
                    <Badge className={LEAVE_STATUS_CONFIG[request.status].className}>
                      {LEAVE_STATUS_CONFIG[request.status].label}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {mode !== 'view' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || dateRangeError !== null || form.watch('number_of_days') <= 0
                    }
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Submit Request' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
