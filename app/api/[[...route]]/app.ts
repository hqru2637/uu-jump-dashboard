import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { bearerAuth } from 'hono/bearer-auth';
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
  bearerAuth({ token: process.env.GAME_API_TOKEN ?? '' }),
  zValidator('json', submitSchema),
  async (c) => {
    const { deviceId, mapName, clearTime, jumpCount } = c.req.valid('json');

    try {
      // 1. Register device if not exists
      // Check if device exists
      const existingDevice = await db
        .select()
        .from(devices)
        .where(eq(devices.id, deviceId))
        .limit(1);

      if (existingDevice.length === 0) {
        // Generate display name with sequence (PC1, PC2...)
        await db.transaction(async (tx) => {
          // Double check inside transaction to avoid race conditions
          const check = await tx
            .select()
            .from(devices)
            .where(eq(devices.id, deviceId))
            .limit(1);
          
          if (check.length > 0) return;

          const countRes = await tx
            .select({ count: sql<number>`count(*)` })
            .from(devices);
          
          const nextNum = Number(countRes[0]?.count || 0) + 1;

          await tx.insert(devices).values({
            id: deviceId,
            displayName: `PC${nextNum}`,
          });
        });
      }

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
    // Get unique map names
    const maps = await db
      .selectDistinct({ mapName: results.mapName })
      .from(results);

    const rankingByMap: Record<string, any[]> = {};

    for (const m of maps) {
      const mapRanking = await db
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
        .where(eq(results.mapName, m.mapName))
        .orderBy(asc(results.clearTime))
        .limit(20); // Top 20 per map
      
      rankingByMap[m.mapName] = mapRanking;
    }

    return c.json(rankingByMap);
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
    // created_at is UTC. Convert to JST for grouping.
    const hourlyStats = await db.execute(sql`
      SELECT
        date_trunc('hour', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo') as hour,
        count(*) as count
      FROM ${results}
      WHERE created_at > now() - interval '24 hours'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    // Format for Recharts (needs string/number keys)
    const graphData = hourlyStats.map((row: any) => {
      const date = new Date(row.hour);
      return {
        hour: date.getHours() + ':00',
        count: Number(row.count),
        fullDate: row.hour,
      };
    });

    return c.json({
      totalPlays,
      graphData
    });
  });

export type AppType = typeof routes;
export default app;
