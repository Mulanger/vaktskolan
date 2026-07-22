-- Server-owned membership, Stripe purchase, and Basic quota state.
-- The browser never receives the Supabase service role key and has no direct table policies.

create table if not exists public.billing_customers (
  user_id text not null,
  livemode boolean not null default false,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, livemode)
);

create table if not exists public.membership_entitlements (
  user_id text not null,
  livemode boolean not null default false,
  tier text not null default 'basic' check (tier in ('basic', 'premium')),
  source text not null default 'basic' check (source in ('basic', 'stripe', 'manual')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, livemode)
);

create table if not exists public.billing_purchases (
  stripe_checkout_session_id text primary key,
  stripe_payment_intent_id text unique,
  user_id text not null,
  stripe_customer_id text not null,
  stripe_product_id text,
  stripe_price_id text,
  amount_total integer check (amount_total is null or amount_total >= 0),
  currency text,
  payment_status text not null check (payment_status in ('pending', 'paid', 'failed', 'expired', 'refunded', 'disputed')),
  livemode boolean not null default false,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_purchases_user_mode_idx
  on public.billing_purchases (user_id, livemode, updated_at desc);
create index if not exists billing_purchases_customer_idx
  on public.billing_purchases (stripe_customer_id);

create table if not exists public.membership_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  livemode boolean not null default false,
  usage_kind text not null check (usage_kind in ('vu1_question', 'scenario_question', 'flashcard_flip')),
  event_key text not null check (char_length(event_key) between 1 and 200),
  created_at timestamptz not null default now(),
  unique (user_id, livemode, usage_kind, event_key)
);

create index if not exists membership_usage_user_kind_idx
  on public.membership_usage_events (user_id, livemode, usage_kind);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create or replace function public.set_billing_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row execute function public.set_billing_updated_at();

drop trigger if exists membership_entitlements_set_updated_at on public.membership_entitlements;
create trigger membership_entitlements_set_updated_at
  before update on public.membership_entitlements
  for each row execute function public.set_billing_updated_at();

drop trigger if exists billing_purchases_set_updated_at on public.billing_purchases;
create trigger billing_purchases_set_updated_at
  before update on public.billing_purchases
  for each row execute function public.set_billing_updated_at();

-- Atomically checks and consumes a Basic lifetime allowance. Premium is unlimited.
-- Event keys make retries idempotent, while the entitlement row lock serializes concurrent tabs.
create or replace function public.consume_membership_usage(
  p_user_id text,
  p_livemode boolean,
  p_usage_kind text,
  p_event_key text
)
returns table (
  allowed boolean,
  tier text,
  used integer,
  "limit" integer,
  remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_used integer;
  v_limit integer := 10;
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'A Clerk user id is required.';
  end if;
  if p_usage_kind is null or p_usage_kind not in ('vu1_question', 'scenario_question', 'flashcard_flip') then
    raise exception 'Unsupported membership usage kind.';
  end if;
  if p_event_key is null or char_length(p_event_key) not between 1 and 200 then
    raise exception 'A valid event key is required.';
  end if;

  insert into public.membership_entitlements (user_id, livemode, tier, source)
  values (p_user_id, p_livemode, 'basic', 'basic')
  on conflict (user_id, livemode) do nothing;

  select membership_entitlements.tier
    into v_tier
    from public.membership_entitlements
   where user_id = p_user_id and livemode = p_livemode
   for update;

  if v_tier = 'premium' then
    return query select true, v_tier, 0, null::integer, null::integer;
    return;
  end if;

  select count(*)::integer
    into v_used
    from public.membership_usage_events
   where user_id = p_user_id
     and livemode = p_livemode
     and usage_kind = p_usage_kind;

  if exists (
    select 1 from public.membership_usage_events
     where user_id = p_user_id
       and livemode = p_livemode
       and usage_kind = p_usage_kind
       and event_key = p_event_key
  ) then
    return query select true, v_tier, v_used, v_limit, greatest(0, v_limit - v_used);
    return;
  end if;

  if v_used >= v_limit then
    return query select false, v_tier, v_used, v_limit, 0;
    return;
  end if;

  insert into public.membership_usage_events (user_id, livemode, usage_kind, event_key)
  values (p_user_id, p_livemode, p_usage_kind, p_event_key);
  v_used := v_used + 1;
  return query select true, v_tier, v_used, v_limit, greatest(0, v_limit - v_used);
end;
$$;

alter table public.billing_customers enable row level security;
alter table public.membership_entitlements enable row level security;
alter table public.billing_purchases enable row level security;
alter table public.membership_usage_events enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on public.billing_customers from anon, authenticated;
revoke all on public.membership_entitlements from anon, authenticated;
revoke all on public.billing_purchases from anon, authenticated;
revoke all on public.membership_usage_events from anon, authenticated;
revoke all on public.stripe_webhook_events from anon, authenticated;
revoke all on function public.consume_membership_usage(text, boolean, text, text) from public, anon, authenticated;

grant all on public.billing_customers to service_role;
grant all on public.membership_entitlements to service_role;
grant all on public.billing_purchases to service_role;
grant all on public.membership_usage_events to service_role;
grant all on public.stripe_webhook_events to service_role;
grant execute on function public.consume_membership_usage(text, boolean, text, text) to service_role;

comment on table public.membership_entitlements is 'Authoritative Basic/Premium entitlement per Clerk user and Stripe mode.';
comment on table public.billing_purchases is 'Webhook-synchronized one-time Stripe purchases for permanent Premium.';
comment on table public.membership_usage_events is 'Lifetime Basic usage events, deduplicated by a client-generated action key.';
comment on function public.consume_membership_usage is 'Atomically enforces Basic lifetime quotas and returns the updated allowance.';
