import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { bearerAuth } from 'hono/bearer-auth';
import { submitGameResult } from './services/game';
import { getAnalytics, getHistory, getMoreRanking, getRanking } from './services/stats';

const app = new Hono().basePath('/api');

// A. Unity Endpoint (Standard REST)
const submitSchema = z.object({
  deviceId: z.string(),
  mapName: z.string(),
  clearTime: z.number(),
  jumpCount: z.number(),
});

// ゲームの公開に伴いトークンが誰でも分かるようになったため、ランキングの更新は停止する。
app.post(
  '/game/submit',
  // bearerAuth({ token: process.env.GAME_API_TOKEN ?? '' }),
  // zValidator('json', submitSchema),
  async (c) => {
    // const { deviceId, mapName, clearTime, jumpCount } = c.req.valid('json');

    // try {
    //   await submitGameResult({ deviceId, mapName, clearTime, jumpCount });
    //   return c.json({ success: true });
    // } catch (e) {
    //   console.error(e);
    //   return c.json({ success: false, error: 'Internal Server Error' }, 500);
    // }
    return c.status(410);
  }
);

// B. Dashboard Endpoints (RPC Usage)
const routes = app
  .get('/stats/ranking', async (c) => {
    const rankingByMap = await getRanking();
    return c.json(rankingByMap);
  })
  .get('/stats/history', async (c) => {
    const history = await getHistory();
    return c.json(history);
  })
  .get(
    '/stats/ranking/more',
    zValidator(
      'query',
      z.object({
        mapName: z.string(),
        offset: z.string().transform((v) => parseInt(v, 10)),
        limit: z.string().transform((v) => parseInt(v, 10)).default(10),
      })
    ),
    async (c) => {
      const { mapName, offset, limit } = c.req.valid('query');
      const items = await getMoreRanking(mapName, offset, limit);
      return c.json(items);
    }
  )
  .get('/stats/analytics', async (c) => {
    const analytics = await getAnalytics();
    return c.json(analytics);
  });

export type AppType = typeof routes;
export default app;
