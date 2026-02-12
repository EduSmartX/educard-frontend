/**
 * Teacher Form Utility Functions
 * Transforms form data to API payload format
 */

import type { TeacherFormValues } from '../schemas/teacher-form-schema';
import type { CreateTeacherPayload, TeacherDetail } from '../types';
import type { GenderValue, BloodGroupValue } from '@/constants/form-enums';

/**
 * Transform form values to API payload format
 * Backend expects nested user object with address
 */
export function transformFormToPayload(values: TeacherFormValues): CreateTeacherPayload {
  // Check if any address fields are filled
  const hasAddress =
    values.street_address ||
    values.address_line_2 ||
    values.city ||
    values.state ||
    values.postal_code ||
    values.country;

  // Build the payload with nested user object
  const payload: CreateTeacherPayload = {
    employee_id: values.employee_id,
    user: {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      gender: values.gender,
      organization_role_code: values.organization_role,
    },
  };

  // Add optional user fields
  if (values.phone) {
    payload.user.phone = values.phone;
  }

  if (values.blood_group) {
    payload.user.blood_group = values.blood_group;
  }

  if (values.date_of_birth) {
    payload.user.date_of_birth = values.date_of_birth;
  }

  if (values.supervisor_email) {
    payload.user.supervisor_email = values.supervisor_email;
  }

  // Add address if any field is filled
  if (hasAddress) {
    payload.user.address = {
      street_address: values.street_address || '',
      address_line_2: values.address_line_2 || '',
      city: values.city || '',
      state: values.state || '',
      zip_code: values.postal_code || '',
      country: values.country || 'India',
    };
  }

  // Add optional teacher fields
  if (values.designation) {
    payload.designation = values.designation;
  }

  if (values.highest_qualification) {
    payload.highest_qualification = values.highest_qualification;
  }

  if (values.specialization) {
    payload.specialization = values.specialization;
  }

  if (values.experience_years !== undefined) {
    payload.experience_years = values.experience_years;
  }

  if (values.joining_date) {
    payload.joining_date = values.joining_date;
  }

  if (values.emergency_contact_name) {
    payload.emergency_contact_name = values.emergency_contact_name;
  }

  if (values.emergency_contact_number) {
    payload.emergency_contact_number = values.emergency_contact_number;
  }

  if (values.subjects && values.subjects.length > 0) {
    payload.subjects = values.subjects;
  }

  return payload;
}

/**
 * Transform teacher response to form values for editing
 */
export function transformTeacherToForm(teacher: TeacherDetail): Partial<TeacherFormValues> {
  return {
    employee_id: teacher.employee_id || '',
    email: teacher.user?.email || '',
    first_name: teacher.user?.first_name || '',
    last_name: teacher.user?.last_name || '',
    phone: teacher.user?.phone || '',
    gender: (teacher.user?.gender as GenderValue) || undefined,
    blood_group: (teacher.user?.blood_group as BloodGroupValue) || undefined,
    date_of_birth: teacher.user?.date_of_birth || '',
    organization_role: teacher.user?.organization_role || '',
    supervisor_email: teacher.user?.supervisor?.email || '',
    designation: teacher.designation || '',
    highest_qualification: teacher.highest_qualification || '',
    specialization: teacher.specialization || '',
    experience_years: teacher.experience_years || undefined,
    joining_date: teacher.joining_date || '',
    emergency_contact_name: teacher.emergency_contact_name || '',
    emergency_contact_number: teacher.emergency_contact_number || '',
    street_address: teacher.user?.address?.street_address || '',
    address_line_2: teacher.user?.address?.address_line_2 || '',
    city: teacher.user?.address?.city || '',
    state: teacher.user?.address?.state || '',
    postal_code: teacher.user?.address?.zip_code || '',
    country: teacher.user?.address?.country || 'India',
    // Convert subject public_ids (strings) back to numbers
    subjects: teacher.subjects?.map((subject) => parseInt(subject.public_id)) || [],
  };
}
