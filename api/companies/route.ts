// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/store";
import { CompanySchema } from "../../lib/validations";
import { paginate } from "../../lib/pagination";

// GET /api/companies (Получение списка с пагинацией + Поиск)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const query = searchParams.get("q")?.toLowerCase() || "";

    // Фильтрация (Поиск по текстовым полям: name, website)
    let filtered = db.companies;
    if (query) {
      filtered = db.companies.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.website?.toLowerCase().includes(query)
      );
    }

    const result = paginate(filtered, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

// POST /api/companies (Создание компании с валидацией)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация Zod
    const validation = CompanySchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Ошибка валидации", details: formattedErrors }, { status: 422 });
    }

    const data = validation.data;

    // Проверка уникальности поля 'name'
    const nameExists = db.companies.some(c => c.name.toLowerCase() === data.name.toLowerCase());
    if (nameExists) {
      return NextResponse.json({ error: "Компания с таким названием уже существует" }, { status: 422 });
    }

    const newCompany = {
      id: crypto.randomUUID(),
      ...data,
      website: data.website || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.companies.push(newCompany);
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Некорректный JSON или ошибка сервера" }, { status: 400 });
  }
}
