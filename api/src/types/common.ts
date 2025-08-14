import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    sub: string;
    preferred_username: string;
    email: string;
    name?: string;
  };
}

export interface RemResGroups {
  groups: {
    name: string;
    type: string;
    statuses: {
      timestamp: string;
      value: string;
    }[];
  }[];
}


export interface RemResReports {
  data: {
    info: {
      name: string;
      description: string;
    };
  }[];
}

export interface ResGroupStatus {
  name: string;
  status: string;
}

export interface ResError {
  code: number;
  message: string;
}

export interface ReqSimple {
  api: string;
  secret: string;
}

export interface ReqReport {
  api: string;
  secret: string;
  report: string;
}

export interface ResReport {
  name: string;
  description: string
}

export interface EchoResponse {
  api: string;
  secret: string;
}

export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  name?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}


