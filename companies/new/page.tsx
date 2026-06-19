// app/companies/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function NewCompanyPage() {
  const router = useRouter();
  
  // Состояния полей формы
  const [formData, setFormData] = useState({
    name: "",
    employeesCount: "",
    isVerified: false,
    website: ""
  });
  
  // Системные состояния (загрузка и ошибки бэкенда)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Отправка данных на бэкенд с приведением типов
      await api.companies.create({
        name: formData.name,
        employeesCount: Number(formData.employeesCount),
        isVerified: formData.isVerified,
        website: formData.website || undefined // Передаем undefined, если строка пустая
      });
      
      // Перенаправление на список при успешном создании (требование 3.5)
      router.push("/companies");
    } catch (err: any) {
      // Пытаемся распарсить детальные ошибки валидации Zod с бэкенда
      if (err.details) {
        setFieldErrors(err.details);
      }
      setError(err.message || "Произошла ошибка при создании компании");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Новая компания</h1>
      
      {/* Отображение общих ошибок с бэкенда */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Название компании (Строка, Обязательное) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Название компании <span className="text-rose-500">*</span>
          </label>
          <input 
            type="text" 
            required 
            minLength={2}
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="ООО Вектор"
          />
          {fieldErrors.name && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.name.join(", ")}</p>
          )}
        </div>

        {/* Количество сотрудников (Число, Обязательное) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Планируемое количество сотрудников <span className="text-rose-500">*</span>
          </label>
          <input 
            type="number" 
            required 
            min={0}
            value={formData.employeesCount} 
            onChange={e => setFormData({...formData, employeesCount: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
          {fieldErrors.employeesCount && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.employeesCount.join(", ")}</p>
          )}
        </div>

        {/* Веб-сайт (Строка/URL, Опциональное) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Веб-сайт
          </label>
          <input 
            type="url" 
            value={formData.website} 
            onChange={e => setFormData({...formData, website: e.target.value})} 
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com"
          />
          {fieldErrors.website && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.website.join(", ")}</p>
          )}
        </div>

        {/* Статус проверки (Булево, Обязательное) */}
        <div className="flex items-start pt-2">
          <div className="flex items-center h-5">
            <input
              id="isVerified"
              type="checkbox"
              checked={formData.isVerified}
              onChange={e => setFormData({...formData, isVerified: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isVerified" className="font-medium text-slate-700 cursor-pointer">
              Компания проверена аккаунт-менеджером
            </label>
            <p className="text-xs text-slate-400">Установка флага подтверждает юридический статус компании.</p>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
          <button 
            type="button" 
            onClick={() => router.push("/companies")} 
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </div>
  );
}
