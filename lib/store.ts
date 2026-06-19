// lib/store.ts
import { Company, Employee } from "../types";

// Инициализация глобального хранилища во избежание сброса при Fast Refresh в Next.js
const globalForStore = global as unknown as {
  companies: Company[];
  employees: Employee[];
};

if (!globalForStore.companies) {
  globalForStore.companies = [
    { id: "c1", name: "TechCorp", employeesCount: 150, isVerified: true, website: "https://techcorp.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "c2", name: "GreenEnergy", employeesCount: 45, isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "c3", name: "CyberSecurity Inc", employeesCount: 80, isVerified: false, website: "https://cybersec.io", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "c4", name: "FoodDelivery", employeesCount: 300, isVerified: true, website: "https://fastfood.delivery", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "c5", name: "SmartHome Co", employeesCount: 22, isVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
}

if (!globalForStore.employees) {
  globalForStore.employees = [
    { id: "e1", companyId: "c1", fullName: "Иван Иванов", salary: 150000, email: "ivan@techcorp.com", position: "Frontend Dev", birthDate: "1995-05-12", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "e2", companyId: "c1", fullName: "Петр Петров", salary: 180000, email: "petr@techcorp.com", position: "Backend Dev", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "e3", companyId: "c2", fullName: "Анна Сидорова", salary: 120000, email: "anna@green.com", position: "HR Manager", birthDate: "1992-09-23", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "e4", companyId: "c3", fullName: "Алексей Смирнов", salary: 250000, email: "alex@cybersec.io", position: "Security Lead", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "e5", companyId: "c4", fullName: "Мария Федорова", salary: 90000, email: "maria@delivery.com", position: "Support", birthDate: "1998-02-02", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
}

export const db = {
  get companies() { return globalForStore.companies; },
  set companies(val) { globalForStore.companies = val; },
  get employees() { return globalForStore.employees; },
  set employees(val) { globalForStore.employees = val; }
};
