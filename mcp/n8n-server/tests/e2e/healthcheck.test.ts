/**
 * E2E tests for Healthcheck Server
 */

import request from 'supertest';
import express from 'express';
import { HealthCheckServer } from '../../src/healthcheck/server.js';

describe('Healthcheck Server E2E', () => {
  let server: HealthCheckServer;
  let app: express.Application;

  beforeAll(() => {
    server = new HealthCheckServer();
    // @ts-ignore - Access private app for testing
    app = server.app;
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version', '2.0.0');
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/ready');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/live');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics', async () => {
      const response = await request(app).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('rateLimiter');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
