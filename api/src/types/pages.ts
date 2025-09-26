export interface ServiceStatus {
  name: string;
  status: string;
  alias?: string;
}

export interface Group {
  name: string;
  alias: string;
  list: ServiceStatus[];
}

export interface Config {
  title?: string;
  description?: string;
  groups: Group[];
}

export interface PageData {
  name: string;
  slug: string;
  api: string;
  secret: string;
  report: string;
  config: string;
}

export interface CreatePageRequest extends PageData {
  user_id: string;
}

export interface PageRecord {
  id: number;
  name: string;
  user_id: string;
  api: string;
  secret: string;
  report: string;
  config: Config;
  created_at: Date;
  updated_at: Date;
}