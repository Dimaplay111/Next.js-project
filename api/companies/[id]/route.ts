// app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/store";
import { CompanyPatchSchema } from "../../../lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/companies/:id
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const company = db.companies.find(c => c.id === id);
  
  if (!company) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }
  return NextResponse.json(company);
}

// PATCH /api/companies/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const index = db.companies.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }

    const body = await request.json();
    const validation = CompanyPatchSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Ошибка валидации", details: validation.error.flatten().fieldErrors }, { status: 422 });
    }

    const data = validation.data;

    // Проверка уникальности имени, если оно меняется
    if (data.name && data.name.toLowerCase() !== db.companies[index].name.toLowerCase()) {
      const nameExists = db.companies.some(c => c.name.toLowerCase() === data.name?.toLowerCase());
      if (nameExists) {
        return NextResponse.json({ error: "Компания с таким названием уже существует" }, { status: 422 });
      }
    }

    const updatedCompany = {
      ...db.companies[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    db.companies[index] = updatedCompany;
    return NextResponse.json(updatedCompany);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 400 });
  }
}

// DELETE /api/companies/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = db.companies.findIndex(c => c.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }

  // Каскадное удаление или проверка связи (опционально, но хороший тон):
  // Удалим сотрудников, привязанных к этой компании
  db.employees = db.employees.filter(e => e.companyId !== id);

  db.companies.splice(index, 1);
  return NextResponse.json({ message: "Компания успешно удалена" });
}
