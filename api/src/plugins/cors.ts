import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}

export default fp(corsPlugin, {
  name: 'cors-plugin', 
})