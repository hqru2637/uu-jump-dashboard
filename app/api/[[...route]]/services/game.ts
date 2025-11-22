import { db } from '@/db';
import { devices, results } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const submitGameResult = async (data: {
  deviceId: string;
  mapName: string;
  clearTime: number;
  jumpCount: number;
}) => {
  const { deviceId, mapName, clearTime, jumpCount } = data;

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
};
