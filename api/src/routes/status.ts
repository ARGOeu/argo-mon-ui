
import { fetchGroups } from '@/service/groups';
import { PageData, PageRecord } from '@/types/pages';
import { decryptSecret, encryptSecret } from '@/utils/crypto';
import { FastifyPluginAsync } from 'fastify';

const statusRoutes: FastifyPluginAsync = async (fastify) => {



  fastify.get('/status/:slug', {
  }, async (request, reply) => {

    try {

      const { slug } = request.params as { slug: string };
      const client = await (fastify as any).pg.connect();

      let page: PageData;

      try {
        const result = await client.query(
          'SELECT * FROM pages WHERE slug = $1',
          [slug]
        );

        if (result.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: 'Page not found'
          };
        }

        page = result.rows[0] as PageData;

      } finally {
        client.release();
      }

      // get the results 
      const groups = await fetchGroups(page.api, decryptSecret(page.secret), page.report);

      // create a dictionary of the results
      const statusMap = groups.reduce((acc, group) => {
        acc[group.name] = group.status;
        return acc
      }, {} as Record<string, string>)

      // update page with statuses from groups and return it
      return {
        ...page,
        api:"",
        secret:"",
        groups: page.groups.map(g => ({
          ...g, list:g.list.map(item=>({...item,status:statusMap[item.name]}))}))
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
};



export default statusRoutes;