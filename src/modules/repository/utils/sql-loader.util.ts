import { readFileSync } from 'fs';
import { join } from 'path';

import { Prisma } from '@prisma/client';

const cache = new Map<string, string>();

/**
 * Loads SQL from file and safely injects parameters using Prisma.sql
 *
 * SQL syntax:
 *   SELECT * FROM table WHERE user_id = {{userId}}
 */
export function loadSql(relPath: string, params?: Record<string, unknown>): Prisma.Sql {
  let template = cache.get(relPath);

  if (!template) {
    const absPath = join(process.cwd(), 'dist', 'src', 'queries', relPath);
    template = readFileSync(absPath, 'utf8');
    cache.set(relPath, template);
  }

  if (!params || Object.keys(params).length === 0) {
    return Prisma.raw(template);
  }

  const parts: Prisma.Sql[] = [];
  let lastIndex = 0;

  const re = /{{(\w+)}}/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(template))) {
    const [raw, key] = match;

    if (!(key in params)) {
      throw new Error(`Missing SQL param {{${key}}} in ${relPath}`);
    }

    parts.push(Prisma.raw(template.slice(lastIndex, match.index)));
    parts.push(Prisma.sql`${params[key]}`);

    lastIndex = match.index + raw.length;
  }

  parts.push(Prisma.raw(template.slice(lastIndex)));

  return Prisma.join(parts, '');
}
