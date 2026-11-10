import { MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { whatsappLink } from '../config/site';

export function WhatsAppLink({ text, className = '', children }: { text?: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-white shadow-sm transition hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 focus-visible:ring-offset-2 ${className}`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      {children}
    </a>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <WhatsAppLink className="fixed bottom-5 right-5 z-40 h-14 w-14 sm:w-auto sm:px-5">
      <span className="sr-only sm:not-sr-only">Book on WhatsApp</span>
    </WhatsAppLink>
  );
}
