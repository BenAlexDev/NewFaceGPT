create or replace function  matched_sections(
  embedding vector(1536),
  match_threshold float,
  match_count int,
  files_brand_id varchar,
  trained_type varchar
)

returns table (
    content text,
    url varchar,
    created_at timestamp
)

language sql stable
as $$
  select
    files.content,
    files.url,
    files.created_at
  from files
  where (1 - (files.embedded <=> embedding) > match_threshold) and (files.tokens < 300) and (files.type=trained_type) 
    and (files.brandid=files_brand_id)
  order by 1 - (files.embedded <=> embedding) desc
  limit match_count;
$$;

-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

create or replace function fb_matched_sections (
  embedding vector (1536),
  match_threshold float,
  match_count int,
  trained_type varchar,
  brandid varchar
) returns table (
  page_id varchar,
  post_caption json,
  comment_id varchar,
  comment_date varchar,
  name varchar,
  is_hidden varchar,
  is_like varchar,
  sub_comments json,
  comment text
) language sql stable as $$
  select
    fb_files.page_id,
    fb_files.post_caption,
    fb_files.comment_id,
    fb_files.comment_date,
    fb_files.name,
    fb_files.is_hidden,
    fb_files.is_like,
    fb_files.sub_comments,
    fb_files.comment
  from fb_files
  where ((1 - (fb_files.comment_embedded <=> embedding) > match_threshold) or (1 - (fb_files.sub_embedded <=> embedding) > match_threshold)) and
    (fb_files.tokens < 300) and (fb_files.brand_id=brandid) 
  order by 1 - (fb_files.comment_embedded <=> embedding) desc
  limit match_count;
$$;
