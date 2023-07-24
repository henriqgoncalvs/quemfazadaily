/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from 'next/head';
import Avatar from 'boring-avatars';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { api } from '~/utils/api';
import { type Employee } from '@prisma/client';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import Confetti from 'react-confetti';
import { useWindowSize } from 'usehooks-ts';
import { useState } from 'react';
import {
  GitHubLogoIcon,
  ReloadIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import { ScrollArea } from '~/components/ui/scroll-area';

export default function Home() {
  const { width, height } = useWindowSize();
  const daily = api.daily.getCurrent.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const nextEmployees = api.employee.getNext.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    }
  );
  const employees = api.employee.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const {
    mutateAsync: createEmployee,
    isLoading: createEmployeeIsLoading,
  } = api.employee.create.useMutation();
  const {
    mutateAsync: deleteEmployee,
    isLoading: deleteEmployeeIsLoading,
  } = api.employee.delete.useMutation();
  const {
    mutateAsync: skipToNextEmployee,
    isLoading: skipToNextEmployeeIsLoading,
  } = api.daily.skipToNextEmployee.useMutation();
  const {
    mutateAsync: createOrRestartDaily,
    isLoading: createOrRestartDailyIsLoading,
  } = api.daily.createOrRestart.useMutation();

  const handleCreateDaily = async () => {
    await createOrRestartDaily();
    await daily.refetch();
    await nextEmployees.refetch();
  };

  return (
    <>
      <Head>
        <title>Quem faz a daily</title>
        <meta name="description" content="Quem faz a daily" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Confetti
        numberOfPieces={daily.data ? 500 : 0}
        recycle={false}
        width={width}
        height={height}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-tl from-purple-900 to-indigo-500">
        <div className="container flex flex-1 flex-col items-center gap-12 px-4 py-16 ">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                onClick={handleCreateDaily}
                disabled={createOrRestartDailyIsLoading}
              >
                Reiniciar
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <ManageEmployeesForm
                employees={employees.data}
                deleteEmployee={deleteEmployee}
                deleteEmployeeIsLoading={deleteEmployeeIsLoading}
                refetchAll={async () => {
                  await employees.refetch();
                  await daily.refetch();
                  await nextEmployees.refetch();
                }}
                refetchEmployeesIsLoading={
                  employees.isRefetching
                }
              />
              <AddEmployeesForm
                createEmployee={createEmployee}
                createEmployeeIsLoading={createEmployeeIsLoading}
                refetchNextEmployees={() =>
                  nextEmployees.refetch()
                }
                refetchDaily={() => daily.refetch()}
              />
            </div>
          </div>

          <h1 className="absolute left-1/2 top-20 flex-1 -translate-x-1/2 -translate-y-1/2 text-center text-lg font-medium text-zinc-100">
            Quem faz a daily é...
          </h1>

          <div className="flex h-full flex-1 flex-grow flex-col items-center justify-center gap-10">
            {daily.isLoading && (
              <p className="animate-pulse text-2xl font-bold tracking-tight text-white">
                Carregando...
              </p>
            )}
            {daily.isError && (
              <p className="text-2xl font-bold tracking-tight text-white">
                Ocorreu um erro
              </p>
            )}
            {daily.data && (
              <div className="relative animate-fade-in">
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 rounded-full shadow-lg shadow-zinc-700">
                  <Avatar
                    size={64}
                    name={daily.data?.employee.name ?? '-'}
                    variant="beam"
                    colors={[
                      '#92A1C6',
                      '#146A7C',
                      '#F0AB3D',
                      '#C271B4',
                      '#C20D90',
                    ]}
                  />
                </div>

                <h2 className="text-9xl font-bold tracking-tight text-white">
                  {daily.data?.employee.name ?? '-'}
                </h2>
              </div>
            )}
          </div>

          <div className="absolute bottom-16 left-16 flex items-center space-x-2">
            <Button variant="default" size="icon" asChild>
              <Link
                href="https://github.com/hnqg/quemfazadaily"
                target="_blank"
              >
                <GitHubLogoIcon />
              </Link>
            </Button>
          </div>

          {nextEmployees?.data && (
            <div className="absolute bottom-16 right-16">
              <NextEmployeesList
                employees={nextEmployees.data.employees}
                skipToNextEmployee={skipToNextEmployee}
                skipToNextEmployeeIsLoading={
                  skipToNextEmployeeIsLoading
                }
                refetchDaily={() => daily.refetch()}
                refetchNextEmployees={() =>
                  nextEmployees.refetch()
                }
                isLoading={
                  daily.isRefetching ||
                  nextEmployees.isRefetching
                }
              />
            </div>
          )}

          <p className="flex-grow-0 text-sm text-zinc-200">
            Nova Deli - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </main>
    </>
  );
}

const ManageEmployeesForm = ({
  employees,
  deleteEmployee,
  deleteEmployeeIsLoading,
  refetchAll,
  refetchEmployeesIsLoading,
}: {
  employees?: Employee[];
  deleteEmployee: ({ id }: { id: string }) => unknown;
  deleteEmployeeIsLoading: boolean;
  refetchAll: () => void;
  refetchEmployeesIsLoading: boolean;
}) => {
  const handleDeleteEmployee = async ({
    id,
  }: {
    id: string;
  }) => {
    await deleteEmployee({ id });
    refetchAll();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Editar Integrantes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Integrantes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-64 w-full">
          {employees?.map((employee) => (
            <div
              key={employee.id}
              className="mb-2 mr-5 flex justify-between rounded-md border border-zinc-300 p-4"
            >
              <div className=" flex items-center justify-start space-x-2">
                <Avatar
                  size={32}
                  name={employee.name ?? '-'}
                  variant="beam"
                  colors={[
                    '#92A1C6',
                    '#146A7C',
                    '#F0AB3D',
                    '#C271B4',
                    '#C20D90',
                  ]}
                />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {employee.name}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                size="icon"
                onClick={() =>
                  handleDeleteEmployee({ id: employee.id })
                }
                disabled={
                  deleteEmployeeIsLoading ||
                  refetchEmployeesIsLoading
                }
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const addEmployeesFormSchema = z.object({
  name: z.string(),
});

const AddEmployeesForm = ({
  createEmployee,
  createEmployeeIsLoading,
  refetchNextEmployees,
  refetchDaily,
}: {
  createEmployee: ({ name }: { name: string }) => unknown;
  createEmployeeIsLoading: boolean;
  refetchNextEmployees: () => void;
  refetchDaily: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addEmployeesFormSchema>>({
    resolver: zodResolver(addEmployeesFormSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(
    values: z.infer<typeof addEmployeesFormSchema>
  ) {
    await createEmployee({ name: values.name });
    refetchNextEmployees();
    refetchDaily();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar Integrante</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Integrante</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite aqui o nome"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={createEmployeeIsLoading}
              >
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const NextEmployeesList = ({
  employees,
  skipToNextEmployee,
  skipToNextEmployeeIsLoading,
  refetchDaily,
  refetchNextEmployees,
  isLoading,
}: {
  employees: Employee[];
  skipToNextEmployee: () => Promise<void>;
  skipToNextEmployeeIsLoading: boolean;
  refetchDaily: () => void;
  refetchNextEmployees: () => void;
  isLoading: boolean;
}) => {
  const handleNextEmployee = async () => {
    await skipToNextEmployee();
    refetchDaily();
    refetchNextEmployees();
  };

  return (
    <Card className="shadow-lg shadow-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-md">
          Próximos integrantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center space-x-2 pb-4"
          >
            <Avatar
              size={32}
              name={employee.name ?? '-'}
              variant="beam"
              colors={[
                '#92A1C6',
                '#146A7C',
                '#F0AB3D',
                '#C271B4',
                '#C20D90',
              ]}
            />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {employee.name}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          disabled={skipToNextEmployeeIsLoading || isLoading}
          onClick={handleNextEmployee}
        >
          {(skipToNextEmployeeIsLoading || isLoading) && (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Pular integrante atual
        </Button>
      </CardFooter>
    </Card>
  );
};
