import { z } from 'zod'

import { vMsg } from '@/core/forms'

export const loginSchema = z.object({
  email: z.string().email(vMsg('validation:email')),
  password: z.string().min(6, vMsg('validation:minLength', { count: 6 })),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, vMsg('validation:minLength', { count: 2 })),
    email: z.string().email(vMsg('validation:email')),
    password: z.string().min(6, vMsg('validation:minLength', { count: 6 })),
    confirmPassword: z.string().min(1, vMsg('validation:required')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: vMsg('validation:passwordMismatch'),
    path: ['confirmPassword'],
  })
