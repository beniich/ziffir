/**
 * Search across multiple text fields (case-insensitive contains).
 */
export function buildSearchFilter(fields: string[], query: string | undefined) {
  if (!query || query.trim().length < 2) return undefined;
  const term = query.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: term },
    })),
  };
}

/**
 * Build Prisma `where` filter from common query params.
 */
export function buildDateRangeFilter(
  from: string | undefined,
  to: string | undefined
): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };
}
