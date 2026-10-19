-- Apply AFTER 001_monument_cms.sql. Optional indexes for frequently filtered CMS views.
create index if not exists projects_featured_published_idx on public.projects(featured,sort_order) where status='published';
create index if not exists posts_published_date_idx on public.posts(published_at desc) where status='published';
create index if not exists team_published_order_idx on public.team_members(sort_order) where status='published';
create index if not exists services_published_order_idx on public.services(sort_order) where status='published';
