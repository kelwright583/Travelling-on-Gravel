-- Add tags array to posts table
alter table posts add column if not exists tags text[] not null default '{}';
