
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Newspaper,
  Users,
  HardHat,
  MessageSquareQuote,
  LogOut,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  UploadCloud,
  Search,
  Menu,
  X,
  RefreshCcw,
} from 'lucide-react';
import type { CmsRecord, CmsTable } from '@/lib/cms';

type Row = Record<string, unknown>;

type CmsModule = {
  id: CmsTable;
  name: string;
  singular: string;
  icon: typeof Building2;
  fields: {
    key: string;
    label: string;
    type?: string;
  }[];
};

const modules: CmsModule[] = [
  {
    id: 'projects',
    name: 'Projects',
    singular: 'Project',
    icon: Building2,
    fields: [
      { key: 'title', label: 'Project title' },
      { key: 'slug', label: 'URL slug' },
      { key: 'category', label: 'Category' },
      { key: 'location', label: 'Location' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'body', label: 'Case study', type: 'textarea' },
      { key: 'completed_at', label: 'Completion date', type: 'date' },
      { key: 'image_url', label: 'Cover image URL', type: 'image' },
      { key: 'gallery', label: 'Gallery image URLs (one per line)', type: 'gallery' },
      { key: 'featured', label: 'Feature on homepage', type: 'checkbox' },
    ],
  },
  {
    id: 'posts',
    name: 'Blog / Insights',
    singular: 'Blog post',
    icon: Newspaper,
    fields: [
      { key: 'title', label: 'Article title' },
      { key: 'slug', label: 'URL slug' },
      { key: 'category', label: 'Category' },
      { key: 'summary', label: 'Excerpt', type: 'textarea' },
      { key: 'body', label: 'Article content (plain text)', type: 'textarea' },
      { key: 'image_url', label: 'Cover image URL', type: 'image' },
      { key: 'featured', label: 'Feature article', type: 'checkbox' },
    ],
  },
  {
    id: 'team_members',
    name: 'Team',
    singular: 'Team member',
    icon: Users,
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'slug', label: 'URL slug' },
      { key: 'role', label: 'Job title' },
      { key: 'bio', label: 'Biography', type: 'textarea' },
      { key: 'email', label: 'Public email (optional)' },
      { key: 'image_url', label: 'Portrait URL', type: 'image' },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    singular: 'Service',
    icon: HardHat,
    fields: [
      { key: 'title', label: 'Service name' },
      { key: 'slug', label: 'URL slug' },
      { key: 'summary', label: 'Short description', type: 'textarea' },
      { key: 'body', label: 'Detailed description', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'image' },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    singular: 'Testimonial',
    icon: MessageSquareQuote,
    fields: [
      { key: 'name', label: 'Client name' },
      { key: 'role', label: 'Client position/company' },
      { key: 'quote', label: 'Testimonial', type: 'textarea' },
      { key: 'image_url', label: 'Portrait URL', type: 'image' },
    ],
  },
];

const blank = (table: CmsTable): Row => ({
  status: 'draft',
  featured: false,
  sort_order: 0,
  ...(table === 'team_members' ? { name: '' } : { title: '' }),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function api(
  path: string,
  init?: RequestInit,
  retry = true
): Promise<any> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (response.status === 401 && retry) {
    const refresh = await fetch('/api/admin/refresh', {
      method: 'POST',
    });

    if (refresh.ok) {
      return api(path, init, false);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export default function AdminApp() {
  const [session, setSession] = useState<{
    authenticated: boolean;
    email?: string;
    role?: string;
  } | null>(null);

  const [login, setLogin] = useState({
    email: '',
    password: '',
  });

  const [section, setSection] = useState<CmsTable | 'overview'>('overview');
  const [records, setRecords] = useState<Record<string, CmsRecord[]>>({});
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [mobile, setMobile] = useState(false);

  const check = useCallback(async () => {
    try {
      setSession(await api('/api/admin/session'));
    } catch {
      setSession({ authenticated: false });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const load = useCallback(async (table: CmsTable) => {
    try {
      const rows = await api(`/api/admin/content/${table}`);
      setRecords((previous) => ({
        ...previous,
        [table]: rows,
      }));
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    if (session?.authenticated) {
      for (const module of modules) {
        void load(module.id);
      }
    }
  }, [session?.authenticated, load]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice('');

    try {
      await api('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });

      setLogin({ email: '', password: '' });
      await check();
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();

    if (!editing || section === 'overview') return;

    setBusy(true);
    setNotice('');

    try {
      const payload: Row = { ...editing };

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.published_at;

      if (typeof payload.gallery === 'string') {
        payload.gallery = payload.gallery
          .split('\n')
          .map((value: string) => value.trim())
          .filter(Boolean);
      }

      const nameOrTitle = payload.title || payload.name;

      if (!payload.slug && typeof nameOrTitle === 'string') {
        payload.slug = slugify(nameOrTitle);
      }

      const hasSlug = modules
        .find((module) => module.id === section)
        ?.fields.some((field) => field.key === 'slug');

      if (!hasSlug) {
        delete payload.slug;
      }

      const id = editing.id as string | undefined;

      await api(`/api/admin/content/${section}${id ? '/' + id : ''}`, {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await load(section);
      setEditing(null);

      setNotice(
        'Saved successfully. Published content appears on the website shortly.'
      );
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (section === 'overview') return;

    if (!confirm('Permanently delete this record? This cannot be undone.')) {
      return;
    }

    try {
      await api(`/api/admin/content/${section}/${id}`, {
        method: 'DELETE',
      });

      await load(section);
      setEditing(null);
      setNotice('Record deleted.');
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  async function upload(file: File) {
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await api('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      setEditing((previous) =>
        previous ? { ...previous, image_url: result.url } : previous
      );

      setNotice(
        'Image uploaded successfully. Save the record to apply it.'
      );
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (session === null) {
    return <div className="ma-center">Loading Content Studio…</div>;
  }

  if (!session.authenticated) {
    return (
      <div className="ma-login-wrap">
        <form className="ma-login" onSubmit={signIn}>
          <div className="ma-brand">
            <span className="ma-mark">▂▅▇</span>
            <span>
              MONUMENT
              <small>CONSTRUCTION / CONTENT STUDIO</small>
            </span>
          </div>

          <p className="ma-eyebrow">AUTHORIZED ACCESS</p>
          <h1>Welcome back.</h1>
          <p>
            Sign in to manage projects, articles and your company website.
          </p>

          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="username"
              value={login.email}
              onChange={(event) =>
                setLogin((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={login.password}
              onChange={(event) =>
                setLogin((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
            />
          </label>

          <button disabled={busy} className="ma-primary">
            {busy ? 'Signing in…' : 'Sign in to dashboard →'}
          </button>

          {notice && (
            <p className="ma-error" role="alert">
              {notice}
            </p>
          )}

          <a href="/">← Back to website</a>
        </form>
      </div>
    );
  }

  const currentModule = modules.find((module) => module.id === section);

  const rows = section === 'overview' ? [] : records[section] || [];

  const filtered = rows.filter((record) =>
    JSON.stringify(record).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ma-shell">
      <aside className={'ma-sidebar ' + (mobile ? 'ma-mobile-open' : '')}>
        <div className="ma-brand">
          <span className="ma-mark">▂▅▇</span>
          <span>
            MONUMENT
            <small>CONTENT STUDIO</small>
          </span>
        </div>

        <nav aria-label="Dashboard navigation">
          <button
            className={section === 'overview' ? 'active' : ''}
            onClick={() => {
              setSection('overview');
              setEditing(null);
              setMobile(false);
            }}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          {modules.map((module) => (
            <button
              key={module.id}
              className={section === module.id ? 'active' : ''}
              onClick={() => {
                setSection(module.id);
                setEditing(null);
                setQuery('');
                setMobile(false);
              }}
            >
              <module.icon size={18} />
              {module.name}
              <span className="ma-count">
                {records[module.id]?.length ?? '–'}
              </span>
            </button>
          ))}
        </nav>

        <div className="ma-side-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
            View website
          </a>

          <button
            onClick={async () => {
              try {
                await api('/api/admin/session', {
                  method: 'DELETE',
                });
                setSession({ authenticated: false });
              } catch (error) {
                setNotice(errorMessage(error));
              }
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobile && (
        <button
          className="ma-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}

      <div className="ma-main">
        <header className="ma-topbar">
          <button
            className="ma-menu"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle navigation"
          >
            {mobile ? <X /> : <Menu />}
          </button>

          <span className="ma-top-label">
            MONUMENT / CONTENT MANAGEMENT
          </span>

          <div className="ma-user">
            <span className="ma-avatar">
              {session.email?.slice(0, 1).toUpperCase()}
            </span>
            <span>
              {session.email}
              <small>{session.role}</small>
            </span>
          </div>
        </header>

        <main className="ma-content">
          {notice && (
            <div role="status" className="ma-notice">
              {notice}
              <button
                onClick={() => setNotice('')}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {section === 'overview' ? (
            <>
              <p className="ma-eyebrow">OVERVIEW</p>
              <h1>Welcome back, Admin.</h1>
              <p className="ma-sub">
                Manage your website content, keep it updated and showcase
                your work.
              </p>

              <div className="ma-stats">
                {modules.slice(0, 4).map((module) => (
                  <button
                    key={module.id}
                    className="ma-stat"
                    onClick={() => setSection(module.id)}
                  >
                    <span className="ma-stat-icon">
                      <module.icon />
                    </span>
                    <strong>
                      {records[module.id]?.length ?? '–'}
                    </strong>
                    <small>{module.name}</small>
                    <span className="ma-stat-link">↗</span>
                  </button>
                ))}
              </div>

              <div className="ma-panels">
                {modules.slice(0, 3).map((module) => (
                  <section className="ma-panel" key={module.id}>
                    <div className="ma-panel-head">
                      <h2>Recent {module.name}</h2>
                      <button onClick={() => setSection(module.id)}>
                        View all →
                      </button>
                    </div>

                    {(records[module.id] || [])
                      .slice(0, 4)
                      .map((record) => (
                        <div className="ma-recent" key={record.id}>
                          <span>
                            {String(
                              record.title || record.name || 'Untitled'
                            )}
                          </span>

                          <small
                            className={
                              'ma-pill ' + String(record.status ?? '')
                            }
                          >
                            {String(record.status ?? '')}
                          </small>
                        </div>
                      ))}

                    {!records[module.id]?.length && (
                      <p className="ma-empty">
                        No records yet. Add your first{' '}
                        {module.singular.toLowerCase()}.
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="ma-section-head">
                <div>
                  <p className="ma-eyebrow">
                    CONTENT / {currentModule?.name.toUpperCase()}
                  </p>
                  <h1>{currentModule?.name}</h1>
                  <p className="ma-sub">
                    Create, edit, publish and manage{' '}
                    {currentModule?.name.toLowerCase()}.
                  </p>
                </div>

                <button
                  className="ma-primary"
                  onClick={() => setEditing(blank(section))}
                >
                  <Plus size={17} />
                  Add {currentModule?.singular}
                </button>
              </div>

              <div className="ma-list-tools">
                <label>
                  <Search size={17} />
                  <input
                    placeholder="Search content…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>

                <button onClick={() => void load(section)}>
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>

              <div className="ma-list">
                {filtered.map((record) => (
                  <button
                    className="ma-record"
                    key={record.id}
                    onClick={() =>
                      setEditing({
                        ...record,
                        gallery: Array.isArray(record.gallery)
                          ? record.gallery.join('\n')
                          : record.gallery,
                      })
                    }
                  >
                    <span className="ma-record-image">
                      {record.image_url ? (
                        <img
                          src={String(record.image_url)}
                          alt=""
                        />
                      ) : (
                        <Building2 size={22} />
                      )}
                    </span>

                    <span className="ma-record-copy">
                      <strong>
                        {String(
                          record.title || record.name || 'Untitled'
                        )}
                      </strong>
                      <small>
                        {String(
                          record.category ||
                            record.role ||
                            record.slug ||
                            'Content item'
                        )}
                      </small>
                    </span>

                    <span
                      className={
                        'ma-pill ' + String(record.status ?? '')
                      }
                    >
                      {String(record.status ?? '')}
                    </span>

                    <span className="ma-record-arrow">↗</span>
                  </button>
                ))}

                {!filtered.length && (
                  <div className="ma-empty ma-list-empty">
                    {query
                      ? 'No matching records.'
                      : 'No content yet. Click Add to create your first record.'}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {editing && currentModule && (
        <div
          className="ma-drawer-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <section
            className="ma-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={'Edit ' + currentModule.singular}
          >
            <div className="ma-drawer-head">
              <div>
                <p className="ma-eyebrow">CONTENT EDITOR</p>
                <h2>
                  {editing.id ? 'Edit' : 'Create'}{' '}
                  {currentModule.singular}
                </h2>
              </div>

              <button
                onClick={() => setEditing(null)}
                aria-label="Close editor"
              >
                <X />
              </button>
            </div>

            <form onSubmit={save} className="ma-form">
              <label>
                Publication status
                <select
                  value={String(editing.status || 'draft')}
                  onChange={(event) =>
                    setEditing((previous) =>
                      previous
                        ? {
                            ...previous,
                            status: event.target.value,
                          }
                        : previous
                    )
                  }
                >
                  <option value="draft">
                    Draft — hidden from public
                  </option>
                  <option value="published">
                    Published — visible
                  </option>
                  <option value="archived">
                    Archived — hidden
                  </option>
                </select>
              </label>

              {currentModule.fields.map((field) => (
                <label key={field.key}>
                  {field.type === 'checkbox' ? (
                    <span className="ma-check">
                      <input
                        type="checkbox"
                        checked={Boolean(editing[field.key])}
                        onChange={(event) =>
                          setEditing((previous) =>
                            previous
                              ? {
                                  ...previous,
                                  [field.key]: event.target.checked,
                                }
                              : previous
                          )
                        }
                      />
                      {field.label}
                    </span>
                  ) : (
                    <>
                      {field.label}

                      {field.type === 'textarea' ||
                      field.type === 'gallery' ? (
                        <textarea
                          rows={field.key === 'body' ? 9 : 3}
                          value={String(editing[field.key] ?? '')}
                          onChange={(event) =>
                            setEditing((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    [field.key]: event.target.value,
                                  }
                                : previous
                            )
                          }
                        />
                      ) : (
                        <input
                          type={
                            field.type === 'date' ? 'date' : 'text'
                          }
                          value={String(editing[field.key] ?? '')}
                          onChange={(event) =>
                            setEditing((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    [field.key]: event.target.value,
                                  }
                                : previous
                            )
                          }
                        />
                      )}
                    </>
                  )}

                  {field.type === 'image' && (
                    <>
                      <span className="ma-upload">
                        <UploadCloud size={16} />
                        Upload image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void upload(file);
                          }}
                        />
                      </span>

                      {Boolean(editing.image_url) && (
                        <img
                          className="ma-preview"
                          src={String(editing.image_url)}
                          alt="Image preview"
                        />
                      )}
                    </>
                  )}
                </label>
              ))}

              <div className="ma-form-actions">
                <button
                  type="submit"
                  className="ma-primary"
                  disabled={busy}
                >
                  <Save size={16} />
                  {busy ? 'Saving…' : 'Save changes'}
                </button>

                {Boolean(editing.id) && (
                  <button
                    type="button"
                    className="ma-danger"
                    onClick={() =>
                      void remove(String(editing.id))
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
