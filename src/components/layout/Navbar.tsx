import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { services } from '../../data/services';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../Logo';
import { Button, ButtonLink } from '../ui/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive ? 'text-navy-900 bg-navy-50' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'}`;

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const active = location.pathname.startsWith('/services');

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const focusItem = (index: number) => {
    const items = ref.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
    if (!items?.length) return;
    items[(index + items.length) % items.length].focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? []);
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      requestAnimationFrame(() => focusItem(current + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(current - 1);
    }
  };

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="services-menu"
        onClick={() => setOpen((v) => !v)}
        className={`${navLinkClass({ isActive: active })} inline-flex items-center gap-1`}
      >
        Services
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div
          id="services-menu"
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-3xl bg-white p-3 shadow-lift ring-1 ring-navy-900/5 animate-fade-up"
        >
          <div className="grid grid-cols-2 gap-1">
            {services.map((s) => (
              <Link
                key={s.id}
                to={`/services/${s.id}`}
                role="menuitem"
                className="group flex gap-3 rounded-2xl p-3 transition hover:bg-surface focus:bg-surface focus:outline-none"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-50 text-mint-700 transition group-hover:bg-mint-100">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{s.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-navy-500">{s.shortDescription}</span>
                </span>
              </Link>
            ))}
          </div>
          <Link
            to="/services"
            role="menuitem"
            className="mt-2 flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-mint-400"
          >
            View all services
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    if (!mobileOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        mobileOpen
          ? 'bg-white shadow-[0_1px_0_rgba(18,35,58,0.06)]'
          : scrolled
            ? 'bg-white/90 shadow-[0_1px_0_rgba(18,35,58,0.06)] backdrop-blur-lg'
            : 'bg-white'
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift">
        Skip to content
      </a>
      <nav className="container-page flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <ServicesDropdown />
          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
          <NavLink to="/download" className={navLinkClass}>
            Get the App
          </NavLink>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {(role === 'employee' || role === 'admin') && (
                <NavLink to="/staff" className={navLinkClass}>
                  Staff
                </NavLink>
              )}
              {role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/account" className={navLinkClass}>
                My bookings
              </NavLink>
              <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Log out">
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
          )}
          <ButtonLink to="/book" variant="primary">
            Book a Cleaning
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-navy-800 hover:bg-navy-50 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-6">
            <NavLink to="/" end className={({ isActive }) => `rounded-2xl px-4 py-3 text-base font-semibold ${isActive ? 'bg-navy-50' : ''}`}>
              Home
            </NavLink>
            <details className="group rounded-2xl" open={location.pathname.startsWith('/services')}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold hover:bg-navy-50">
                Services
                <ChevronDown className="h-5 w-5 transition group-open:rotate-180" aria-hidden />
              </summary>
              <div className="mt-1 grid gap-1 pl-2">
                <Link to="/services" className="rounded-xl px-4 py-2.5 text-sm font-medium text-mint-700 hover:bg-surface">
                  All services
                </Link>
                {services.map((s) => (
                  <Link key={s.id} to={`/services/${s.id}`} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-navy-700 hover:bg-surface">
                    <s.icon className="h-4 w-4 text-mint-600" aria-hidden />
                    {s.name}
                  </Link>
                ))}
              </div>
            </details>
            {[
              ['/about', 'About Us'],
              ['/contact', 'Contact'],
              ['/download', 'Get the App'],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded-2xl px-4 py-3 text-base font-semibold ${isActive ? 'bg-navy-50' : ''}`}>
                {label}
              </NavLink>
            ))}
            {(role === 'employee' || role === 'admin') && (
              <NavLink to="/staff" className={({ isActive }) => `rounded-2xl px-4 py-3 text-base font-semibold ${isActive ? 'bg-navy-50' : ''}`}>
                Staff
              </NavLink>
            )}
            {role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `rounded-2xl px-4 py-3 text-base font-semibold ${isActive ? 'bg-navy-50' : ''}`}>
                Admin
              </NavLink>
            )}
            {user && (
              <NavLink to="/account" className={({ isActive }) => `rounded-2xl px-4 py-3 text-base font-semibold ${isActive ? 'bg-navy-50' : ''}`}>
                My bookings
              </NavLink>
            )}
            <div className="mt-6 grid gap-3 border-t border-navy-100 pt-6">
              <ButtonLink to="/book" size="lg">
                Book a Cleaning
              </ButtonLink>
              {user ? (
                <Button variant="outline" size="lg" onClick={handleSignOut}>
                  Log out
                </Button>
              ) : (
                <ButtonLink to="/login" variant="outline" size="lg">
                  Login
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
