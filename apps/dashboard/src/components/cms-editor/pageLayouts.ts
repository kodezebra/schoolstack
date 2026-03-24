export interface PageLayout {
  id: string
  name: string
  description: string
  category: 'homepage' | 'content' | 'utility' | 'blank'
  blocks: any[]
  preview?: {
    icon: string
    color: string
  }
}

export const PAGE_LAYOUTS: PageLayout[] = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with an empty canvas',
    category: 'blank',
    blocks: [],
    preview: { icon: 'file', color: 'from-slate-500 to-zinc-500' }
  },
  {
    id: 'homepage',
    name: 'Homepage',
    description: 'Hero + Features + Stats + CTA',
    category: 'homepage',
    blocks: [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        content: {
          title: 'Welcome to Our School',
          subtitle: 'Empowering students to achieve excellence through innovative education and nurturing environments.',
          badge: 'Now Enrolling',
          badgeIcon: 'sparkle',
          primaryCta: { label: 'Learn More', href: '/about' },
          secondaryCta: { label: 'Contact Us', href: '/contact' }
        }
      },
      {
        id: `features-${Date.now() + 1}`,
        type: 'features',
        content: {
          tagline: 'Why Choose Us',
          title: 'What Makes Us Different',
          subtitle: 'We provide a holistic approach to education that prepares students for the future.',
          items: [
            { icon: 'zap', title: 'Expert Teachers', text: 'Qualified educators dedicated to student success.' },
            { icon: 'heart', title: 'Caring Environment', text: 'Safe and supportive atmosphere for learning.' },
            { icon: 'star', title: 'Academic Excellence', text: 'Proven track record of outstanding results.' }
          ]
        }
      },
      {
        id: `stats-${Date.now() + 2}`,
        type: 'stats',
        content: {
          items: [
            { value: '500+', label: 'Students' },
            { value: '25+', label: 'Teachers' },
            { value: '98%', label: 'Pass Rate' },
            { value: '10+', label: 'Years Experience' }
          ]
        }
      },
      {
        id: `cta-${Date.now() + 3}`,
        type: 'cta',
        content: {
          title: 'Ready to Join Us?',
          subtitle: 'Enroll your child today and give them the gift of quality education.',
          ctaLabel: 'Start Enrollment'
        }
      }
    ],
    preview: { icon: 'home', color: 'from-blue-500 to-cyan-500' }
  },
  {
    id: 'about',
    name: 'About Page',
    description: 'Hero + Content + Values + Team',
    category: 'content',
    blocks: [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        content: {
          title: 'About Our School',
          subtitle: 'Building bright futures through dedication, innovation, and excellence in education.',
          primaryCta: { label: 'Our Programs', href: '#programs' },
          secondaryCta: { label: 'Contact Us', href: '/contact' }
        }
      },
      {
        id: `content-${Date.now() + 1}`,
        type: 'content',
        content: {
          title: 'Our Story',
          text1: 'Founded in 2010, our school has grown from a small nursery to a comprehensive educational institution serving students from nursery through high school.',
          text2: 'We believe in nurturing the whole child - academically, socially, and emotionally. Our approach combines traditional values with modern teaching methods.',
          features: ['Experienced Faculty', 'Modern Facilities', 'Individual Attention', 'Character Building'],
          cta: { label: 'Learn About Our History', href: '#history' }
        }
      },
      {
        id: `values-${Date.now() + 2}`,
        type: 'values',
        content: {
          tagline: 'Our Values',
          title: 'What We Stand For',
          subtitle: 'These core principles guide everything we do.',
          items: [
            { icon: 'star', title: 'Excellence', description: 'Striving for the highest standards in all we do.' },
            { icon: 'heart', title: 'Integrity', description: 'Building character through honest and ethical behavior.' },
            { icon: 'users', title: 'Community', description: 'Fostering a sense of belonging and teamwork.' },
            { icon: 'lightning', title: 'Innovation', description: 'Embracing new ideas and teaching methods.' }
          ]
        }
      },
      {
        id: `cta-${Date.now() + 3}`,
        type: 'cta',
        content: {
          title: 'Want to Learn More?',
          subtitle: 'Schedule a visit or contact us to learn about our programs.',
          ctaLabel: 'Get in Touch'
        }
      }
    ],
    preview: { icon: 'users', color: 'from-purple-500 to-pink-500' }
  },
  {
    id: 'contact',
    name: 'Contact Page',
    description: 'Hero + Split + Contact Form',
    category: 'utility',
    blocks: [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        content: {
          title: 'Get in Touch',
          subtitle: 'We\'d love to hear from you. Reach out with any questions or to schedule a visit.',
          primaryCta: { label: 'Call Us', href: 'tel:+256700000000' },
          secondaryCta: { label: 'Email Us', href: 'mailto:info@school.com' }
        }
      },
      {
        id: `split-${Date.now() + 1}`,
        type: 'splitContent',
        content: {
          eyebrow: 'Contact Information',
          title: 'Visit Our Campus',
          description: 'Come see our facilities and meet our dedicated staff. We welcome visitors by appointment.',
          imagePosition: 'right',
          cta: { label: 'Schedule a Visit', href: '#' }
        }
      },
      {
        id: `contact-${Date.now() + 2}`,
        type: 'contact-form',
        content: {
          tagline: 'Send Us a Message',
          title: 'Contact Form',
          submitLabel: 'Send Message',
          fields: [
            { name: 'name', label: 'Your Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'phone', label: 'Phone Number', type: 'text', required: false },
            { name: 'subject', label: 'Subject', type: 'text', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: true }
          ]
        }
      }
    ],
    preview: { icon: 'mail', color: 'from-green-500 to-emerald-500' }
  },
  {
    id: 'event',
    name: 'Event Page',
    description: 'Hero + Content + CTA',
    category: 'content',
    blocks: [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        content: {
          title: 'Upcoming Events',
          subtitle: 'Join us for exciting activities, workshops, and celebrations throughout the year.',
          badge: 'Save the Date',
          badgeIcon: 'calendar'
        }
      },
      {
        id: `content-${Date.now() + 1}`,
        type: 'content',
        content: {
          title: 'Our Events',
          text1: 'From academic competitions to cultural celebrations, our school calendar is packed with opportunities for students to learn, grow, and have fun.',
          text2: 'We encourage all parents and guardians to participate in our school events - it\'s a great way to be part of our community.',
          features: ['Parent Workshops', 'Sports Day', 'Cultural Day', 'Graduation Ceremony'],
          cta: { label: 'View Full Calendar', href: '#' }
        }
      },
      {
        id: `cta-${Date.now() + 2}`,
        type: 'cta',
        content: {
          title: 'Want to Stay Updated?',
          subtitle: 'Subscribe to our newsletter for event notifications and school news.',
          ctaLabel: 'Subscribe Now'
        }
      }
    ],
    preview: { icon: 'calendar', color: 'from-orange-500 to-amber-500' }
  }
]

export function getLayoutById(id: string): PageLayout | undefined {
  return PAGE_LAYOUTS.find(layout => layout.id === id)
}
