import { Card } from '@/components/ui/card';

export function GuardScreen({ title, message }: { title: string; message: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <a href="/login" className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Go to login
        </a>
      </Card>
    </section>
  );
}
