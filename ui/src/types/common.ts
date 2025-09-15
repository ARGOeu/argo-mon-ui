

export type DataSource = {
  api: string;
  secret: string;
}

export type DataSourceReport = DataSource & {
  report: string;
}

export type StatusGroupType = {
  name: string;
  alias?: string;
  list: StatusItemType[];
}

export type StatusItemType = {
  name: string;
  alias?: string;
  status: string;
}


export type ItemDesc = {
  name: string
  description: string
}


export type Pages = {
  id: number;
  name: string;
  slug: string;
  report: string;
  api: string;
  

}