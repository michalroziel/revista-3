// src/utils/withBasePath.ts
export function withBasePath(path: string): string {
  const rawBase = import.meta.env.BASE_URL ?? '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const clean = path.replace(/^\/+/, ''); // remove leading "/" from path
  return `${base}${clean}`;               // guarantees exactly one slash between
}
