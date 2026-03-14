alter table toasts add column if not exists featured boolean not null default false;
alter table toasts add column if not exists featured_category text check (featured_category in ('best', 'criminal', 'judges_pick'));
