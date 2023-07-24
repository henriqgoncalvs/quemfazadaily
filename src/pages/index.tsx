/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from 'next/head';
import Avatar from 'boring-avatars';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export default function Home() {
  const { width, height } = useWindowSize();
  const daily = api.daily.getCurrent.useQuery();
  const nextEmployees = api.employee.getNext.useQuery();
  const {
    mutateAsync: createEmployee,
    isLoading: createEmployeeIsLoading,
  } = api.employee.create.useMutation();
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
        numberOfPieces={500}
        recycle={false}
        width={width}
        height={height}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-400 via-fuchsia-500 to-indigo-500">
        <div className="absolute left-16 top-16 flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={handleCreateDaily}
            disabled={createOrRestartDailyIsLoading}
          >
            Reiniciar
          </Button>
        </div>

        <div className="absolute right-16 top-16 flex items-center space-x-2">
          <ManageEmployeesForm />
          <AddEmployeesForm
            createEmployee={createEmployee}
            createEmployeeIsLoading={createEmployeeIsLoading}
            refetchNextEmployees={() => nextEmployees.refetch()}
            refetchDaily={() => daily.refetch()}
          />
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
            />
          </div>
        )}

        <div className="container flex flex-1 flex-col items-center gap-12 px-4 py-16 ">
          <h1 className="flex-grow-0 text-lg font-semibold text-white">
            Quem faz a daily é...
          </h1>

          <div className="flex h-full flex-1 flex-grow flex-col items-center justify-center gap-10">
            <div className="relative animate-fade-in">
              <div className="absolute -top-28 left-1/2 -translate-x-1/2">
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
          </div>

          <p className="flex-grow-0 text-lg font-semibold text-white">
            Nova Deli - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </main>
    </>
  );
}

const ManageEmployeesForm = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled>
          Editar Integrantes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Integrantes</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently
            delete your account and remove your data from our
            servers.
          </DialogDescription>
        </DialogHeader>
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
}: {
  employees: Employee[];
  skipToNextEmployee: () => Promise<void>;
  skipToNextEmployeeIsLoading: boolean;
  refetchDaily: () => void;
  refetchNextEmployees: () => void;
}) => {
  const handleNextEmployee = async () => {
    await skipToNextEmployee();
    refetchDaily();
    refetchNextEmployees();
  };

  return (
    <Card>
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
          disabled={skipToNextEmployeeIsLoading}
          onClick={handleNextEmployee}
        >
          Pular integrante atual
        </Button>
      </CardFooter>
    </Card>
  );
};
