import { Home, Search } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Page not found');
  return (
    <section className="py-24 lg:py-32">
      <div className="container-page text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-mint-600">404</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">This spot is spotless — and empty.</h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-navy-600">
          We couldn't find the page you were looking for. It may have moved, or the link might be incorrect.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to="/" size="lg">
            <Home className="h-4 w-4" aria-hidden /> Back to home
          </ButtonLink>
          <ButtonLink to="/services" size="lg" variant="outline">
            <Search className="h-4 w-4" aria-hidden /> Browse services
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
