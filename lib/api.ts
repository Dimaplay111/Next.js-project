// lib/api.ts
import { PaginatedResponse, Company, Employee } from "../types";

const BASE_URL = "/api";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
  }
  return response.json();
}

export const api = {
  companies: {
    getAll: (page = 1, limit = 5, query = ""): Promise<PaginatedResponse<Company>> =>
      fetch(`${BASE_URL}/companies?page=${page}&limit=${limit}&q=${query}`).then(handleResponse),
    getById: (id: string): Promise<Company> =>
      fetch(`${BASE_URL}/companies/${id}`).then(handleResponse),
    create: (data: Partial<Company>): Promise<Company> =>
      fetch(`${BASE_URL}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Company>): Promise<Company> =>
      fetch(`${BASE_URL}/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ message: string }> =>
      fetch(`${BASE_URL}/companies/${id}`, { method: "DELETE" }).then(handleResponse),
  },
  employees: {
    getAll: (page = 1, limit = 5, query = "", companyId = ""): Promise<PaginatedResponse<Employee & { company?: Company }>> => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), q: query, companyId });
      return fetch(`${BASE_URL}/employees?${params.toString()}`).then(handleResponse);
    },
    getById: (id: string): Promise<Employee & { company: Company | null }> =>
      fetch(`${BASE_URL}/employees/${id}`).then(handleResponse),
    create: (data: Partial<Employee>): Promise<Employee> =>
      fetch(`${BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Employee>): Promise<Employee> =>
      fetch(`${BASE_URL}/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ message: string }> =>
      fetch(`${BASE_URL}/employees/${id}`, { method: "DELETE" }).then(handleResponse),
  }
};
