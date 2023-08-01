import {
  createTRPCRouter,
  publicProcedure,
} from '~/server/api/trpc';

export const dailyRouter = createTRPCRouter({
  getCurrent: publicProcedure.query(async ({ ctx }) => {
    const daily = await ctx.prisma.daily.findFirst();
    const employees = await ctx.prisma.employee.count();

    const currentDate = new Date().toISOString().split('T')[0];
    const currentDay = new Date().getDay();

    let currentPosition;

    if (
      daily?.current_day === currentDate ||
      currentDay === 0 ||
      currentDay === 1 ||
      currentDay === 7
    ) {
      currentPosition = daily?.current_position ?? 0;
    } else {
      currentPosition =
        ((daily?.current_position ?? 0) + 1) % employees;

      await ctx.prisma.daily.update({
        where: {
          id: daily?.id,
        },
        data: {
          current_position: currentPosition,
          current_day: currentDate,
        },
      });
    }

    const currentEmployee = await ctx.prisma.employee.findFirst({
      where: {
        position: currentPosition,
      },
    });

    return {
      employee: { ...currentEmployee },
    };
  }),
  skipToNextEmployee: publicProcedure.mutation(
    async ({ ctx }) => {
      const daily = await ctx.prisma.daily.findFirst();
      const employees = await ctx.prisma.employee.count();

      const nextPosition =
        ((daily?.current_position ?? 0) + 1) % employees;

      await ctx.prisma.daily.update({
        where: {
          id: daily?.id,
        },
        data: {
          current_position: nextPosition,
        },
      });

      return;
    }
  ),
  createOrRestart: publicProcedure.mutation(async ({ ctx }) => {
    const daily = await ctx.prisma.daily.findFirst();
    const currentDate =
      new Date().toISOString().split('T')[0] ?? '';

    if (!daily) {
      return await ctx.prisma.daily.create({
        data: {
          current_day: currentDate,
        },
      });
    }

    return await ctx.prisma.daily.update({
      where: {
        id: daily?.id,
      },
      data: {
        current_day: currentDate,
        current_position: 0,
      },
    });
  }),
});
