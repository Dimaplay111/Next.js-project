// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight mb-4">
        Система учета контрагентов и персонала
      </h1>
      <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
        Приложение по учету компаний и их сотрудников
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/companies" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          Управлять компаниями
        </Link>
        <Link href="/employees" className="inline-flex justify-center items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
          Список сотрудников
        </Link>
      </div>
    </div>
  );
}
