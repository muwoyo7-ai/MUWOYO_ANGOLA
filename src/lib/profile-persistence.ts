export type ProfileFormState = {
  business_name: string;
  ai_name: string;
  transfer_phone: string;
  ai_personality: string;
  business_description: string;
  ai_rules: string;
  appointment_duration_minutes: number;
  accepts_appointments: boolean;
};

export const buildProfilePayload = ({
  userId,
  form,
  businessHours,
}: {
  userId: string;
  form: ProfileFormState;
  businessHours?: unknown;
}) => ({
  user_id: userId,
  business_name: form.business_name,
  ai_name: form.ai_name,
  transfer_phone: form.transfer_phone,
  ai_personality: form.ai_personality,
  business_description: form.business_description,
  ai_rules: form.ai_rules,
  appointment_duration_minutes: form.appointment_duration_minutes,
  accepts_appointments: form.accepts_appointments,
  ...(businessHours !== undefined ? { business_hours: businessHours } : {}),
});
