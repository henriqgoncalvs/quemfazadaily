import { createTRPCRouter } from '~/server/api/trpc';
import { dailyRouter } from './routers/daily';
import { employeeRouter } from './routers/employee';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  daily: dailyRouter,
  employee: employeeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
