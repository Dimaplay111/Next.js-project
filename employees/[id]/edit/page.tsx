// app/employees/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Company } from "../../../types";

type Params = { params: Promise<{ id: string }> };

export default function EditEmployeePage({ params }: Params) {
  const router = useRouter();
  const { id } = use(params);

  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Состояния полей формы
  const [formData, setFormData] = useState({
    fullName: "",
    companyId: "",
    email: "",
    salary: "",
    position: "",
    birthDate: ""
  });

  // Системные состояния
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Загружаем одновременно данные сотрудника и список компаний для выпадающего списка
  useEffect(() => {
    async function loadData() {
      try {
        const [employee, companiesRes] = await Promise.all([
          api.employees.getById(id),
          api.companies.getAll(1, 100)
        ]);

        setCompanies(companiesRes.items);
        setFormData({
          fullName: employee.fullName,
          companyId: employee.companyId,
          email: employee.email,
          salary: String(employee.salary),
          position: employee.position || "",
          birthDate: employee.birthDate || ""
        });
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.employees.update(id, {
        ...formData,
        salary: Number(formData.salary),
        position: formData.position || undefined,
        birthDate: formData.birthDate || undefined
      });
      router.push("/employees");
    } catch (err: any) {
      setError(err.message || "Ошибка при обновлении данных сотрудника");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Загрузка данных...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Редактирование сотрудника</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ФИО сотрудника <span className="text-rose-500">*</span>
          </label>
          <input 
            type="text" required minLength={2}
            value={formData.fullName} 
            onChange={e => setFormData({...formData, fullName: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Компания <span className="text-rose-500">*</span>
          </label>
          <select 
            required 
            value={formData.companyId} 
            onChange={e => setFormData({...formData, companyId: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Выберите компанию...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <input 
              type="email" required 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Зарплата (₽) <span className="text-rose-500">*</span>
            </label>
            <input 
              type="number" required min={0}
              value={formData.salary} 
              onChange={e => setFormData({...formData, salary: e.target.value})} 
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Должность</label>
            <input 
              type="text" 
              value={formData.position} 
              onChange={e => setFormData({...formData, position: e.target.value})} 
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Дата рождения</label>
            <input 
              type="date" 
              value={formData.birthDate} 
              onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button 
            type="button" onClick={() => router.push("/employees")} 
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            type="submit" disabled={submitting} 
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitting ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
}
