import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authKeycloak } from '@/middleware/auth';
import { AuthenticatedRequest, ProfileResponse } from '@/types/common';

export default async function profileRoutes(
  fastify: FastifyInstance, 
  options: FastifyPluginOptions
): Promise<void> {
  fastify.get<{
    Reply: ProfileResponse;
  }>('/profile', {
    preHandler: [authKeycloak],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest): Promise<ProfileResponse> => {
    return {
      id: request.user!.sub,
      username: request.user!.preferred_username,
      email: request.user!.email,
      name: request.user!.name,
    };
  });
}
