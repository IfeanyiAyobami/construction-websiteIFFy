
export const TABLES = [
  'projects',
  'posts',
  'team_members',
  'services',
  'testimonials',
] as const;

export type CmsTable = (typeof TABLES)[number];

export const isTable = (value: string): value is CmsTable => {
  return TABLES.includes(value as CmsTable);
};

export const columns: Record<CmsTable, string[]> = {
  projects: [
    'title',
    'slug',
    'summary',
    'body',
    'category',
    'location',
    'image_url',
    'gallery',
    'completed_at',
    'featured',
    'status',
    'sort_order',
  ],

  posts: [
    'title',
    'slug',
    'summary',
    'body',
    'category',
    'image_url',
    'featured',
    'status',
    'published_at',
  ],

  team_members: [
    'name',
    'slug',
    'role',
    'bio',
    'image_url',
    'email',
    'sort_order',
    'status',
  ],

  services: [
    'title',
    'slug',
    'summary',
    'body',
    'image_url',
    'sort_order',
    'status',
  ],

  testimonials: [
    'name',
    'role',
    'quote',
    'image_url',
    'sort_order',
    'status',
  ],
};

export type CmsRecord = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

/**
 * Read and validate the Supabase configuration.
 */
export function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.trim()
    .replace(/\/$/, '');

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error('CMS environment is not configured');
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error('Invalid Supabase project URL');
  }

  return { url, key };
}

/**
 * Make requests to the Supabase REST API.
 *
 * Authenticated requests use the supplied user's
 * access token. Public requests use the anon key.
 *
 * Database RLS policies remain responsible for
 * enforcing content permissions.
 */
export async function sb(
  path: string,
  token?: string,
  init: RequestInit = {}
): Promise<Response> {
  const { url, key } = config();

  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('Invalid Supabase API path');
  }

  const headers = new Headers(init.headers);

  headers.set('apikey', key);
  headers.set('Authorization', `Bearer ${token || key}`);

  return fetch(`${url}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

/**
 * Validate and sanitize incoming CMS content.
 *
 * Only fields explicitly listed for the selected
 * content table are accepted.
 */
export function cleanRecord(
  table: CmsTable,
  body: unknown
): Record<string, unknown> {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    throw new Error('Invalid payload');
  }

  const data = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const field of columns[table]) {
    if (!(field in data)) {
      continue;
    }

    const value = data[field];

    // Project image galleries
    if (field === 'gallery') {
      if (
        !Array.isArray(value) ||
        value.length > 30 ||
        value.some(
          (item) =>
            typeof item !== 'string' ||
            item.length > 2048 ||
            !/^https:\/\//i.test(item)
        )
      ) {
        throw new Error('Invalid gallery');
      }

      out[field] = value;
      continue;
    }

    // Boolean fields
    if (field === 'featured') {
      if (typeof value !== 'boolean') {
        throw new Error(`Invalid ${field}`);
      }

      out[field] = value;
      continue;
    }

    // Numeric ordering
    if (field === 'sort_order') {
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value)
      ) {
        throw new Error('Invalid order');
      }

      out[field] = value;
      continue;
    }

    // All remaining fields accept strings or null
    if (value !== null && typeof value !== 'string') {
      throw new Error(`Invalid ${field}`);
    }

    if (typeof value === 'string') {
      const maxLength = field === 'body' ? 25000 : 2048;

      if (value.length > maxLength) {
        throw new Error(`Too long: ${field}`);
      }

      // Validate image URLs
      if (
        field === 'image_url' &&
        value !== '' &&
        !/^https:\/\//i.test(value)
      ) {
        throw new Error('Invalid image URL');
      }
    }

    out[field] = value;
  }

  // Validate publishing status
  if (
    'status' in out &&
    !['draft', 'published', 'archived'].includes(
      String(out.status)
    )
  ) {
    throw new Error('Invalid status');
  }

  // Validate URL-friendly slugs
  if (
    'slug' in out &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      String(out.slug)
    )
  ) {
    throw new Error('Invalid slug');
  }

  return out;
}
