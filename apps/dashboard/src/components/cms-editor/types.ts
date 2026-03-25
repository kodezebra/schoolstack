// --- Base Types ---

export interface BlockStyles {
  paddingY?: number;
  background?: string;
  [key: string]: any;
}

export interface CommonBlockContent {
  styles?: BlockStyles;
  [key: string]: any;
}

// --- Specific Block Contents ---

export interface NavbarLink {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

export interface NavbarContent extends CommonBlockContent {
  logoText: string;
  logoIcon: string;
  logoType?: 'icon' | 'image';
  logoImage?: string;
  links: NavbarLink[];
  cta: { label: string; href: string };
}

export interface HeroContent extends CommonBlockContent {
  title: string;
  subtitle: string;
  image?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface FeaturesContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  items: Array<{ icon: string; title: string; text: string; bgClass?: string; iconClass?: string }>;
}

export interface ContentBlockContent extends CommonBlockContent {
  title: string;
  text1: string;
  text2: string;
  image?: string;
  featureIcon?: string;
  features: string[];
  cta: { label: string; href: string };
}

export interface StatsContent extends CommonBlockContent {
  items: Array<{ value: string; label: string }>;
}

export interface TeamContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  members: Array<{ name: string; role: string; image: string }>;
}

export interface TestimonialsContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  items: Array<{ name: string; role: string; text: string; image: string }>;
}

export interface CtaContent extends CommonBlockContent {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface StepsContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  items: Array<{ icon?: string; title: string; description: string; number?: number }>;
}

export interface ValuesContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  items: Array<{ icon: string; title: string; description: string }>;
}

export interface SplitContentContent extends CommonBlockContent {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  imagePosition: 'left' | 'right';
  cta: { label: string; href: string };
}

export type VideoPlatform = 'youtube' | 'tiktok'

export interface VideoItem {
  id: string
  platform: VideoPlatform
  videoId: string
  url: string
  embedUrl: string
  thumbnail: string
  title?: string
  embedAllowed: boolean
}

export interface VideoGalleryContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  items: VideoItem[];
}

export interface FaqContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  items: Array<{ question: string; answer: string }>;
}

export interface PricingContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  billingCycle?: 'monthly' | 'yearly';
  tiers: Array<{
    name: string;
    description: string;
    price: string;
    currency: string;
    period: string;
    features: string[];
    ctaLabel: string;
    ctaHref: string;
    recommended: boolean;
  }>;
}

export interface GalleryContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  layout: 'default' | 'grid' | 'masonry';
  images: Array<{ src: string; alt: string; caption?: string }>;
}

export interface ServicesContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  layout: 'grid' | 'list';
  items: Array<{ icon: string; title: string; description: string; link?: string; bgClass?: string; iconClass?: string }>;
}

export interface ContactFormContent extends CommonBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  submitLabel: string;
  submitTo?: string;
  successMessage?: string;
  contactInfo?: { address?: string; email?: string; phone?: string };
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea' | 'date';
    required: boolean;
    placeholder?: string;
    options?: string[];
    rows?: number;
  }>;
}

export interface MapContent extends CommonBlockContent {
  title?: string;
  latitude?: string;
  longitude?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  showDirections?: boolean;
  directionsLabel?: string;
}

export interface BannerContent extends CommonBlockContent {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  height?: 'small' | 'medium' | 'large';
  showBreadcrumb?: boolean;
  backgroundColor?: string;
  image?: string;
  textureImage?: string;
  offsetImage?: string;
  showOffsetImage?: boolean;
  overlayColor?: string;
  overlayHex?: string;
  showDivider?: boolean;
}

export interface FooterContent extends CommonBlockContent {
  logoText: string;
  logoIcon: string;
  description: string;
  columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  socials: Array<{ platform: string; url: string; icon: string }>;
}

export interface TextContent extends CommonBlockContent {
  text: string;
}

// --- Unified Types ---

export type BlockType =
  | 'hero' | 'features' | 'content' | 'stats'
  | 'team' | 'testimonials' | 'cta' | 'steps' | 'values'
  | 'splitContent' | 'videoGallery' | 'faq' | 'text'
  | 'pricing' | 'gallery' | 'services' | 'contact-form' | 'map'
  | 'banner';

export interface Block {
  id: string;
  type: BlockType;
  content:
    | HeroContent | FeaturesContent | ContentBlockContent
    | StatsContent | TeamContent | TestimonialsContent | CtaContent
    | StepsContent | ValuesContent | SplitContentContent | VideoGalleryContent
    | FaqContent | TextContent
    | PricingContent | GalleryContent | ServicesContent | ContactFormContent
    | MapContent | BannerContent;
}

export interface PageSettings {
  title: string;
  slug: string;
  description: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
}
