import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../types/common';
import { OIDC_ISSUER } from '../utils/env';

export const authKeycloak = async (
  request: AuthenticatedRequest, 
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      reply.status(401).send({ error: 'No token provided' });
      return;
    }

    // Verify token with Keycloak userinfo endpoint
    const response = await fetch(`${OIDC_ISSUER}/protocol/openid-connect/userinfo`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Keycloak - Token verification failed:', response.status, errorText);
      reply.status(401).send({ code: 401, message: 'Keycloak: Invalid token' });
      return;
    }

    const userInfo = await response.json();
    request.user = userInfo;
  } catch (error) {
    console.error('Keycloak - Token verification error:', error);
    reply.status(401).send({ error: 'Keycloak: Token verification failed' });
  }
};