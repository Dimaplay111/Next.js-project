// types/index.ts

export interface Company {
  id: string;
  name: string;          // Строка (Обязательное, Уникальное)
  employeesCount: number; // Число (Обязательное)
  isVerified: boolean;    // Булево (Обязательное)
  website?: string;       // Строка (Опциональное)
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  companyId: string;      // Ссылка на Компанию (Обязательное)
  fullName: string;       // Строка (Обязательное)
  salary: number;         // Число (Обязательное)
  email: string;          // Строка (Обязательное, Уникальное)
  position?: string;      // Строка (Опциональное)
  birthDate?: string;     // Дата/Строка (Опциональное)
  createdAt: string;
  updatedAt: string;
}

// Дополнительный тип для GET /api/employees/[id] (вложенный автор/компания)
export interface EmployeeWithCompany extends Employee {
  company: Company | null;
}

// Тип ответа для пагинации
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
