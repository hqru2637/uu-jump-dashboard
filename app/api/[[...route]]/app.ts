import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db';
import { devices, results } from '@/db/schema';
import { desc, eq, sql, asc } from 'drizzle-orm';

const app = new Hono().basePath('/api');

// A. Unity Endpoint (Standard REST)
const submitSchema = z.object({
  deviceId: z.string(),
  mapName: z.string(),
  clearTime: z.number(),
  jumpCount: z.number(),
});

app.post(
  '/game/submit',
  zValidator('json', submitSchema),
  async (c) => {
    const { deviceId, mapName, clearTime, jumpCount } = c.req.valid('json');

    try {
      // 1. Register device if not exists
      await db.insert(devices)
        .values({ id: deviceId })
        .onConflictDoNothing();

      // 2. Insert result
      await db.insert(results).values({
        deviceId,
        mapName,
        clearTime,
        jumpCount,
      });

      return c.json({ success: true });
    } catch (e) {
      console.error(e);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  }
);

// B. Dashboard Endpoints (RPC Usage)
const routes = app
  .get('/stats/ranking', async (c) => {
    const ranking = await db
      .select({
        id: results.id,
        displayName: devices.displayName,
        mapName: results.mapName,
        clearTime: results.clearTime,
        jumpCount: results.jumpCount,
        createdAt: results.createdAt,
      })
      .from(results)
      .innerJoin(devices, eq(results.deviceId, devices.id))
      .orderBy(asc(results.clearTime))
      .limit(50);

    return c.json(ranking);
  })
  .get('/stats/history', async (c) => {
    const history = await db
      .select({
        id: results.id,
        displayName: devices.displayName,
        mapName: results.mapName,
        clearTime: results.clearTime,
        jumpCount: results.jumpCount,
        createdAt: results.createdAt,
      })
      .from(results)
      .innerJoin(devices, eq(results.deviceId, devices.id))
      .orderBy(desc(results.createdAt))
      .limit(100);

    return c.json(history);
  })
  .get('/stats/analytics', async (c) => {
    // Total Plays
    const totalPlaysResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(results);
    const totalPlays = Number(totalPlaysResult[0]?.count || 0);

    // Hourly Graph (Last 24 hours)
    // Note: SQLite/Postgres differences exist. Assuming Postgres as per plan.
    // date_trunc('hour', created_at)
    const hourlyStats = await db.execute(sql`
      SELECT
        date_trunc('hour', created_at) as hour,
        count(*) as count
      FROM ${results}
      WHERE created_at > now() - interval '24 hours'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    // Format for Recharts (needs string/number keys)
    const graphData = hourlyStats.map((row: any) => ({
      hour: new Date(row.hour).getHours() + ':00', // Simple formatting
      count: Number(row.count),
      fullDate: row.hour // Keep full date for tooltip if needed
    }));

    return c.json({
      totalPlays,
      graphData
    });
  });

export type AppType = typeof routes;
export default app;
