-- Extend Bứt Phá assessment for saved AI-pending versions and teacher criterion-level confirmation.
alter table public.breakthrough_submissions
  add column if not exists teacher_criteria jsonb,
  add column if not exists assessment_error text,
  add column if not exists reviewed_at timestamptz;

alter table public.breakthrough_submissions
  drop constraint if exists breakthrough_submissions_status_check;

alter table public.breakthrough_submissions
  add constraint breakthrough_submissions_status_check
  check (status in ('awaiting_ai', 'assessed', 'manual_review', 'confirmed'));

alter table public.breakthrough_submissions
  add constraint breakthrough_submissions_teacher_criteria_array_check
  check (teacher_criteria is null or jsonb_typeof(teacher_criteria) = 'array');

create or replace function public.enforce_breakthrough_score_totals()
returns trigger
language plpgsql
as $$
declare
  calculated_total integer;
begin
  if new.total_score is not null then
    if jsonb_typeof(new.criteria) is distinct from 'array' then
      raise exception 'AI criteria must be a JSON array when total_score is set';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(new.criteria) as e(item)
      where case
        when coalesce(e.item->>'score', '') ~ '^[0-9]+$'
         and coalesce(e.item->>'max', '') ~ '^[0-9]+$'
        then (e.item->>'score')::integer < 0
          or (e.item->>'score')::integer > (e.item->>'max')::integer
        else true
      end
    ) then
      raise exception 'AI criterion score is outside its allowed range';
    end if;

    select coalesce(sum((e.item->>'score')::integer), 0)
      into calculated_total
      from jsonb_array_elements(new.criteria) as e(item);

    if calculated_total <> new.total_score or calculated_total > 100 then
      raise exception 'total_score must equal the sum of AI criterion scores and be between 0 and 100';
    end if;
  end if;

  if new.teacher_score is not null then
    if jsonb_typeof(new.teacher_criteria) is distinct from 'array' then
      raise exception 'teacher_criteria must be a JSON array when teacher_score is set';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(new.teacher_criteria) as e(item)
      where case
        when coalesce(e.item->>'score', '') ~ '^[0-9]+$'
         and coalesce(e.item->>'max', '') ~ '^[0-9]+$'
        then (e.item->>'score')::integer < 0
          or (e.item->>'score')::integer > (e.item->>'max')::integer
        else true
      end
    ) then
      raise exception 'Teacher criterion score is outside its allowed range';
    end if;

    select coalesce(sum((e.item->>'score')::integer), 0)
      into calculated_total
      from jsonb_array_elements(new.teacher_criteria) as e(item);

    if calculated_total <> new.teacher_score or calculated_total > 100 then
      raise exception 'teacher_score must equal the sum of teacher criterion scores and be between 0 and 100';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists breakthrough_score_totals_guard on public.breakthrough_submissions;
create trigger breakthrough_score_totals_guard
before insert or update of criteria, total_score, teacher_criteria, teacher_score
on public.breakthrough_submissions
for each row
execute function public.enforce_breakthrough_score_totals();

-- Only the Edge Function's service role may read or mutate these assessment records.
alter table public.breakthrough_rooms enable row level security;
alter table public.breakthrough_submissions enable row level security;
revoke all on public.breakthrough_rooms from anon, authenticated;
revoke all on public.breakthrough_submissions from anon, authenticated;
grant all on public.breakthrough_rooms to service_role;
grant all on public.breakthrough_submissions to service_role;
