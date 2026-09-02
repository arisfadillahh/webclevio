export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface Branding {
  name: string;
  tagline: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  ctaLabel: string;
  ctaLink: string;
  socials: SocialLink[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Navigation {
  menu: NavItem[];
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
  highlight: string;
  badges: string[];
  stats: Stat[];
  media: {
    image: string;
    shape: string;
    videoUrl: string;
  };
  decorations: HeroDecoration[];
  primaryCta: CtaButton;
  secondaryCta: CtaButton;
}

export interface HeroDecoration {
  id: string;
  label: string;
  image: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  image: string;
  learningPoints: string[];
  projectExamples: string[];
  tools: string[];
  projectImage: string;
}

export interface ProgramSectionContent {
  tagline: string;
  title: string;
}

export interface FreeTrialSection {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  ctaLink: string;
  note: string;
  visualImage: string;
  availabilityTitle: string;
  availabilityText: string;
  availabilityBadge: string;
  trustTitle: string;
  trustText: string;
}

export interface InstructorsDecorations {
  loveShape: string;
  frameShape: string;
}

export interface ProgramDecorations {
  topShape: string;
  bottomShape: string;
  mask: string;
  mask2: string;
  pencil: string;
  compass: string;
}

export interface ActivitiesDecorations {
  pencil: string;
  giraffe: string;
  radius: string;
}

export interface Partner {
  id: string;
  logo: string;
}

export interface TestimonialsSectionContent {
  tagline: string;
  title: string;
  description: string;
}

export interface AboutSection {
  tagline: string;
  title: string;
  text: string;
  bullets: string[];
  stats: Stat[];
  ctaLabel?: string;
  ctaLink?: string;
  phone?: string;
  images: {
    primary: string;
    secondary: string;
  };
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface BenefitsSection {
  tagline: string;
  title: string;
  description: string;
  items: Array<FeatureItem & { icon: string }>;
}

export interface ActivitiesSection {
  tagline: string;
  title: string;
  description: string;
  image: string;
  items: ActivityItem[];
}

export interface ActivityItem extends FeatureItem {
  icon?: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
}

export interface GallerySection {
  tagline: string;
  title: string;
  items: GalleryItem[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  avatar: string;
  rating: number;
}

export interface EventItem {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  description: string;
  image: string;
  status: "published" | "draft";
  audience: string;
  landingPageUrl: string;
}

export interface EventsSection {
  tagline: string;
  title: string;
  description: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
  readingTime: string;
  status: "published" | "draft";
  body: string;
  gallery: string[];
  galleryMode: "carousel" | "grid";
}

export interface BlogSection {
  tagline: string;
  title: string;
  posts: BlogPost[];
}

export interface CallToAction {
  eyebrow: string;
  title: string;
  text: string;
  button: CtaButton;
  stats: Stat[];
  image: string;
}

export interface ContactInfo {
  whatsapp: string;
  email: string;
  address: string;
  hours: Array<{ days: string; time: string }>;
}

export interface FooterContent {
  text: string;
  quickLinks: NavItem[];
  categories: NavItem[];
  policies: NavItem[];
  blurb?: string;
  contacts?: FooterContact[];
  newsletter: {
    title: string;
    text: string;
  };
}

export interface FooterContact {
  label: string;
  value: string;
  href?: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface CtaButton {
  label: string;
  href: string;
}

export interface SiteContent {
  branding: Branding;
  navigation: Navigation;
  programsSection: ProgramSectionContent;
  freeTrial: FreeTrialSection;
  hero: HeroContent;
  programs: Program[];
  programDecorations: ProgramDecorations;
  instructorsDecorations: InstructorsDecorations;
  testimonialsSection: TestimonialsSectionContent;
  partners: Partner[];
  about: AboutSection;
  benefits: BenefitsSection;
  activities: ActivitiesSection;
  activitiesDecorations: ActivitiesDecorations;
  gallery: GallerySection;
  stats: Stat[];
  testimonials: Testimonial[];
  eventsSection: EventsSection;
  events: EventItem[];
  blog: BlogSection;
  callToAction: CallToAction;
  newsletter: NewsletterSection;
  instagram: InstagramItem[];
  instructors: Instructor[];
  contact: ContactInfo;
  footer: FooterContent;
}

export interface NewsletterSection {
  eyebrow: string;
  title: string;
  description?: string;
  buttonLabel: string;
}

export interface InstagramItem {
  id: string;
  image: string;
  link: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  socials: SocialLink[];
}
