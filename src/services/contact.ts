import { supabase } from '../lib/supabase';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactError extends Error {}

export interface ContactService {
  isDemo: boolean;
  send(message: ContactMessage): Promise<void>;
}

const friendlyError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('too many')) return 'You have sent several messages in a short time. Please wait a few minutes and try again.';
  if (m.includes('check constraint') || m.includes('violates')) return 'Please check your details and try again.';
  return "We couldn't send your message. Please try again or email us directly.";
};

/** Saves messages to `contact_messages`; only admins can read them. Visitors can insert but not read back, so no `.select()`. */
const supabaseContact = (): ContactService => ({
  isDemo: false,
  async send(message) {
    const { error } = await supabase!.from('contact_messages').insert({
      name: message.name.trim(),
      email: message.email.trim(),
      subject: message.subject.trim(),
      message: message.message.trim(),
    });
    if (error) throw new ContactError(friendlyError(error.message));
  },
});

/** Used when Supabase isn't configured: validates only, nothing is sent. */
const demoContact: ContactService = {
  isDemo: true,
  async send(message) {
    void message;
    await new Promise((resolve) => setTimeout(resolve, 900));
  },
};

export const contactService: ContactService = supabase ? supabaseContact() : demoContact;
