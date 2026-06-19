// app/companies/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

type Params = { params: Promise<{ id: string }> };

export default function EditCompanyPage({ params }: Params) {
  const router = useRouter();
  const { id } = use(params); // Разворачиваем параметры в Next.js 14/15

  // Состояния полей формы
  const [formData, setFormData] = useState({
    name: "",
    employeesCount: "",
    isVerified: false,
    website: ""
  });

  // Системные состояния
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Загружаем текущие данные компании для предзаполнения формы
  useEffect(() => {
    async function loadCompany() {
      try {
        const company = await api.companies.getById(id);
        setFormData({
          name: company.name,
          employeesCount: String(company.employeesCount),
          isVerified: company.isVerified,
          website: company.website || ""
        });
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить данные компании");
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await api.companies.update(id, {
        name: formData.name,
        employeesCount: Number(formData.employeesCount),
        isVerified: formData.isVerified,
        website: formData.website || undefined
      });
      router.push("/companies"); // Редирект на список после изменения
    } catch (err: any) {
      if (err.details) setFieldErrors(err.details);
      setError(err.message || "Ошибка при обновлении компании");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Загрузка данных компании...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Редактирование компании</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Название компании <span className="text-rose-500">*</span>
          </label>
          <input 
            type="text" required minLength={2}
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {fieldErrors.name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.name.join(", ")}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Планируемое количество сотрудников <span className="text-rose-500">*</span>
          </label>
          <input 
            type="number" required min={0}
            value={formData.employeesCount} 
            onChange={e => setFormData({...formData, employeesCount: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {fieldErrors.employeesCount && <p className="text-xs text-rose-600 mt-1">{fieldErrors.employeesCount.join(", ")}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Веб-сайт</label>
          <input 
            type="url" 
            value={formData.website} 
            onChange={e => setFormData({...formData, website: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com"
          />
          {fieldErrors.website && <p className="text-xs text-rose-600 mt-1">{fieldErrors.website.join(", ")}</p>}
        </div>

        <div className="flex items-start pt-2">
          <div className="flex items-center h-5">
            <input
              id="isVerified" type="checkbox"
              checked={formData.isVerified}
              onChange={e => setFormData({...formData, isVerified: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isVerified" className="font-medium text-slate-700 cursor-pointer">Компания проверена</label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
          <button 
            type="button" onClick={() => router.push("/companies")} 
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
