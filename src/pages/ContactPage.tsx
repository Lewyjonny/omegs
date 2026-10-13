import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { FaqAccordion } from '../components/FaqAccordion';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { siteConfig } from '../config/site';
import { generalFaqs } from '../data/content';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { hasErrors, isEmail, type Errors } from '../lib/validation';
import { contactService, type ContactMessage } from '../services/contact';

export default function ContactPage() {
  usePageMeta('Contact', 'Get in touch with Omegs about bookings, services or support.');
  const { user } = useAuth();
  const empty: ContactMessage = { name: user?.fullName ?? '', email: user?.email ?? '', subject: '', message: '' };
  const [form, setForm] = useState<ContactMessage>(empty);
  const [errors, setErrors] = useState<Errors<ContactMessage>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const update = (field: keyof ContactMessage) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const e: Errors<ContactMessage> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!isEmail(form.email)) e.email = 'Please enter a valid email address.';
    if (form.subject.trim().length < 3) e.subject = 'Please add a short subject.';
    if (form.message.trim().length < 10) e.message = 'Please write a message of at least 10 characters.';
    setErrors(e);
    if (hasErrors(e)) return;
    setStatus('loading');
    try {
      await contactService.send(form);
      setStatus('success');
      setForm(empty);
    } catch {
      setStatus('error');
    }
  };

  const details = [
    { icon: Mail, label: 'Email', value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { icon: Phone, label: 'Phone', value: siteConfig.contact.phone },
    { icon: MapPin, label: 'Address', value: siteConfig.contact.address },
    { icon: Clock, label: 'Hours', value: siteConfig.contact.hours },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="We're here to help" description="Questions about a service, a booking or the app? Send us a message and our team will get back to you." />
      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-10">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              {contactService.isDemo && (
                <Alert tone="demo" title="Demo form" className="mt-5">
                  Messages are not delivered yet — this form is not connected to an email service.
                </Alert>
              )}
              {status === 'success' && (
                <Alert tone="success" title="Message ready" className="mt-5">
                  Thanks for reaching out. {contactService.isDemo ? 'In demo mode your message was validated but not sent.' : "We'll be in touch soon."}
                </Alert>
              )}
              {status === 'error' && (
                <Alert tone="error" className="mt-5">
                  We couldn't send your message. Please try again or email us directly.
                </Alert>
              )}
              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Name" name="name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
                  <TextField label="Email" type="email" name="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
                </div>
                <TextField label="Subject" name="subject" value={form.subject} onChange={update('subject')} error={errors.subject} />
                <TextAreaField label="Message" name="message" rows={6} value={form.message} onChange={update('message')} error={errors.message} />
                <Button type="submit" size="lg" loading={status === 'loading'} className="w-full sm:w-auto">
                  {status === 'loading' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-4xl bg-navy-900 p-8 text-white">
              <h2 className="text-xl font-semibold text-white">Contact details</h2>
              <ul className="mt-6 space-y-5">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-mint-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-wider text-navy-300">{label}</span>
                      {href ? (
                        <a href={href} className="font-medium hover:text-mint-300">
                          {value}
                        </a>
                      ) : (
                        <span className="font-medium">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {siteConfig.contact.isPlaceholder && <p className="mt-6 text-xs text-navy-300">These contact details are placeholders and will be updated before launch.</p>}
            </div>
            <div>
              <h2 className="mb-4 text-xl font-semibold">Common questions</h2>
              <FaqAccordion items={generalFaqs.slice(1, 5)} defaultOpen={null} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
