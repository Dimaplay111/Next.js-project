// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/store";
import { EmployeeSchema } from "../../lib/validations";
import { paginate } from "../../lib/pagination";

// GET /api/employees (Получение списка с пагинацией + поиск + фильтр)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const query = searchParams.get("q")?.toLowerCase() || "";
    const companyId = searchParams.get("companyId") || "";
    
    let filtered = [...db.employees];
    // 1. Фильтрация по связанной сущности (Компания) - Требование 3.7.2
    if (companyId) {
      filtered = filtered.filter(e => e.companyId === companyId);
    }

    // 2. Текстовый поиск (По ФИО или Email) - Требование 3.7.1
    if (query) {
      filtered = filtered.filter(e => 
        e.fullName.toLowerCase().includes(query) || 
        e.email.toLowerCase().includes(query) ||
        e.position?.toLowerCase().includes(query)
      );
    }

    // Подмешиваем данные компании к каждому сотруднику (Вложенность - Требование 3.3)
    const itemsWithCompany = filtered.map(employee => ({
      ...employee,
      company: db.companies.find(c => c.id === employee.companyId) || null
    }));

    // 3. Пагинация - Требование 3.7.3
    const result = paginate(itemsWithCompany, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

// POST /api/employees (Создание сотрудника с валидацией)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация Zod
    const validation = EmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Ошибка валидации", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 422 });
    }

    const data = validation.data;

    // Проверка уникальности Email
    const emailExists = db.employees.some(e => e.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return NextResponse.json({ error: "Сотрудник с таким Email уже существует" }, { status: 422 });
    }

    // Проверка существования указанной компании
    const companyExists = db.companies.some(c => c.id === data.companyId);
    if (!companyExists) {
      return NextResponse.json({ error: "Указанная компания не существует" }, { status: 422 });
    }

    const newEmployee = {
      id: crypto.randomUUID(),
      ...data,
      position: data.position || undefined,
      birthDate: data.birthDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.employees.push(newEmployee);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Некорректный JSON или ошибка сервера" }, { status: 400 });
  }
}
