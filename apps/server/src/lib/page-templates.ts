import { Block } from '../db/schema'; // Assuming Block interface is exported from schema

// Define the structure of a page template
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string; // Optional URL for a preview image
  blocks: Omit<Block, 'id' | 'pageId' | 'createdAt'>[]; // Array of blocks without DB-managed fields
}

// --- Pre-defined Page Templates ---
export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A comprehensive landing page with a hero, features, testimonials, and a call-to-action.',
    thumbnail: '/placeholders/landing-page.png', // Placeholder thumbnail
    blocks: [
      {
        type: 'hero',
        content: JSON.stringify({
          title: 'Design Your Future with Precision',
          subtitle: 'Elevate your digital presence with our modern, professional solutions tailored for growth and impact.',
          primaryCta: { label: 'Get Started', href: '/contact' },
          secondaryCta: { label: 'Learn More', href: '/about' },
        }),
        order: 0,
      },
      {
        type: 'features',
        content: JSON.stringify({
          tagline: 'Our Expertise',
          title: 'Tailored Solutions for Your Success',
          subtitle: 'We provide high-quality services to help your business thrive in a digital-first world through innovation and design.',
          items: [
            { icon: 'zap', title: 'Speed', text: 'Optimized for performance.' },
            { icon: 'shield', title: 'Security', text: 'Robust protection for your data.' },
            { icon: 'brush', title: 'Design', text: 'Beautiful and intuitive interfaces.' },
          ],
        }),
        order: 1,
      },
      {
        type: 'testimonials',
        content: JSON.stringify({
          tagline: 'What Our Clients Say',
          title: 'Trusted by Industry Leaders',
          items: [
            { name: 'Jane Doe', role: 'CEO, TechCorp', text: 'This product is amazing!' },
            { name: 'John Smith', role: 'CTO, DevCo', text: 'Transformed our workflow.' },
          ],
        }),
        order: 2,
      },
      {
        type: 'cta',
        content: JSON.stringify({
          title: 'Ready to Revolutionize Your Digital Strategy?',
          subtitle: 'Join hundreds of forward-thinking companies already using our platform to drive growth and innovation.',
          ctaLabel: 'Start Your Journey Today',
          ctaHref: '/contact',
        }),
        order: 3,
      },
    ],
  },
  {
    id: 'about-us',
    name: 'About Us Page',
    description: 'Tell your company\'s story, mission, and introduce your team.',
    thumbnail: '/placeholders/about-us.png', // Placeholder thumbnail
    blocks: [
      {
        type: 'hero',
        content: JSON.stringify({
          title: 'Our Story & Mission',
          subtitle: 'Learn about our journey, values, and the dedicated team behind our success.',
          image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80',
        }),
        order: 0,
      },
      {
        type: 'content',
        content: JSON.stringify({
          title: 'Our Vision',
          text1: 'Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional.',
          text2: 'We dont just build products; we build partnerships. By understanding your unique challenges, we deliver solutions that are not only effective today but scalable for tomorrow.',
          features: ['Innovation', 'Collaboration', 'Integrity'],
        }),
        order: 1,
      },
      {
        type: 'team',
        content: JSON.stringify({
          tagline: 'Our Team',
          title: 'Meet the Minds Behind Our Success',
          subtitle: 'A diverse group of designers, developers, and strategists dedicated to excellence and innovation.',
          members: [
            { name: 'Jane Doe', role: 'CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=crop&w=150&q=80' },
            { name: 'John Smith', role: 'CTO', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
          ],
        }),
        order: 2,
      },
    ],
  },
  {
    id: 'contact-us',
    name: 'Contact Us Page',
    description: 'Provide an easy way for visitors to get in touch.',
    thumbnail: '/placeholders/contact-us.png', // Placeholder thumbnail
    blocks: [
      {
        type: 'hero',
        content: JSON.stringify({
          title: 'Get In Touch',
          subtitle: 'Wed love to hear from you! Reach out to us with any questions or inquiries.',
        }),
        order: 0,
      },
      // Assuming a 'ContactForm' block would exist here if implemented
      {
        type: 'content',
        content: JSON.stringify({
          title: 'Our Office',
          text1: '123 Main Street, Anytown, USA 12345',
          text2: 'Email: info@example.com | Phone: (123) 456-7890',
        }),
        order: 1,
      },
    ],
  },
];
