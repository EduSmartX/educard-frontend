import { ADDRESS_TYPE } from '@/constants/address-type';
import type { CreateStudentPayload, Student } from '../types';
import type { StudentFormData } from '../schemas/student-form-schema';

const DEFAULT_FIELD_ERROR_TOAST_MESSAGE = 'Please check the form fields for errors';

export const STUDENT_FORM_FIELD_ERROR_MAP = {
  'user.username': 'email',
  'user.email': 'email',
  'user.first_name': 'first_name',
  'user.last_name': 'last_name',
  'user.phone': 'phone',
  'user.gender': 'gender',
  'user.date_of_birth': 'date_of_birth',
  'user.blood_group': 'blood_group',
  'user.supervisor_email': 'supervisor_email',
  'user.address.address_type': 'addressType',
  'user.address.street_address': 'streetAddress',
  'user.address.address_line_2': 'addressLine2',
  'user.address.city': 'city',
  'user.address.state': 'state',
  'user.address.zip_code': 'zipCode',
  'user.address.country': 'country',
  admission_number: 'admission_number',
  roll_number: 'roll_number',
  admission_date: 'admission_date',
  guardian_name: 'guardian_name',
  guardian_phone: 'guardian_phone',
  guardian_email: 'guardian_email',
  guardian_relationship: 'guardian_relationship',
} as const;

export const STUDENT_FORM_DEFAULT_VALUES: StudentFormData = {
  first_name: '',
  last_name: '',
  roll_number: '',
  class_id: '',
  email: '',
  phone: '',
  gender: undefined,
  blood_group: undefined,
  date_of_birth: '',
  supervisor_email: '',
  admission_number: '',
  admission_date: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  guardian_relationship: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  medical_conditions: '',
  description: '',
  previous_school_name: '',
  previous_school_address: '',
  previous_school_class: '',
  addressType: ADDRESS_TYPE.USER_CURRENT,
  streetAddress: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
};

export function getStudentFormValuesFromInitialData(initialData: Student): StudentFormData {
  const userInfo = initialData.user_info;
  const address = userInfo.address;

  return {
    first_name: userInfo.first_name,
    last_name: userInfo.last_name,
    roll_number: initialData.roll_number,
    class_id: initialData.class_info.public_id,
    email: userInfo.email,
    phone: userInfo.phone || '',
    gender: userInfo.gender || undefined,
    blood_group: userInfo.blood_group || undefined,
    date_of_birth: userInfo.date_of_birth || '',
    supervisor_email: userInfo.supervisor?.email || '',
    admission_number: initialData.admission_number || '',
    admission_date: initialData.admission_date || '',
    guardian_name: initialData.guardian_name || '',
    guardian_phone: initialData.guardian_phone || '',
    guardian_email: initialData.guardian_email || '',
    guardian_relationship: initialData.guardian_relationship || '',
    emergency_contact_name: initialData.emergency_contact_name || '',
    emergency_contact_phone: initialData.emergency_contact_phone || '',
    medical_conditions: initialData.medical_conditions || '',
    description: initialData.description || '',
    previous_school_name: initialData.previous_school_name || '',
    previous_school_address: initialData.previous_school_address || '',
    previous_school_class: initialData.previous_school_class || '',
    addressType: address?.address_type || ADDRESS_TYPE.USER_CURRENT,
    streetAddress: address?.street_address || '',
    addressLine2: address?.address_line_2 || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zip_code || '',
    country: address?.country || '',
  };
}

export function transformStudentFormToPayload(data: StudentFormData): CreateStudentPayload {
  const hasAddress = data.streetAddress || data.city || data.state || data.zipCode || data.country;

  return {
    user: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || undefined,
      role: 'student',
      gender: data.gender || '',
      blood_group: data.blood_group,
      date_of_birth: data.date_of_birth || undefined,
      organization_role_code: 'STUDENT',
      supervisor_email: data.supervisor_email || undefined,
      address: hasAddress
        ? {
            address_type: data.addressType || ADDRESS_TYPE.USER_CURRENT,
            street_address: data.streetAddress || '',
            address_line_2: data.addressLine2 || undefined,
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zipCode || '',
            country: data.country || 'India',
          }
        : undefined,
    },
    roll_number: data.roll_number,
    admission_number: data.admission_number || undefined,
    admission_date: data.admission_date || undefined,
    guardian_name: data.guardian_name || undefined,
    guardian_phone: data.guardian_phone || undefined,
    guardian_email: data.guardian_email || undefined,
    guardian_relationship: data.guardian_relationship || undefined,
    medical_conditions: data.medical_conditions || undefined,
    description: data.description || undefined,
    emergency_contact_name: data.emergency_contact_name || undefined,
    emergency_contact_phone: data.emergency_contact_phone || undefined,
    previous_school_name: data.previous_school_name || undefined,
    previous_school_address: data.previous_school_address || undefined,
    previous_school_class: data.previous_school_class || undefined,
  };
}

export function shouldShowValidationToast(message?: string): boolean {
  return !!message && message !== DEFAULT_FIELD_ERROR_TOAST_MESSAGE;
}

export function scrollToFirstFormError() {
  setTimeout(() => {
    const firstError = document.querySelector('[data-error="true"], [aria-invalid="true"]');

    if (firstError) {
      firstError.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      const input = firstError.querySelector('input, textarea, select');
      if (input instanceof HTMLElement) {
        input.focus();
      }
    }
  }, 100);
}
