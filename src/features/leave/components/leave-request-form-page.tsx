/**
 * Leave Request Form Page
 * Handles create, edit, and view modes for leave requests
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
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
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { ErrorMessages, FormPlaceholders, SuccessMessages, ToastTitles } from '@/constants';
import { getErrorMessage, applyFieldErrors } from '@/lib/utils/error-handler';
import { formatDate, formatLocalDate, parseLocalDate } from '@/lib/utils/date-utils';
import {
  useLeaveRequest,
  useMyLeaveBalancesSummary,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useCalculateWorkingDays,
} from '../hooks';
import { leaveRequestFormSchema, type LeaveRequestFormData } from '../schemas';
import type { HolidayInfo, WorkingDaysCalculation } from '../types';
import { LEAVE_STATUS_CONFIG } from '../types';
import { getLeaveTypeName } from '../utils/leave-name-helper';

type PageMode = 'create' | 'edit' | 'view';

export function LeaveRequestFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [_holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [workingDaysInfo, setWorkingDaysInfo] = useState<WorkingDaysCalculation | null>(null);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const [conflictingLeaves, setConflictingLeaves] = useState<string[]>([]);

  const isInitialMount = useRef(true);
  const formPopulated = useRef(false);

  // Determine mode based on URL
  const getMode = (): PageMode => {
    if (!id) return 'create';
    if (location.pathname.endsWith('/edit')) return 'edit';
    return 'view';
  };

  const mode = getMode();

  // Fetch leave balances
  const { data: balancesData, isLoading: isLoadingBalances } = useMyLeaveBalancesSummary();

  // Fetch existing request if editing or viewing
  const { data: requestData, isLoading: isLoadingRequest } = useLeaveRequest(id, false);

  const balances = balancesData?.data || [];
  const request = requestData?.data;

  // Mutations
  const createMutation = useCreateLeaveRequest();
  const updateMutation = useUpdateLeaveRequest();
  const calculateMutation = useCalculateWorkingDays();

  // Form
  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      leave_balance: '',
      start_date: '',
      end_date: '',
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
      // Skip in view mode
      if (mode === 'view') return;

      // Skip initial load in edit mode
      if (mode === 'edit' && isInitialMount.current) return;

      const start = parseLocalDate(startDate)!;
      const end = parseLocalDate(endDate)!;

      if (end < start) {
        setDateRangeError('End date must be on or after start date');
        setHolidays([]);
        setWorkingDaysInfo(null);
        form.setValue('number_of_days', 0);
        return;
      }

      setDateRangeError(null);

      // Clear previous conflicting leaves before a fresh calculation
      setConflictingLeaves([]);

      calculateMutation.mutate(
        { start_date: startDate, end_date: endDate },
        {
          onSuccess: (response) => {
            const calculation = response.data;
            setWorkingDaysInfo(calculation);
            setHolidays(calculation.holidays || []);
            const days = calculation.working_days ?? calculation.leave_days ?? 0;
            form.setValue('number_of_days', days);
            // Clear any conflicts when calculation succeeds
            setConflictingLeaves([]);
          },
          onError: (error) => {
            const apiError = error as {
              response?: { data?: { data?: { conflicting_leaves?: string[] } } };
            };
            if (apiError?.response?.data?.data?.conflicting_leaves) {
              setConflictingLeaves(apiError.response.data.data.conflicting_leaves);
              setDateRangeError(null);
            } else {
              const errorMessage = getErrorMessage(error, 'Failed to calculate working days');
              setDateRangeError(errorMessage);
              setConflictingLeaves([]);
            }
            setHolidays([]);
            setWorkingDaysInfo(null);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, mode]);

  const isHalfDay = form.watch('is_half_day');

  useEffect(() => {
    if (!workingDaysInfo) return;

    const base = workingDaysInfo.working_days ?? workingDaysInfo.leave_days ?? 0;
    const adjusted = Math.max(0, base - (isHalfDay ? 0.5 : 0));
    form.setValue('number_of_days', adjusted);
  }, [isHalfDay, workingDaysInfo, form]);

  const onSubmit = (data: LeaveRequestFormData) => {
    // Clear any previous conflicts
    setConflictingLeaves([]);

    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success(SuccessMessages.LEAVE.REQUEST_SUBMITTED);
          navigate('/leave/dashboard');
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(error, ErrorMessages.LEAVE.CREATE_REQUEST_FAILED);
          toast.error(ToastTitles.ERROR, { description: errorMessage });
          applyFieldErrors(error, form.setError);

          // Handle conflicting leaves
          const apiError = error as {
            response?: { data?: { data?: { conflicting_leaves?: string[] } } };
          };
          if (apiError?.response?.data?.data?.conflicting_leaves) {
            setConflictingLeaves(apiError.response.data.data.conflicting_leaves);
          }
        },
      });
    } else if (mode === 'edit') {
      updateMutation.mutate(
        {
          publicId: id!,
          data: {
            start_date: data.start_date,
            end_date: data.end_date,
            number_of_days: data.number_of_days,
            reason: data.reason,
          },
        },
        {
          onSuccess: () => {
            toast.success(SuccessMessages.LEAVE.REQUEST_UPDATED);
            navigate(`/leave/requests/${id}`);
          },
          onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, ErrorMessages.LEAVE.UPDATE_REQUEST_FAILED);
            toast.error(ToastTitles.ERROR, { description: errorMessage });
            applyFieldErrors(error, form.setError);

            // Handle conflicting leaves
            const apiError = error as {
              response?: { data?: { data?: { conflicting_leaves?: string[] } } };
            };
            if (apiError?.response?.data?.data?.conflicting_leaves) {
              setConflictingLeaves(apiError.response.data.data.conflicting_leaves);
            }
          },
        }
      );
    }
  };

  const handleBack = () => {
    navigate('/leave/dashboard');
  };

  const handleEdit = () => {
    navigate(`/leave/requests/${id}/edit`);
  };

  const isLoading = isLoadingBalances || (!!id && isLoadingRequest);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
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

  const hasNoAllocatedBalances = mode === 'create' && balances.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader title={title} icon={Briefcase}>
        {mode === 'view' && request?.status === 'pending' && (
          <Button
            onClick={handleEdit}
            variant="brandOutline"
          >
            Edit
          </Button>
        )}
        <Button onClick={handleBack} variant="brandOutline">
          Back to Dashboard
        </Button>
      </PageHeader>

      {hasNoAllocatedBalances && (
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto max-w-2xl text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No Allocated Leave Balances</h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any allocated leave balances yet, so you cannot submit a leave
                request right now.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact your supervisor or administrator to allocate leave balances for your
                account.
              </p>
              <div className="pt-2">
                <Button onClick={handleBack} variant="brandOutline">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasNoAllocatedBalances && (

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
                          <SelectValue placeholder={FormPlaceholders.SELECT_LEAVE_TYPE} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {balances.map((balance) => (
                          <SelectItem key={balance.public_id} value={balance.public_id}>
                            <div className="flex items-center justify-between w-full gap-8">
                              <span className="font-medium">{getLeaveTypeName(balance)}</span>
                              <Badge
                                variant="outline"
                                className="ml-auto bg-green-50 text-green-700 border-green-200"
                              >
                                {balance.available} available
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <DatePicker
                          value={field.value ? parseLocalDate(field.value) : null}
                          onChange={(date) => {
                            field.onChange(date ? formatLocalDate(date) : '');
                          }}
                          disabled={mode === 'view'}
                          placeholder={FormPlaceholders.SELECT_START_DATE}
                        />
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
                        <DatePicker
                          value={field.value ? parseLocalDate(field.value) : null}
                          onChange={(date) => {
                            field.onChange(date ? formatLocalDate(date) : '');
                          }}
                          disabled={mode === 'view'}
                          placeholder={FormPlaceholders.SELECT_END_DATE}
                          minDate={
                            form.watch('start_date')
                              ? parseLocalDate(form.watch('start_date'))
                              : undefined
                          }
                        />
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
                  <AlertDescription>{dateRangeError}</AlertDescription>
                </Alert>
              )}

              {/* Conflicting Leaves Error */}
              {conflictingLeaves.length > 0 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-semibold">
                        You already have a pending or approved leave request that overlaps with the
                        selected dates.
                      </div>
                      <div className="font-medium mt-2">Conflicting Leaves:</div>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {conflictingLeaves.map((leave, index) => (
                          <li key={index} className="text-sm text-red-800">
                            {leave}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Working Days Info */}
              {workingDaysInfo && !dateRangeError && (
                <div className="space-y-4 border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Total Days:</span>
                          <span className="font-semibold text-gray-900">
                            {workingDaysInfo.total_days}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Weekends + Holidays:</span>
                          <span className="font-semibold text-gray-900">
                            {workingDaysInfo.holidays.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                          <span className="font-semibold text-gray-900">Leave Days:</span>
                          <span className="font-bold text-blue-700 text-base">
                            {workingDaysInfo.leave_days}
                          </span>
                        </div>
                      </div>

                      {/* Holidays & Non-Working Days Table */}
                      {workingDaysInfo.holidays.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">
                            Holidays & Non-Working Days
                          </h4>
                          <div className="bg-white rounded border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Date
                                  </th>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Description
                                  </th>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Type
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {workingDaysInfo.holidays.map((holiday, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-gray-100 last:border-0"
                                  >
                                    <td className="py-2 px-3 text-gray-900">
                                      {formatDate(holiday.date)}
                                    </td>
                                    <td className="py-2 px-3 text-gray-700">
                                      {holiday.description || holiday.name || 'N/A'}
                                    </td>
                                    <td className="py-2 px-3">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                          holiday.type === 'WEEKEND'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-orange-100 text-orange-800'
                                        }`}
                                      >
                                        {holiday.type}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Half Day Checkbox */}
                      <FormField
                        control={form.control}
                        name="is_half_day"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0 mt-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                disabled={mode === 'view'}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </FormControl>
                            <div className="space-y-0">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                Half Day Leave
                              </FormLabel>
                              <p className="text-xs text-gray-500">
                                Check this to reduce 0.5 days from the total
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Number of Days (Auto-filled from API) */}
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
                        className="bg-gray-100 font-semibold text-gray-900"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically calculated based on dates and half-day selection
                    </p>
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
                        placeholder={FormPlaceholders.ENTER_LEAVE_REASON}
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
                    variant="brandOutline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={isSubmitting}
                    className="gap-2"
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
      )}
    </div>
  );
}
