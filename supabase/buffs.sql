-- OP Retreat — Buffs / Debuffs table
-- Ejecuta este archivo una vez en Supabase → SQL Editor.
--
-- La escritura desde /control-panel usa la sesión autenticada del administrador.
-- La política de escritura comprueba app_metadata.role = "admin", que es el
-- mismo rol que usa el proxy del panel. La lectura es pública.

create table if not exists public.buffs (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'debuff'
    check (kind in ('buff', 'debuff')),
  title_es text not null
    check (length(btrim(title_es)) > 0),
  title_en text not null
    check (length(btrim(title_en)) > 0),
  description_es text not null
    check (length(btrim(description_es)) > 0),
  description_en text not null
    check (length(btrim(description_en)) > 0),
  icon text not null default '/assets/images/buff/CommonAffixIcon_BadPerk2.png',
  duration text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buffs_sort_order_idx
  on public.buffs (sort_order, created_at);

alter table public.buffs enable row level security;

drop policy if exists "Buffs are publicly readable" on public.buffs;
create policy "Buffs are publicly readable"
  on public.buffs
  for select
  using (true);

drop policy if exists "Admins can manage buffs" on public.buffs;
create policy "Admins can manage buffs"
  on public.buffs
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.buffs to anon, authenticated;
grant insert, update, delete on public.buffs to authenticated;

-- Seed inicial: los cuatro buffs que ya estaban en src/data/buffs.json.
-- Solo inserta si la tabla está vacía.
with seed(
  kind,
  title_es,
  title_en,
  description_es,
  description_en,
  duration,
  sort_order
) as (
  values
    (
      'debuff',
      'Visión borrosa',
      'Blurred Vision',
      'Los enemigos a veces son invisibles (excepto élites y jefes).',
      'Enemies are sometimes invisible (except elites and bosses).',
      '29s',
      1
    ),
    (
      'debuff',
      'Maldición de vulnerabilidad',
      'Vulnerability Curse',
      'Daño recibido +5 %.',
      'Damage taken +5%.',
      null,
      2
    ),
    (
      'debuff',
      'Prueba de corrosión (nv. 6)',
      'Corrosion Trial (Lv. 6)',
      'Velocidad de movimiento de monstruo +60 %.',
      'Monster movement speed +60%.',
      null,
      3
    ),
    (
      'debuff',
      'Prueba de corrosión (nv. 6)',
      'Corrosion Trial (Lv. 6)',
      'El tamaño del proyectil enemigo aumenta x1.6.',
      'Enemy projectile size increases by 1.6x.',
      null,
      4
    )
)
insert into public.buffs (
  kind,
  title_es,
  title_en,
  description_es,
  description_en,
  icon,
  duration,
  sort_order
)
select
  seed.kind,
  seed.title_es,
  seed.title_en,
  seed.description_es,
  seed.description_en,
  '/assets/images/buff/CommonAffixIcon_BadPerk2.png',
  seed.duration,
  seed.sort_order
from seed
where not exists (select 1 from public.buffs);
