import DOMPurify from 'dompurify';

export const sanitizeText = (input: string): string =>
  DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
