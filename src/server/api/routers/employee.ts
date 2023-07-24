import { z } from 'zod';
import {
  createTRPCRouter,
  publicProcedure,
} from '~/server/api/trpc';

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const employeeRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createdEmployee = await ctx.prisma.employee.create({
        data: {
          ...input,
          position: 0,
        },
      });

      const employees = await ctx.prisma.employee.findMany();

      const sortedEmployees = employees.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      await Promise.all(
        sortedEmployees.map(async (employee, index) => {
          await pause(100);

          return ctx.prisma.employee.update({
            where: {
              id: employee.id,
            },
            data: {
              position: index,
            },
          });
        })
      );

      return {
        employee: createdEmployee,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.employee.findMany();
  }),
  getNext: publicProcedure.query(async ({ ctx }) => {
    const daily = await ctx.prisma.daily.findFirst();

    const nextEmployees = await ctx.prisma.employee.findMany({
      where: {
        position: {
          gt: daily?.current_position,
        },
      },
      orderBy: [
        {
          position: 'asc',
        },
      ],
      take: 3,
    });

    if (nextEmployees.length < 3) {
      const nextEmployeesFromBeggining =
        await ctx.prisma.employee.findMany({
          where: {
            position: {
              gte: 0,
            },
          },
          orderBy: [
            {
              position: 'asc',
            },
          ],
          take: 3 - nextEmployees.length,
        });

      return {
        employees: [
          ...nextEmployees,
          ...nextEmployeesFromBeggining,
        ],
      };
    }

    return {
      employees: nextEmployees,
    };
  }),
});
