export type GroupStatus = {
  name: string
  status: string
}

export  type DataSource = {
    api: string;
    secret: string;
  }

export  type StatusGroup = {
    name: string;
    list: GroupStatus[];

  }

export type ReqApi = {
  api: string
  secret: string
}

export type Report = {
  name: string
  description: string
}

export type ReqReport = {
  api: string
  secret: string
  report: string
}

