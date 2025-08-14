import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    sub: string;
    preferred_username: string;
    email: string;
    name?: string;
  };
}

export interface RemResReports {
  data: {
    info: {
      name: string;
      description: string;
    };
  }[];
}

export interface ResError {
  code: number;
  message: string;
}

export interface ReqReports {
  api: string;
  secret: string;
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


