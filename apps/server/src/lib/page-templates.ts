import { blocks } from '@/db/schema';

type Block = typeof blocks.$inferSelect;

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  blocks: Omit<Block, 'id' | 'pageId' | 'createdAt'>[];
}

// --- Pre-defined Page Templates ---
export const PAGE_TEMPLATES: PageTemplate[] = [
  // ==================== BUSINESS ====================
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A comprehensive landing page with hero, features, testimonials, and CTA.',
    category: 'business',
    thumbnail: '/placeholders/landing-page.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Design Your Future with Precision', subtitle: 'Elevate your digital presence with our modern, professional solutions.', primaryCta: { label: 'Get Started', href: '/contact' }, secondaryCta: { label: 'Learn More', href: '/about' } }), order: 0 },
      { type: 'features', content: JSON.stringify({ tagline: 'Our Expertise', title: 'Tailored Solutions for Your Success', subtitle: 'We provide high-quality services to help your business thrive.', items: [{ icon: 'zap', title: 'Speed', text: 'Optimized for performance.' }, { icon: 'shield', title: 'Security', text: 'Robust protection.' }, { icon: 'brush', title: 'Design', text: 'Beautiful interfaces.' }] }), order: 1 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'What Our Clients Say', title: 'Trusted by Industry Leaders', items: [{ name: 'Jane Doe', role: 'CEO, TechCorp', text: 'This product is amazing!' }, { name: 'John Smith', role: 'CTO, DevCo', text: 'Transformed our workflow.' }] }), order: 2 },
      { type: 'cta', content: JSON.stringify({ title: 'Ready to Revolutionize Your Digital Strategy?', subtitle: 'Join hundreds of forward-thinking companies.', ctaLabel: 'Start Your Journey Today', ctaHref: '/contact' }), order: 3 },
    ],
  },
  {
    id: 'saas-product',
    name: 'SaaS Product',
    description: 'Software product showcase with pricing and FAQ.',
    category: 'business',
    thumbnail: '/placeholders/saas-product.png',
    blocks: [
      { type: 'navbar', content: JSON.stringify({ logo: 'SaaS Co', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'FAQ', href: '#faq' }] }), order: 0 },
      { type: 'hero', content: JSON.stringify({ title: 'Build Better Software Faster', subtitle: 'The complete platform for modern development teams.', primaryCta: { label: 'Start Free Trial', href: '/signup' }, secondaryCta: { label: 'Watch Demo', href: '/demo' } }), order: 1 },
      { type: 'features', content: JSON.stringify({ tagline: 'Features', title: 'Everything You Need', items: [{ icon: 'code', title: 'Clean Code', text: 'Write maintainable code.' }, { icon: 'users', title: 'Collaboration', text: 'Work together seamlessly.' }, { icon: 'bar-chart', title: 'Analytics', text: 'Track your progress.' }] }), order: 2 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Pricing', title: 'Simple, Transparent Pricing', tiers: [{ name: 'Starter', price: '0', period: 'month', features: ['Up to 3 projects', 'Basic analytics', 'Community support'], ctaLabel: 'Get Started', ctaHref: '/signup', recommended: false }, { name: 'Pro', price: '29', period: 'month', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom integrations'], ctaLabel: 'Start Free Trial', ctaHref: '/signup', recommended: true }, { name: 'Enterprise', price: '99', period: 'month', features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom contracts'], ctaLabel: 'Contact Sales', ctaHref: '/contact', recommended: false }] }), order: 3 },
      { type: 'faq', content: JSON.stringify({ tagline: 'FAQ', title: 'Frequently Asked Questions', items: [{ question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial on all plans.' }, { question: 'Can I cancel anytime?', answer: 'Absolutely. You can cancel your subscription at any time.' }] }), order: 4 },
      { type: 'cta', content: JSON.stringify({ title: 'Ready to Get Started?', subtitle: 'Join thousands of developers building better software.', ctaLabel: 'Start Your Free Trial', ctaHref: '/signup' }), order: 5 },
    ],
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    description: 'Portfolio-focused agency page with team and values.',
    category: 'business',
    thumbnail: '/placeholders/agency.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'We Create Digital Experiences', subtitle: 'Award-winning creative agency specializing in brand identity and digital design.', primaryCta: { label: 'View Our Work', href: '/portfolio' } }), order: 0 },
      { type: 'values', content: JSON.stringify({ tagline: 'Our Values', title: 'What Drives Us', items: [{ icon: 'lightbulb', title: 'Innovation', text: 'Pushing boundaries.' }, { icon: 'heart', title: 'Passion', text: 'Love what we do.' }, { icon: 'handshake', title: 'Integrity', text: 'Honest partnerships.' }] }), order: 1 },
      { type: 'gallery', content: JSON.stringify({ tagline: 'Portfolio', title: 'Featured Work', layout: 'grid', images: [{ src: '/work1.jpg', alt: 'Project 1' }, { src: '/work2.jpg', alt: 'Project 2' }, { src: '/work3.jpg', alt: 'Project 3' }, { src: '/work4.jpg', alt: 'Project 4' }] }), order: 2 },
      { type: 'team', content: JSON.stringify({ tagline: 'Our Team', title: 'Meet the Creatives', members: [{ name: 'Alex Chen', role: 'Creative Director', image: '/alex.jpg' }, { name: 'Sarah Miller', role: 'Lead Designer', image: '/sarah.jpg' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Lets Work Together', subtitle: 'Tell us about your project.', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'message', label: 'Message', type: 'textarea', required: true }], submitLabel: 'Send Message' }), order: 4 },
    ],
  },
  {
    id: 'consulting',
    name: 'Consulting Firm',
    description: 'Trust-building professional services page.',
    category: 'business',
    thumbnail: '/placeholders/consulting.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Strategic Business Consulting', subtitle: 'Transform your business with expert guidance and proven strategies.', primaryCta: { label: 'Schedule Consultation', href: '/contact' } }), order: 0 },
      { type: 'services', content: JSON.stringify({ tagline: 'Services', title: 'How We Help', items: [{ icon: 'trending-up', title: 'Strategy', description: 'Develop winning strategies.' }, { icon: 'users', title: 'Leadership', description: 'Build strong teams.' }, { icon: 'pie-chart', title: 'Analytics', description: 'Data-driven insights.' }] }), order: 1 },
      { type: 'stats', content: JSON.stringify({ items: [{ value: '500+', label: 'Clients Served' }, { value: '95%', label: 'Success Rate' }, { value: '20+', label: 'Years Experience' }, { value: '$2B+', label: 'Value Created' }] }), order: 2 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Testimonials', title: 'Client Success Stories', items: [{ name: 'Michael Roberts', role: 'CEO, Fortune 500', text: 'Exceptional results.' }, { name: 'Emily Watson', role: 'Founder, Startup', text: 'Game-changing insights.' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Get In Touch', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'company', label: 'Company', type: 'text' }, { name: 'message', label: 'Message', type: 'textarea', required: true }], submitLabel: 'Request Consultation' }), order: 4 },
    ],
  },
  {
    id: 'startup',
    name: 'Tech Startup',
    description: 'Modern startup pitch page with roadmap.',
    category: 'business',
    thumbnail: '/placeholders/startup.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Revolutionizing the Future', subtitle: 'Building tomorrow technology today.', primaryCta: { label: 'Join Us', href: '/careers' } }), order: 0 },
      { type: 'features', content: JSON.stringify({ tagline: 'Technology', title: 'Our Innovation', items: [{ icon: 'cpu', title: 'AI-Powered', text: 'Machine learning at core.' }, { icon: 'globe', title: 'Global Scale', text: 'Built for worldwide use.' }] }), order: 1 },
      { type: 'steps', content: JSON.stringify({ tagline: 'Roadmap', title: 'Our Journey', steps: [{ number: '01', title: 'Q1 2024', description: 'Product launch' }, { number: '02', title: 'Q3 2024', description: 'Series A funding' }, { number: '03', title: 'Q1 2025', description: 'International expansion' }] }), order: 2 },
      { type: 'team', content: JSON.stringify({ tagline: 'Founders', title: 'Behind the Vision', members: [{ name: 'David Park', role: 'CEO & Co-founder', image: '/david.jpg' }, { name: 'Lisa Wang', role: 'CTO & Co-founder', image: '/lisa.jpg' }] }), order: 3 },
      { type: 'cta', content: JSON.stringify({ title: 'Join Our Mission', subtitle: 'Be part of the revolution.', ctaLabel: 'View Open Positions', ctaHref: '/careers' }), order: 4 },
    ],
  },

  // ==================== PORTFOLIO ====================
  {
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    description: 'Creative individual showcase with projects.',
    category: 'portfolio',
    thumbnail: '/placeholders/portfolio.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Hi, Im Alex', subtitle: 'Full-stack developer and designer crafting beautiful digital experiences.', primaryCta: { label: 'View My Work', href: '#projects' } }), order: 0 },
      { type: 'gallery', content: JSON.stringify({ tagline: 'Projects', title: 'Featured Work', layout: 'masonry', images: [{ src: '/project1.jpg', alt: 'Project 1', caption: 'E-commerce Platform' }, { src: '/project2.jpg', alt: 'Project 2', caption: 'Mobile App' }, { src: '/project3.jpg', alt: 'Project 3', caption: 'Brand Identity' }] }), order: 1 },
      { type: 'content', content: JSON.stringify({ title: 'Skills and Expertise', text1: 'Frontend: React, Vue, TypeScript', text2: 'Backend: Node.js, Python, Go', features: ['UI/UX Design', 'Full-stack Development', 'Cloud Architecture'] }), order: 2 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Recommendations', title: 'What People Say', items: [{ name: 'John Doe', role: 'Client', text: 'Exceptional work!' }, { name: 'Jane Smith', role: 'Manager', text: 'Highly skilled.' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Lets Work Together', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'message', label: 'Message', type: 'textarea', required: true }], submitLabel: 'Send Message' }), order: 4 },
    ],
  },
  {
    id: 'photographer',
    name: 'Photography Portfolio',
    description: 'Visual-first photography showcase.',
    category: 'portfolio',
    thumbnail: '/placeholders/photographer.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Capturing Moments', subtitle: 'Professional photography by Sarah Johnson', primaryCta: { label: 'View Gallery', href: '#gallery' } }), order: 0 },
      { type: 'video-gallery', content: JSON.stringify({ tagline: 'Portfolio', title: 'Latest Work', videos: [{ thumbnail: '/thumb1.jpg', title: 'Wedding Collection' }, { thumbnail: '/thumb2.jpg', title: 'Portrait Session' }] }), order: 1 },
      { type: 'content', content: JSON.stringify({ title: 'About Me', text1: 'I specialize in capturing authentic moments.', text2: 'With 10+ years of experience.' }), order: 2 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Booking', title: 'Reserve Your Session', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'date', label: 'Preferred Date', type: 'date' }, { name: 'message', label: 'Message', type: 'textarea' }], submitLabel: 'Request Booking' }), order: 3 },
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer Profile',
    description: 'Service-based freelancer page with pricing.',
    category: 'portfolio',
    thumbnail: '/placeholders/freelancer.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Freelance Developer', subtitle: 'Building websites that convert.', primaryCta: { label: 'Hire Me', href: '/contact' } }), order: 0 },
      { type: 'services', content: JSON.stringify({ tagline: 'Services', title: 'What I Offer', items: [{ icon: 'layout', title: 'Web Design', description: 'Modern, responsive designs.' }, { icon: 'code', title: 'Development', description: 'Clean, efficient code.' }, { icon: 'search', title: 'SEO', description: 'Rank higher on Google.' }] }), order: 1 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Pricing', title: 'Package Options', tiers: [{ name: 'Basic', price: '999', period: 'project', features: ['5 pages', 'Responsive design', 'Contact form'], ctaLabel: 'Choose Basic', ctaHref: '/contact', recommended: false }, { name: 'Standard', price: '1999', period: 'project', features: ['10 pages', 'CMS integration', 'SEO setup', 'Analytics'], ctaLabel: 'Choose Standard', ctaHref: '/contact', recommended: true }] }), order: 2 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Testimonials', title: 'Happy Clients', items: [{ name: 'Client A', role: 'Business Owner', text: 'Great experience!' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Start Your Project', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'budget', label: 'Budget', type: 'select', options: ['$1k-3k', '$3k-5k', '$5k+'] }, { name: 'message', label: 'Project Details', type: 'textarea', required: true }], submitLabel: 'Get Quote' }), order: 4 },
    ],
  },
  {
    id: 'resume-cv',
    name: 'Digital Resume',
    description: 'Professional CV/Resume page.',
    category: 'portfolio',
    thumbnail: '/placeholders/resume.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Michael Chen', subtitle: 'Senior Product Manager | 10+ Years Experience', primaryCta: { label: 'Download CV', href: '/cv.pdf' } }), order: 0 },
      { type: 'content', content: JSON.stringify({ title: 'Experience', text1: 'Led product teams at top tech companies.', text2: 'Specialized in B2B SaaS products.', features: ['Product Strategy', 'Team Leadership', 'Data Analysis'] }), order: 1 },
      { type: 'steps', content: JSON.stringify({ tagline: 'Career Path', title: 'Work History', steps: [{ number: '2020-', title: 'Senior PM, Tech Corp', description: 'Leading flagship product' }, { number: '2017-2020', title: 'PM, StartupXYZ', description: 'Grew user base 10x' }] }), order: 2 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Get In Touch', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'message', label: 'Message', type: 'textarea', required: true }], submitLabel: 'Send Message' }), order: 3 },
    ],
  },

  // ==================== E-COMMERCE ====================
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Single product launch page with gallery and pricing.',
    category: 'ecommerce',
    thumbnail: '/placeholders/product-launch.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Introducing Product X', subtitle: 'The future of productivity is here.', primaryCta: { label: 'Pre-order Now', href: '/preorder' } }), order: 0 },
      { type: 'features', content: JSON.stringify({ tagline: 'Features', title: 'Why You Will Love It', items: [{ icon: 'zap', title: 'Fast', text: 'Lightning quick.' }, { icon: 'shield', title: 'Secure', text: 'Bank-level security.' }] }), order: 1 },
      { type: 'gallery', content: JSON.stringify({ tagline: 'Gallery', title: 'Product Photos', layout: 'grid', images: [{ src: '/product1.jpg', alt: 'View 1' }, { src: '/product2.jpg', alt: 'View 2' }, { src: '/product3.jpg', alt: 'View 3' }, { src: '/product4.jpg', alt: 'View 4' }] }), order: 2 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Pricing', title: 'Early Bird Special', tiers: [{ name: 'Standard', price: '199', period: 'one-time', features: ['Product X', '1 year warranty', 'Free shipping'], ctaLabel: 'Pre-order', ctaHref: '/checkout', recommended: false }, { name: 'Pro Bundle', price: '299', period: 'one-time', features: ['Product X + Accessories', '2 year warranty', 'Priority shipping', 'Exclusive content'], ctaLabel: 'Pre-order Pro', ctaHref: '/checkout', recommended: true }] }), order: 3 },
      { type: 'faq', content: JSON.stringify({ tagline: 'FAQ', title: 'Common Questions', items: [{ question: 'When will it ship?', answer: 'Expected Q4 2024.' }, { question: 'Is there a warranty?', answer: 'Yes, 1 year standard.' }] }), order: 4 },
      { type: 'cta', content: JSON.stringify({ title: 'Do Not Miss Out', subtitle: 'Limited early bird pricing.', ctaLabel: 'Pre-order Now', ctaHref: '/preorder' }), order: 5 },
    ],
  },
  {
    id: 'app-download',
    name: 'App Download',
    description: 'Mobile app landing with screenshots.',
    category: 'ecommerce',
    thumbnail: '/placeholders/app-download.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'The App That Does It All', subtitle: 'Download now and simplify your life.', primaryCta: { label: 'Download on iOS', href: '/ios' }, secondaryCta: { label: 'Get on Android', href: '/android' } }), order: 0 },
      { type: 'features', content: JSON.stringify({ tagline: 'Features', title: 'What Makes Us Special', items: [{ icon: 'smartphone', title: 'Intuitive', text: 'Easy to use.' }, { icon: 'cloud', title: 'Synced', text: 'Always up to date.' }] }), order: 1 },
      { type: 'gallery', content: JSON.stringify({ tagline: 'Screenshots', title: 'See It In Action', layout: 'default', images: [{ src: '/screen1.png', alt: 'Screen 1' }, { src: '/screen2.png', alt: 'Screen 2' }, { src: '/screen3.png', alt: 'Screen 3' }] }), order: 2 },
      { type: 'stats', content: JSON.stringify({ items: [{ value: '1M+', label: 'Downloads' }, { value: '4.9', label: 'App Store Rating' }, { value: '50K+', label: 'Reviews' }] }), order: 3 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Reviews', title: 'What Users Say', items: [{ name: 'AppReviewer', role: 'Tech Blog', text: 'Best in class!' }] }), order: 4 },
      { type: 'cta', content: JSON.stringify({ title: 'Ready to Get Started?', subtitle: 'Free download, no credit card required.', ctaLabel: 'Download Free', ctaHref: '/download' }), order: 5 },
    ],
  },
  {
    id: 'digital-product',
    name: 'Digital Product',
    description: 'eBook/Course sales page.',
    category: 'ecommerce',
    thumbnail: '/placeholders/digital-product.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Master Web Development', subtitle: 'The complete course from zero to hero.', primaryCta: { label: 'Enroll Now', href: '/enroll' } }), order: 0 },
      { type: 'content', content: JSON.stringify({ title: 'What You Will Learn', text1: 'Full-stack development from scratch.', text2: 'Build real-world projects.', features: ['React and Node.js', 'Database Design', 'Deployment'] }), order: 1 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Pricing', title: 'Invest in Your Future', tiers: [{ name: 'Self-Paced', price: '99', period: 'one-time', features: ['All video lessons', 'Source code', 'Community access'], ctaLabel: 'Enroll Now', ctaHref: '/checkout', recommended: false }, { name: 'Mentored', price: '299', period: 'one-time', features: ['Everything in Self-Paced', '1-on-1 mentoring', 'Code reviews', 'Career guidance'], ctaLabel: 'Enroll Now', ctaHref: '/checkout', recommended: true }] }), order: 2 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Testimonials', title: 'Student Success', items: [{ name: 'Graduate A', role: 'Now at Google', text: 'Life-changing course!' }] }), order: 3 },
      { type: 'faq', content: JSON.stringify({ tagline: 'FAQ', title: 'Questions?', items: [{ question: 'How long do I have access?', answer: 'Lifetime access.' }, { question: 'Is there a refund policy?', answer: '30-day money-back guarantee.' }] }), order: 4 },
    ],
  },

  // ==================== LOCAL & SERVICES ====================
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Food service business with menu and gallery.',
    category: 'local',
    thumbnail: '/placeholders/restaurant.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'La Cucina Italiana', subtitle: 'Authentic Italian cuisine in the heart of the city.', primaryCta: { label: 'Reserve a Table', href: '/reserve' } }), order: 0 },
      { type: 'content', content: JSON.stringify({ title: 'Our Menu Highlights', text1: 'Fresh, seasonal ingredients.', text2: 'Traditional recipes.', features: ['Wood-fired Pizza', 'Handmade Pasta', 'Fresh Seafood'] }), order: 1 },
      { type: 'gallery', content: JSON.stringify({ tagline: 'Gallery', title: 'Our Dishes', layout: 'grid', images: [{ src: '/dish1.jpg', alt: 'Pasta' }, { src: '/dish2.jpg', alt: 'Pizza' }, { src: '/dish3.jpg', alt: 'Dessert' }, { src: '/dish4.jpg', alt: 'Interior' }] }), order: 2 },
      { type: 'testimonials', content: JSON.stringify({ tagline: 'Reviews', title: 'What Diners Say', items: [{ name: 'Food Critic', role: 'Local Magazine', text: 'Best Italian in town!' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Reservations', title: 'Book a Table', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'date', label: 'Date', type: 'date', required: true }, { name: 'guests', label: 'Guests', type: 'select', options: ['2', '3-4', '5-6', '7+'] }], submitLabel: 'Reserve' }), order: 4 },
    ],
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    description: 'Fitness center with classes and pricing.',
    category: 'local',
    thumbnail: '/placeholders/fitness.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Transform Your Body', subtitle: 'State-of-the-art facility, expert trainers.', primaryCta: { label: 'Join Now', href: '/join' } }), order: 0 },
      { type: 'services', content: JSON.stringify({ tagline: 'Classes', title: 'What We Offer', items: [{ icon: 'dumbbell', title: 'Weight Training', description: 'Free weights and machines.' }, { icon: 'heart', title: 'Cardio', description: 'Treadmills, bikes, more.' }, { icon: 'users', title: 'Group Classes', description: 'Yoga, HIIT, Spin.' }] }), order: 1 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Membership', title: 'Choose Your Plan', tiers: [{ name: 'Monthly', price: '49', period: 'month', features: ['Gym access', 'Locker room', 'Free WiFi'], ctaLabel: 'Join Now', ctaHref: '/join', recommended: false }, { name: 'Annual', price: '499', period: 'year', features: ['All Monthly benefits', '2 personal training sessions', 'Guest passes', 'Merchandise discount'], ctaLabel: 'Join Now', ctaHref: '/join', recommended: true }] }), order: 2 },
      { type: 'team', content: JSON.stringify({ tagline: 'Trainers', title: 'Meet Our Coaches', members: [{ name: 'Mike Johnson', role: 'Head Trainer', image: '/mike.jpg' }, { name: 'Anna Lee', role: 'Yoga Instructor', image: '/anna.jpg' }] }), order: 3 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Contact', title: 'Start Your Journey', fields: [{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'goal', label: 'Fitness Goal', type: 'select', options: ['Lose weight', 'Build muscle', 'General fitness'] }], submitLabel: 'Get Started' }), order: 4 },
    ],
  },
  {
    id: 'event',
    name: 'Event Landing',
    description: 'Conference/Event page with schedule.',
    category: 'local',
    thumbnail: '/placeholders/event.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'TechConf 2024', subtitle: 'The biggest tech event of the year. October 15-17, San Francisco.', primaryCta: { label: 'Get Tickets', href: '/tickets' } }), order: 0 },
      { type: 'steps', content: JSON.stringify({ tagline: 'Schedule', title: 'Event Timeline', steps: [{ number: 'Day 1', title: 'Keynotes', description: 'Industry leaders speak' }, { number: 'Day 2', title: 'Workshops', description: 'Hands-on sessions' }, { number: 'Day 3', title: 'Networking', description: 'Connect and collaborate' }] }), order: 1 },
      { type: 'team', content: JSON.stringify({ tagline: 'Speakers', title: 'Featured Speakers', members: [{ name: 'Dr. Sarah Chen', role: 'AI Researcher', image: '/sarah.jpg' }, { name: 'Mark Williams', role: 'VC Partner', image: '/mark.jpg' }] }), order: 2 },
      { type: 'pricing', content: JSON.stringify({ tagline: 'Tickets', title: 'Choose Your Pass', tiers: [{ name: 'Virtual', price: '99', period: 'event', features: ['Live streams', 'Chat access', 'Recording access'], ctaLabel: 'Buy Ticket', ctaHref: '/tickets', recommended: false }, { name: 'In-Person', price: '599', period: 'event', features: ['All sessions', 'Networking events', 'Meals included', 'Swag bag'], ctaLabel: 'Buy Ticket', ctaHref: '/tickets', recommended: true }] }), order: 3 },
      { type: 'faq', content: JSON.stringify({ tagline: 'FAQ', title: 'Need to Know', items: [{ question: 'Is there a refund policy?', answer: 'Full refund up to 30 days before event.' }, { question: 'Will recordings be available?', answer: 'Yes, for 30 days after event.' }] }), order: 4 },
    ],
  },

  // ==================== SPECIAL PURPOSE ====================
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Pre-launch placeholder with countdown.',
    category: 'special',
    thumbnail: '/placeholders/coming-soon.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Something Amazing Is Coming', subtitle: 'We are working hard to bring you something special. Stay tuned!', primaryCta: { label: 'Notify Me', href: '#newsletter' } }), order: 0 },
      { type: 'content', content: JSON.stringify({ title: 'What to Expect', text1: 'A revolutionary new product.', text2: 'Launching Q4 2024.', features: ['Innovative Design', 'Cutting-edge Technology', 'Unmatched Quality'] }), order: 1 },
      { type: 'contact-form', content: JSON.stringify({ tagline: 'Newsletter', title: 'Get Notified', subtitle: 'Be the first to know when we launch.', fields: [{ name: 'email', label: 'Email', type: 'email', required: true }], submitLabel: 'Subscribe', successMessage: 'Thanks for subscribing!' }), order: 2 },
    ],
  },
  {
    id: 'thank-you',
    name: 'Thank You Page',
    description: 'Post-action confirmation page.',
    category: 'special',
    thumbnail: '/placeholders/thank-you.png',
    blocks: [
      { type: 'hero', content: JSON.stringify({ title: 'Thank You!', subtitle: 'Your submission has been received. We will be in touch soon.', primaryCta: { label: 'Back to Home', href: '/' } }), order: 0 },
      { type: 'content', content: JSON.stringify({ title: 'What Is Next?', text1: 'We have sent a confirmation email.', text2: 'Expected response time: 24-48 hours.', features: ['Check your spam folder', 'Add us to contacts', 'Follow us on social'] }), order: 1 },
    ],
  },
];
