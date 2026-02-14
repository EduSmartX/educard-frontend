import type { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInputField, GenderField } from '@/components/forms';
import type { StudentFormData } from '../schemas/student-form-schema';

interface MinimalStudentFieldsProps {
  control: Control<StudentFormData>;
  disabled?: boolean;
}

export function MinimalStudentFields({ control, disabled = false }: MinimalStudentFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information (Required Fields Only)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputField
          control={control}
          name="first_name"
          label="First Name"
          placeholder="Enter first name"
          disabled={disabled}
          required
          validationType="name"
          validationOptions={{ fieldName: 'First name' }}
        />
        <TextInputField
          control={control}
          name="last_name"
          label="Last Name"
          placeholder="Enter last name"
          disabled={disabled}
          required
          validationType="name"
          validationOptions={{ fieldName: 'Last name' }}
        />
        <TextInputField
          control={control}
          name="roll_number"
          label="Roll Number"
          placeholder="Enter roll number"
          disabled={disabled}
          required
          validationType="alphanumeric"
        />
        <GenderField control={control} name="gender" disabled={disabled} />
      </CardContent>
    </Card>
  );
}
