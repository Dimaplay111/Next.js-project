// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/store";
import { EmployeePatchSchema } from "../../../lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/employees/:id
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const employee = db.employees.find(e => e.id === id);
  
  if (!employee) {
    return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
  }

  // Возвращаем вложенную связанную сущность компании (Требование 3.3)
  const company = db.companies.find(c => c.id === employee.companyId) || null;
  
  return NextResponse.json({
    ...employee,
    company
  });
}

// PATCH /api/employees/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const index = db.employees.findIndex(e => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
    }

    const body = await request.json();
    const validation = EmployeePatchSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Ошибка валидации", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 422 });
    }

    const data = validation.data;

    // Проверка уникальности Email при изменении
    if (data.email && data.email.toLowerCase() !== db.employees[index].email.toLowerCase()) {
      const emailExists = db.employees.some(e => e.email.toLowerCase() === data.email?.toLowerCase());
      if (emailExists) {
        return NextResponse.json({ error: "Сотрудник с таким Email уже существует" }, { status: 422 });
      }
    }

    // Проверка существования компании, если меняется companyId
    if (data.companyId) {
      const companyExists = db.companies.some(c => c.id === data.companyId);
      if (!companyExists) {
        return NextResponse.json({ error: "Указанная компания не существует" }, { status: 422 });
      }
    }

    const updatedEmployee = {
      ...db.employees[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    db.employees[index] = updatedEmployee;
    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 400 });
  }
}

// DELETE /api/employees/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = db.employees.findIndex(e => e.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
  }

  db.employees.splice(index, 1);
  return NextResponse.json({ message: "Сотрудник успешно удален" });
}
