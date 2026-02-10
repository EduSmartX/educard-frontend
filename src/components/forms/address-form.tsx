import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentLocationAddress } from '@/lib/location-utils';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any; // UseFormReturn from react-hook-form
  required?: boolean;
  fieldPrefix?: string; // For nested form fields like 'address.city'
  showHeader?: boolean;
  compact?: boolean; // For smaller layouts
  showLocationButton?: boolean; // Show "Use My Location" button
}

export function AddressForm({
  form,
  required = false,
  fieldPrefix = '',
  showHeader = true,
  compact = false,
  showLocationButton = true,
}: AddressFormProps) {
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);

  const getFieldName = (field: string) => (fieldPrefix ? `${fieldPrefix}.${field}` : field);

  const inputHeight = compact ? 'h-12' : 'h-14';
  const labelSize = compact ? 'text-xs' : 'text-sm';

  // Handle "Use My Location" button click
  const handleUseLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const locationData = await getCurrentLocationAddress(apiKey);

      // Fill form fields with location data
      form.setValue(getFieldName('streetAddress'), locationData.streetAddress, {
        shouldValidate: true,
      });
      form.setValue(getFieldName('city'), locationData.city, { shouldValidate: true });
      form.setValue(getFieldName('state'), locationData.state, { shouldValidate: true });
      form.setValue(getFieldName('zipCode'), locationData.zipCode, { shouldValidate: true });
      form.setValue(getFieldName('country'), locationData.country, { shouldValidate: true });

      toast.success('📍 Location detected! Address fields filled automatically.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to get location';
      toast.error(errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Location Button */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📍</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800">Address Information</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {required ? 'Provide complete address details' : 'Optional address details'}
              </p>
            </div>
          </div>

          {/* Use My Location Button */}
          {showLocationButton && (
            <Button
              type="button"
              onClick={handleUseLocation}
              disabled={isLoadingLocation}
              className={cn(
                'flex items-center gap-2 h-9 px-3 border-2 border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-all text-xs font-medium',
                isLoadingLocation && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Use My Location
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Street Address */}
      <div className="space-y-2">
        <Label
          htmlFor={getFieldName('streetAddress')}
          className={`${labelSize} font-semibold text-gray-700 flex items-center gap-2`}
        >
          <span className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full text-green-700 text-xs font-bold">
            🏠
          </span>
          Street Address
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={getFieldName('streetAddress')}
          placeholder="123 Main Street"
          className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 transition-all`}
          error={form.formState.errors[getFieldName('streetAddress')]?.message as string}
          {...form.register(getFieldName('streetAddress'))}
        />
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label
          htmlFor={getFieldName('addressLine2')}
          className={`${labelSize} font-semibold text-gray-700`}
        >
          <span className="text-xs text-gray-500 font-normal">Address Line 2 (Optional)</span>
        </Label>
        <Input
          id={getFieldName('addressLine2')}
          placeholder="Suite, Building, Floor"
          className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition-all`}
          {...form.register(getFieldName('addressLine2'))}
        />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={getFieldName('city')}
            className={`${labelSize} font-semibold text-gray-700`}
          >
            City
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={getFieldName('city')}
            placeholder="City"
            className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all`}
            error={form.formState.errors[getFieldName('city')]?.message as string}
            {...form.register(getFieldName('city'))}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={getFieldName('state')}
            className={`${labelSize} font-semibold text-gray-700`}
          >
            State
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={getFieldName('state')}
            placeholder="State"
            className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all`}
            error={form.formState.errors[getFieldName('state')]?.message as string}
            {...form.register(getFieldName('state'))}
          />
        </div>
      </div>

      {/* ZIP Code & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={getFieldName('zipCode')}
            className={`${labelSize} font-semibold text-gray-700`}
          >
            ZIP Code
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={getFieldName('zipCode')}
            placeholder="12345"
            className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all`}
            error={form.formState.errors[getFieldName('zipCode')]?.message as string}
            {...form.register(getFieldName('zipCode'))}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={getFieldName('country')}
            className={`${labelSize} font-semibold text-gray-700`}
          >
            Country
          </Label>
          <Input
            id={getFieldName('country')}
            defaultValue="India"
            className={`${inputHeight} text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all`}
            {...form.register(getFieldName('country'))}
          />
        </div>
      </div>
    </div>
  );
}
