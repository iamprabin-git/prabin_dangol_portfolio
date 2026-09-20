export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  tags: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  year: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProjectReview = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export type ReviewInput = {
  projectId: string;
  name: string;
  role: string;
  rating: number;
  body: string;
};

export type ProjectInput = {
  title: string;
  summary: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  year: string;
  imageUrl?: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  body: string;
};

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

export type SiteCopy = {
  brandTag: string;
  headerCta: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  workKicker: string;
  workHeading: string;
  workAllLink: string;
  aboutKicker: string;
  aboutHeading: string;
  contactKicker: string;
  contactHeading: string;
  projectsKicker: string;
  projectsHeading: string;
  projectsIntro: string;
  projectsEmpty: string;
  footerCta: string;
  footerSitemap: string;
  footerSocial: string;
  footerStatus: string;
  footerNote: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formSubmit: string;
  formSuccess: string;
  visitSite: string;
  caseStudy: string;
  sourceLabel: string;
  liveSite: string;
  moreWork: string;
  backToProjects: string;
  reviewsKicker: string;
  reviewsHeading: string;
  reviewsEmpty: string;
  reviewFormHeading: string;
  reviewFormName: string;
  reviewFormRole: string;
  reviewFormRating: string;
  reviewFormBody: string;
  reviewFormSubmit: string;
  reviewFormSuccess: string;
  whatsappLabel: string;
  whatsappGreeting: string;
  whatsappCta: string;
  timelineKicker: string;
  timelineHeading: string;
  timelineWeb: string;
  timelineDesign: string;
  timelineEmpty: string;
};

export type TimelineTrack = "web" | "design";

export type TimelineItem = {
  id: string;
  year: string;
  title: string;
  body: string;
  track: TimelineTrack;
};

export type WhatsAppSettings = {
  phone: string;
  message: string;
  enabled: boolean;
};

export type FontSizeScale = "sm" | "md" | "lg" | "xl";
export type RadiusScale = "sharp" | "soft" | "round";

export type ThemePalette = {
  bg: string;
  bgSoft: string;
  bgPanel: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
};

export type AppearanceSettings = {
  fontSize: FontSizeScale;
  fontSans: string;
  fontDisplay: string;
  fontMono: string;
  radius: RadiusScale;
  dark: ThemePalette;
  light: ThemePalette;
};

export type SiteContent = {
  name: string;
  shortName: string;
  role: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  availability: string;
  resumeUrl: string;
  photos: {
    portrait: string;
    workspace: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  socialLinks: SocialLink[];
  navigation: NavItem[];
  whatsapp: WhatsAppSettings;
  about: string[];
  services: ServiceItem[];
  skills: SkillGroup[];
  timeline: TimelineItem[];
  appearance: AppearanceSettings;
  copy: SiteCopy;
};
