import { authKeycloak } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types/common';
import { CreatePageRequest } from '@/types/pages';
import { encryptSecret } from '@/utils/crypto';
import { FastifyPluginAsync } from 'fastify';

const pageRoutes: FastifyPluginAsync = async (fastify) => {

  // create a new page
  fastify.post<{
    Body: CreatePageRequest
  }>('/pages', {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'api', 'secret', 'report', 'config'],
        properties: {
          name: { type: 'string' },
          api: { type: 'string', format: 'uri' },
          secret: { type: 'string' },
          report: { type: 'string' },
          config: {
            type: 'object',
            required: ['groups'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'alias', 'list'],
                  properties: {
                    name: { type: 'string' },
                    alias: { type: 'string' },
                    list: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['name', 'status'],
                        properties: {
                          name: { type: 'string' },
                          status: { type: 'string' },
                          alias: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

        }
      }
    }
  }, async (request, reply) => {

    try {

      const { name, slug, api, secret, report, config } = request.body as CreatePageRequest;

      const { user } = request as AuthenticatedRequest;

      // Basic validation
      if (!name || !api || !user?.sub || !secret || !report || !config) {
        reply.code(400);
        return {
          success: false,
          error: 'Missing required fields'
        };
      }

      // Insert into PostgreSQL - use the default pg client
      const client = await (fastify as any).pg.connect();

      try {
        const result = await client.query(
          `INSERT INTO pages (name, slug, user_id, api, secret, report, config, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING *`,
          [name, slug, user?.sub, api, secret, report, JSON.stringify(config)]
        );

        reply.code(201);
        return {
          success: true,
          data: result.rows[0]
        };
      } finally {
        client.release();
      }

    } catch (error) {
      fastify.log.error(error);

      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          reply.code(400);
          return {
            success: false,
            error: 'Page with this name already exists for this user'
          };
        }
      }

      reply.code(500);
      return {
        success: false,
        error: 'Failed to create page'
      };
    }
  });

  fastify.put<{
    Body: CreatePageRequest,
    Params: { id: string }
  }>('/pages/:id', {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'api', 'secret', 'report', 'config'],
        properties: {
          name: { type: 'string' },
          api: { type: 'string', format: 'uri' },
          secret: { type: 'string' },
          report: { type: 'string' },
          config: {
            type: 'object',
            required: ['groups'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'alias', 'list'],
                  properties: {
                    name: { type: 'string' },
                    alias: { type: 'string' },
                    list: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['name', 'status'],
                        properties: {
                          name: { type: 'string' },
                          status: { type: 'string' },
                          alias: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

        }
      }
    }
  }, async (request, reply) => {

    try {

      const { name, slug, api, secret, report, config } = request.body as CreatePageRequest;
      const { id } = request.params as { id: string };
      const { user } = request as AuthenticatedRequest;

      // Basic validation
      if (!name || !api || !user?.sub || !secret || !report || !config) {
        reply.code(400);
        return {
          success: false,
          error: 'Missing required fields'
        };
      }


      const client = await (fastify as any).pg.connect();

      try {
        // First check if the page exists and belongs to the user
        const existingPage = await client.query(
          'SELECT id FROM pages WHERE id = $1 AND user_id = $2',
          [id, user?.sub]
        );

        if (existingPage.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: 'Page not found'
          };
        }

        // Update the page
        const result = await client.query(
          `UPDATE pages 
           SET name = $1, slug = $2, api = $3, secret = $4, report = $5, config = $6, updated_at = NOW()
           WHERE id = $7 AND user_id = $8
           RETURNING *`,
          [name, slug, api, secret, report, JSON.stringify(config), id, user?.sub]
        );

        return result.rows[0];
      } finally {
        client.release();
      }

    } catch (error) {
      fastify.log.error(error);

      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          reply.code(400);
          return {
            success: false,
            error: 'Page with this name already exists for this user'
          };
        }
      }

      reply.code(500);
      return {
        success: false,
        error: 'Failed to update page'
      };
    }
  });

  // GET all pages belonging to the user
  fastify.get('/pages', {
    preHandler: [authKeycloak],
  }, async (request, reply) => {

    try {

      const { user } = request as AuthenticatedRequest;
      const client = await (fastify as any).pg.connect();

      try {
        const result = await client.query(
          'SELECT id, name, slug, report, api, created_at, updated_at FROM pages WHERE user_id = $1 ORDER BY created_at DESC',
          [user?.sub]
        );

        return result.rows;
      } finally {
        client.release();
      }

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch pages'
      };
    }
  });

  fastify.get('/pages/:id', {
    preHandler: [authKeycloak],
  }, async (request, reply) => {

    try {

      const { user } = request as AuthenticatedRequest;
      const { id } = request.params as { id: string };
      const client = await (fastify as any).pg.connect();

      try {
        const result = await client.query(
          'SELECT * FROM pages WHERE id = $1 AND user_id = $2',
          [id, user?.sub]
        );

        if (result.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: 'Page not found'
          };
        }

        return result.rows[0];
      } finally {
        client.release();
      }

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch page'
      };
    }
  });

  fastify.get('/pages/check-slug/:slug', {
    preHandler: [authKeycloak],
  }, async (request, reply) => {

    try {

      const { slug } = request.params as { slug: string };
      const { user } = request as AuthenticatedRequest;
      const client = await (fastify as any).pg.connect();

      try {
        const result = await client.query(
          'SELECT id FROM pages WHERE slug = $1 AND user_id = $2',
          [slug, user?.sub]
        );

        return {

          slug: slug,
          available: result.rows.length === 0

        };
      } finally {
        client.release();
      }

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to check slug availability'
      };
    }
  });
};



export default pageRoutes;