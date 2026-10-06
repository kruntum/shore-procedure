import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config';
import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import governmentAgenciesRouter from './routes/governmentAgencies';
import portsRouter from './routes/ports';
import agentsRouter from './routes/agents';
import workTypesRouter from './routes/workTypes';
import proceduresRouter from './routes/procedures';
import filesRouter from './routes/files';
import searchRouter from './routes/search';
import rolesRouter from './routes/roles';
import usersRouter from './routes/users';
import workflowsRouter from './routes/workflows';
import { ensureBucket } from './services/minio';
import { runMigrations } from './db/migrate';
import { runSeed } from './db/seed';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API Routes prefix
const api = new Hono();

api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'asiathai-freight-sop-backend',
  });
});

api.get('/', (c) => {
  return c.json({
    message: 'Asiathai Freight SOP Management System API',
    version: '1.0.0',
  });
});

// Mount modules
api.route('/auth', authRouter);
api.route('/categories', categoriesRouter);
api.route('/government-agencies', governmentAgenciesRouter);
api.route('/ports', portsRouter);
api.route('/agents', agentsRouter);
api.route('/work-types', workTypesRouter);
api.route('/procedures', proceduresRouter);
api.route('/workflows', workflowsRouter);
api.route('/files', filesRouter);
api.route('/search', searchRouter);
api.route('/roles', rolesRouter);
api.route('/users', usersRouter);

app.route('/api', api);

// Ensure database schema and seed data are ready on startup
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await runMigrations();
      await runSeed();
    } catch (err) {
      console.error('❌ Database migration/seed initialization error:', err);
    }
  })();
}

// Ensure MinIO bucket exists in background
ensureBucket().catch((err) => console.error('Bucket initialization error:', err));

console.log(`🚀 Shore Backend running on port ${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
