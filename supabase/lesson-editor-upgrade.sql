alter table public.lessons
  add column if not exists h5p_blocks jsonb not null default '[]';

insert into storage.buckets (id, name, public)
values ('lesson-media', 'lesson-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Teachers upload lesson media" on storage.objects;
create policy "Teachers upload lesson media"
on storage.objects for insert
with check (
  bucket_id = 'lesson-media'
  and public.is_teacher()
);

drop policy if exists "Teachers update lesson media" on storage.objects;
create policy "Teachers update lesson media"
on storage.objects for update
using (
  bucket_id = 'lesson-media'
  and public.is_teacher()
)
with check (
  bucket_id = 'lesson-media'
  and public.is_teacher()
);

drop policy if exists "Lesson media is public" on storage.objects;
create policy "Lesson media is public"
on storage.objects for select
using (bucket_id = 'lesson-media');
