// lib/validations.ts
import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string().min(2, "Название компании должно быть не менее 2 символов"),
  employeesCount: z.number().min(0, "Количество сотрудников не может быть отрицательным"),
  isVerified: z.boolean(),
  website: z.string().url("Некорректный URL веб-сайта").optional().or(z.literal("")),
});

export const EmployeeSchema = z.object({
  companyId: z.string().min(1, "ID компании обязателен"),
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  salary: z.number().min(0, "Зарплата не может быть отрицательной"),
  email: z.string().email("Некорректный email адрес"),
  position: z.string().optional(),
  birthDate: z.string().optional(),
});

// Для PATCH делаем все поля опциональными (.partial())
export const CompanyPatchSchema = CompanySchema.partial();
export const EmployeePatchSchema = EmployeeSchema.partial();
