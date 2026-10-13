export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Demo contact submission — nothing is sent. Connect this to a backend endpoint
 * (e.g. a Supabase Edge Function calling an email provider) before launch.
 */
export const contactService = {
  isDemo: true,
  async send(message: ContactMessage): Promise<void> {
    void message;
    await new Promise((resolve) => setTimeout(resolve, 900));
  },
};
