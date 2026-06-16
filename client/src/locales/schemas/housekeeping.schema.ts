import { z } from 'zod';

export const HousekeepingTranslationSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  add_custom_task_placeholder: z.string().min(1),
  add_button: z.string().min(1),
  status: z.object({
    clean: z.string().min(1),
    dirty: z.string().min(1),
    cleaning: z.string().min(1),
  }),
  tasks_completed_suffix: z.string().min(1),
});