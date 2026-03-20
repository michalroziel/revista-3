// src/utils/withBasePath.ts
export function withBasePath(path: string): string {
  const rawBase = import.meta.env.BASE_URL ?? '/';
  const baseClean = rawBase.replace(/^\/+|\/+$/g, '');
  const pathClean = String(path || '').replace(/^\/+|\/+$/g, '');

  if (!pathClean) {
    return baseClean ? `/${baseClean}` : '/';
  }

  return baseClean ? `/${baseClean}/${pathClean}` : `/${pathClean}`;
}
