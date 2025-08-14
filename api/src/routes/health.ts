import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { HealthResponse } from '@/types/common';
import { authKeycloak } from '@/middleware/auth';

export default async function healthRoutes(
  fastify: FastifyInstance, 
  options: FastifyPluginOptions
): Promise<void> {
  fastify.get<{
    Reply: HealthResponse;
  }>('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            service: { type: 'string' }
          }
        }
      }
    }
  }, async (): Promise<HealthResponse> => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'status-page-api'
    };
  });
}