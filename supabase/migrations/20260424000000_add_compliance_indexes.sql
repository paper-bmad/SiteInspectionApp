-- Performance indexes for compliance_queries and compliance_reports.
-- getHistory() queries compliance_reports filtered by user_id + optionally
-- project_id, ordered by generated_at DESC — without these, each query
-- does a sequential scan under RLS.

create index if not exists compliance_queries_user_id_idx
  on compliance_queries (user_id);

create index if not exists compliance_queries_project_id_idx
  on compliance_queries (project_id)
  where project_id is not null;

create index if not exists compliance_reports_user_id_generated_at_idx
  on compliance_reports (user_id, generated_at desc);

create index if not exists compliance_reports_project_id_idx
  on compliance_reports (project_id)
  where project_id is not null;

create index if not exists compliance_reports_query_id_idx
  on compliance_reports (query_id);
