// lib/pagination.ts
export function paginate<T>(items: T[], pageStr: string | null, limitStr: string | null) {
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const limit = Math.max(1, parseInt(limitStr || "10", 10));
  
  const total = items.length;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  const paginatedItems = items.slice(offset, offset + limit);
  
  return { items: paginatedItems, total, page, pages };
}
