// app/employees/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { Company, Employee } from "../types";

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<(Employee & { company?: Company })[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Состояния фильтров
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Системные состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  // Загрузка списка компаний для фильтра (один раз при монтировании)
  useEffect(() => {
    api.companies.getAll(1, 100).then(res => setCompanies(res.items)).catch(console.error);
  }, []);

  // Основной эффект загрузки данных при изменении фильтров
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await api.employees.getAll(page, 5, debouncedSearch, selectedCompany);
        setEmployees(res.items);
        setTotalPages(res.pages);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить сотрудников");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, debouncedSearch, selectedCompany]);

  // Сброс страницы при изменении условий поиска
  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCompany]);

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого сотрудника?")) return;
    try {
      await api.employees.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message || "Ошибка при удалении");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Сотрудники</h1>
        <Link href="/employees/new" className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors self-start sm:self-auto">
          + Добавить сотрудника
        </Link>
      </div>

      {/* Панель фильтров (Поиск + Фильтрация) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Поиск по ФИО или Email</label>
          <input type="text" placeholder="Введите имя..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Фильтр по компании</label>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Все компании</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Вывод ошибок */}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">{error}</div>}

      {/* Таблица / Лоадер */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Загрузка данных...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-lg border border-dashed border-slate-300">Сотрудники не найдены</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">ФИО / Email</th>
                  <th className="px-6 py-3">Компания</th>
                  <th className="px-6 py-3">Должность</th>
                  <th className="px-6 py-3">Зарплата</th>
                  <th className="px-6 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{emp.fullName}</div>
                      <div className="text-xs text-slate-400">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{emp.company?.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{emp.position || "Не указана"}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">{emp.salary.toLocaleString()} ₽</td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <Link href={`/employees/${emp.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-medium">Редактировать</Link>
                      <button onClick={() => handleDelete(emp.id)} className="text-rose-600 hover:text-rose-900 font-medium">Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация (Назад / Далее) */}
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200 text-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors">
              Назад
            </button>
            <span className="text-slate-500 text-xs">Страница {page} из {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-colors">
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
