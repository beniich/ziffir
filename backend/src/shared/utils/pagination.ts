export function parsePagination(query: any) {
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 20;
  return { page, pageSize };
}

export function buildPaginatedResponse(items: any[], total: number, pagination: { page: number; pageSize: number }) {
  const { page, pageSize } = pagination;
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export function prismaSkipTake(pagination: { page: number; pageSize: number }) {
  return {
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  };
}
