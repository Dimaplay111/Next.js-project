// app/companies/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { Company } from "../types";

export default function CompaniesListPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  // Состояния фильтрации и пагинации
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  // Загрузка данных с сервера
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      setError("");
      try {
        const res = await api.companies.getAll(page, 5, debouncedSearch);
        setCompanies(res.items);
        setTotalPages(res.pages);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить список компаний");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [page, debouncedSearch]);

  // Сброс страницы на 1 при изменении поискового запроса
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Обработчик удаления компании с подтверждением
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены? Удаление компании повлечет удаление всех ее сотрудников!")) return;
    try {
      await api.companies.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Ошибка при удалении");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Компании</h1>
        <Link href="/companies/new" className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors self-start sm:self-auto">
          + Добавить компанию
        </Link>
      </div>

      {/* Панель поиска */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <label className="block text-xs font-medium text-slate-500 mb-1">Поиск по названию или сайту</label>
        <input 
          type="text" 
          placeholder="Введите название компании..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
      </div>

      {/* Обработка ошибок */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Список данных */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Загрузка данных...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-lg border border-dashed border-slate-300">
          Компании не найдены
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Название</th>
                  <th className="px-6 py-3">Сотрудники (план)</th>
                  <th className="px-6 py-3">Статус</th>
                  <th className="px-6 py-3">Сайт</th>
                  <th className="px-6 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {company.employeesCount} чел.
                    </td>
                    <td className="px-6 py-4">
                      {company.isVerified ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Проверена
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          В обработке
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-mono text-xs">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {company.website}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <Link href={`/companies/${company.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        Редактировать
                      </Link>
                      <button 
                        onClick={() => handleDelete(company.id)} 
                        className="text-rose-600 hover:text-rose-900 font-medium"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Кнопки пагинации */}
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200 text-sm">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors"
            >
              Назад
            </button>
            <span className="text-slate-500 text-xs">Страница {page} из {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors"
            >
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
