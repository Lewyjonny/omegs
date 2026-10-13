import { PageHeader } from '../components/ui/PageHeader';
import { Alert } from '../components/ui/Alert';
import { usePageMeta } from '../hooks/usePageMeta';

const content = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Information we collect', 'Describe the personal information Omegs collects (e.g. name, email, phone, address, booking details) and how it is collected.'],
      ['How we use information', 'Explain how information is used to provide cleaning services, manage bookings and communicate with customers.'],
      ['Sharing and processors', 'List third parties that process data on Omegs\' behalf (e.g. authentication, hosting, email delivery, payments).'],
      ['Your rights', 'Describe how customers can access, correct or delete their data, and how to contact Omegs about privacy.'],
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    sections: [
      ['Using Omegs', 'Set out the conditions for using the Omegs website and mobile app.'],
      ['Bookings and cancellations', 'Describe how bookings are confirmed, rescheduled and cancelled, including any notice periods or fees.'],
      ['Payments', 'Explain pricing, payment methods and when payment is taken.'],
      ['Liability', 'Describe responsibilities of Omegs and customers, including damage and access arrangements.'],
    ],
  },
} as const;

export default function LegalPage({ type }: { type: keyof typeof content }) {
  const page = content[type];
  usePageMeta(page.title);
  return (
    <>
      <PageHeader eyebrow="Legal" title={page.title} />
      <section className="py-16">
        <div className="container-page max-w-3xl">
          <Alert tone="demo" title="Placeholder document">
            This page is a structural placeholder and is not a legally binding {page.title.toLowerCase()}. Replace it with text reviewed by a qualified legal
            professional before launch.
          </Alert>
          <div className="mt-10 space-y-10">
            {page.sections.map(([heading, body]) => (
              <div key={heading}>
                <h2 className="text-xl font-semibold">{heading}</h2>
                <p className="mt-3 leading-relaxed text-navy-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
