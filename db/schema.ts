import { pgTable, text, integer, doublePrecision, timestamp, bigserial } from 'drizzle-orm/pg-core';

// デバイス管理（Unityから送信されたIDを格納）
export const devices = pgTable('devices', {
  id: text('id').primaryKey(), // Unity側で生成したユニークID
  displayName: text('display_name').default('PC[New]').notNull(), // 管理画面で編集可能
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ゲームリザルト
export const results = pgTable('results', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  deviceId: text('device_id').references(() => devices.id).notNull(),
  mapName: text('map_name').notNull(),
  clearTime: doublePrecision('clear_time').notNull(),
  jumpCount: integer('jump_count').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
