import { Router } from 'express';
import { sequelize } from '../models';

const router = Router();

router.get('/', async (_req, res) => {
  let dbStatus = 'up';
  try {
    await sequelize.authenticate();
  } catch {
    dbStatus = 'down';
  }
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
