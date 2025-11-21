import { hc } from 'hono/client';
import { AppType } from '@/app/api/[[...route]]/app';

// Browser: relative path works
// Server: needs absolute path
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const client = hc<AppType>(baseUrl);
