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
        .limit(20);
      
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
  .get(
    '/stats/ranking/more',
    zValidator(
      'query',
      z.object({
        mapName: z.string(),
        offset: z.string().transform((v) => parseInt(v, 10)),
        limit: z.string().transform((v) => parseInt(v, 10)).default('10'),
      })
    ),
    async (c) => {
      const { mapName, offset, limit } = c.req.valid('query');

      const items = await db
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
        .where(eq(results.mapName, mapName))
        .orderBy(asc(results.clearTime))
        .offset(offset)
        .limit(limit);

      return c.json(items);
    }
  )
  .get('/stats/analytics', async (c) => {
    // Total Plays
    const totalPlaysResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(results);
    const totalPlays = Number(totalPlaysResult[0]?.count || 0);

    // Recent Activity (Last 12 hours, 30 min intervals)
    const recentStats = await db.execute(sql`
      SELECT
        to_char(to_timestamp(floor(extract(epoch from (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')) / 1800) * 1800), 'YYYY-MM-DD HH24:MI') as time_slot,
        count(*) as count
      FROM ${results}
      WHERE created_at > now() - interval '12 hours'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const recentActivity = recentStats.map((row: any) => {
      // row.time_slot is "YYYY-MM-DD HH:mm" (Tokyo time)
      const timeStr = row.time_slot.substring(11, 16); // "HH:mm"
      return {
        time: timeStr,
        count: Number(row.count),
        fullDate: row.time_slot,
      };
    });

    // Activity Trend (Last 48 hours, 2 hour intervals)
    const trendStats = await db.execute(sql`
      SELECT
        to_char(to_timestamp(floor(extract(epoch from (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')) / 7200) * 7200), 'YYYY-MM-DD HH24:MI') as time_slot,
        count(*) as count
      FROM ${results}
      WHERE created_at > now() - interval '48 hours'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const activityTrend = trendStats.map((row: any) => {
      // row.time_slot is "YYYY-MM-DD HH:mm"
      const datePart = row.time_slot.substring(5, 10).replace('-', '/');
      const timePart = row.time_slot.substring(11, 16);
      return {
        time: `${datePart} ${timePart}`,
        count: Number(row.count),
        fullDate: row.time_slot,
      };
    });

    // Histograms per map
    const maps = await db
      .selectDistinct({ mapName: results.mapName })
      .from(results);

    const histograms: { mapName: string; data: any[] }[] = [];

    for (const m of maps) {
      const times = await db
        .select({ clearTime: results.clearTime })
        .from(results)
        .where(eq(results.mapName, m.mapName));
      
      // Sort for percentile calculation
      const clearTimes = times.map(t => t.clearTime).sort((a, b) => a - b);
      if (clearTimes.length === 0) continue;

      const min = clearTimes[0];
      
      // Use 95th percentile to cut off outliers
      const p95Index = Math.floor(clearTimes.length * 0.95);
      // If data count is small, use max, otherwise use p95
      const maxLimit = clearTimes.length > 10 ? clearTimes[p95Index] : clearTimes[clearTimes.length - 1];
      
      // Determine bin size (aim for ~15 bins based on the effective range)
      let binSize = Math.ceil((maxLimit - min) / 15);
      if (binSize < 1) binSize = 1;
      
      // Align start to binSize
      const start = Math.floor(min / binSize) * binSize;
      // Ensure we cover the max limit
      const end = Math.ceil(maxLimit / binSize) * binSize + binSize;

      const bins: Record<number, number> = {};
      // Initialize bins
      for (let i = start; i < end; i += binSize) {
        bins[i] = 0;
      }

      // Count frequencies (only up to maxLimit)
      clearTimes.forEach(t => {
        if (t > end) return; // Skip outliers for the visualization

        // Find the lower bound of the bin
        const bin = Math.floor(t / binSize) * binSize;
        // Just in case logic to ensure it falls into a valid bin
        if (bins[bin] !== undefined) {
          bins[bin]++;
        }
      });

      const histogramData = Object.entries(bins)
        .map(([rangeStart, count]) => ({
          range: `${rangeStart}-${Number(rangeStart) + binSize}s`,
          count,
          min: Number(rangeStart)
        }))
        .sort((a, b) => a.min - b.min);

      histograms.push({
        mapName: m.mapName,
        data: histogramData
      });
    }

    // Sort histograms by map name
    histograms.sort((a, b) => a.mapName.localeCompare(b.mapName));

    return c.json({
      totalPlays,
      recentActivity,
      activityTrend,
      histograms
    });
  });

export type AppType = typeof routes;
export default app;
