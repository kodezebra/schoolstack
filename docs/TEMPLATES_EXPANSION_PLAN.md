# Comprehensive Template System Expansion Plan

## Overview
Expand the current template system from 3 basic templates to a comprehensive library of 20+ professional templates across multiple categories.

## Status: Phase 1 Complete ✅

**Completed:**
- 4 new block types (Pricing, Gallery, Services, ContactForm)
- 18 professional templates across 5 categories
- Template filtering by category in dashboard UI
- Server-side and dashboard editor components for all new blocks

**In Progress:**
- Fix remaining TypeScript errors in dashboard
- Add template thumbnail images

**Planned:**
- Template preview modal
- Template customization options
- Template bundles
- Import/export functionality
- User custom templates

---

## 1. Template Categories

### 🏢 Business (5 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `business-landing` | Business Landing | Professional landing page for companies | navbar, hero, features, stats, testimonials, cta, footer |
| `saas-product` | SaaS Product | Software product showcase | navbar, hero, features, pricing, faq, testimonials, cta, footer |
| `agency` | Creative Agency | Portfolio-focused agency page | navbar, hero, values, team, testimonials, cta, footer |
| `consulting` | Consulting Firm | Trust-building professional services | navbar, hero, services, values, team, contact, footer |
| `startup` | Tech Startup | Modern startup pitch page | navbar, hero, features, stats, roadmap, team, cta, footer |

### 👤 Portfolio & Personal (4 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `personal-portfolio` | Personal Portfolio | Creative individual showcase | navbar, hero, gallery, skills, projects, testimonials, contact, footer |
| `photographer` | Photography Portfolio | Visual-first portfolio | navbar, hero, video-gallery, about, contact, footer |
| `freelancer` | Freelancer Profile | Service-based freelancer page | navbar, hero, services, pricing, testimonials, contact, footer |
| `resume-cv` | Digital Resume | Professional CV/Resume | navbar, hero, experience, education, skills, contact, footer |

### 🛒 E-commerce & Products (4 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `product-launch` | Product Launch | Single product launch page | navbar, hero, features, gallery, pricing, testimonials, faq, cta, footer |
| `app-download` | App Download | Mobile app landing | navbar, hero, features, screenshots, stats, testimonials, download, footer |
| `digital-product` | Digital Product | eBook/Course sales page | navbar, hero, content, curriculum, pricing, testimonials, faq, cta, footer |
| `subscription` | Subscription Service | Recurring service landing | navbar, hero, features, pricing, comparison, faq, cta, footer |

### 📰 Content & Blog (3 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `blog-home` | Blog Homepage | Blog listing page | navbar, hero, blog-list, categories, newsletter, footer |
| `newsletter` | Newsletter Landing | Email subscription focus | navbar, hero, benefits, samples, testimonials, signup, footer |
| `documentation` | Documentation Hub | Product docs landing | navbar, hero, search, categories, quick-start, footer |

### 🏪 Local & Services (4 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `restaurant` | Restaurant | Food service business | navbar, hero, menu, gallery, testimonials, location, footer |
| `fitness` | Gym/Fitness | Fitness center landing | navbar, hero, classes, pricing, trainers, testimonials, location, footer |
| `real-estate` | Real Estate | Property showcase | navbar, hero, listings, features, agent, testimonials, contact, footer |
| `event` | Event Landing | Conference/Event page | navbar, hero, speakers, schedule, pricing, venue, faq, cta, footer |

### 🎨 Special Purpose (3 templates)
| ID | Name | Description | Blocks Used |
|----|------|-------------|-------------|
| `coming-soon` | Coming Soon | Pre-launch placeholder | navbar, hero, countdown, newsletter, social, footer |
| `404-custom` | Custom 404 | Branded error page | navbar, error-message, search, popular-links, footer |
| `thank-you` | Thank You | Post-action confirmation | navbar, confirmation, next-steps, social-share, footer |

---

## 2. New Block Types Required

### Priority 1 (Core)
| Block | Dashboard Component | Server Component | Content Schema |
|-------|---------------------|------------------|----------------|
| `pricing` | PricingBlock, PricingInspector | Pricing | tiers[], currency, billingCycle |
| `gallery` | GalleryBlock, GalleryInspector | Gallery | images[], layout, lightbox |
| `contact-form` | ContactFormBlock, ContactFormInspector | ContactForm | fields[], submitTo, successMessage |
| `services` | ServicesBlock, ServicesInspector | Services | items[] {icon, title, description, link} |

### Priority 2 (Extended)
| Block | Dashboard Component | Server Component | Content Schema |
|-------|---------------------|------------------|----------------|
| `blog-list` | BlogListBlock, BlogListInspector | BlogList | posts[], layout, pagination |
| `curriculum` | CurriculumBlock, CurriculumInspector | Curriculum | modules[] {title, lessons[]} |
| `roadmap` | RoadmapBlock, RoadmapInspector | Roadmap | phases[] {title, items[], status} |
| `countdown` | CountdownBlock, CountdownInspector | Countdown | targetDate, message |
| `location` | LocationBlock, LocationInspector | Location | address, map, hours, contact |

### Priority 3 (Nice-to-have)
| Block | Dashboard Component | Server Component | Content Schema |
|-------|---------------------|------------------|----------------|
| `comparison` | ComparisonBlock, ComparisonInspector | Comparison | plans[] {name, features[], recommended} |
| `download` | DownloadBlock, DownloadInspector | Download | platforms[], links, requirements |
| `menu` | MenuBlock, MenuInspector | Menu | categories[] {items[] {name, description, price}} |
| `schedule` | ScheduleBlock, ScheduleInspector | Schedule | days[] {time, session, speaker} |
| `experience` | ExperienceBlock, ExperienceInspector | Experience | items[] {role, company, duration, description} |
| `education` | EducationBlock, EducationInspector | Education | items[] {degree, institution, year} |
| `skills` | SkillsBlock, SkillsInspector | Skills | categories[] {skills[] {name, level}} |

---

## 3. Template Features Enhancement

### 3.1 Template Previews
- Full-page modal preview before selection
- Interactive block-by-block walkthrough
- Mobile/desktop responsive toggle

### 3.2 Template Filtering
```typescript
type TemplateCategory = 'business' | 'portfolio' | 'ecommerce' | 'blog' | 'local' | 'special';
type TemplateComplexity = 'simple' | 'medium' | 'complex';

interface TemplateFilter {
  category?: TemplateCategory;
  blocks?: string[]; // Filter by required blocks
  complexity?: TemplateComplexity;
  search?: string; // Text search
}
```

### 3.3 Template Bundles (Multi-Page)
```typescript
interface TemplateBundle {
  id: string;
  name: string;
  description: string;
  pages: {
    slug: string;
    templateId: string;
    title: string;
  }[];
}

// Example bundles:
// - "Complete Startup Website": Landing, About, Pricing, Blog, Contact
// - "Restaurant Pack": Home, Menu, About, Location, Events
// - "Portfolio Suite": Home, Projects, About, Contact
```

### 3.4 Template Customization at Selection
```typescript
interface TemplateCustomization {
  colors?: {
    primary: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  content?: Record<string, any>; // Pre-fill certain block content
}
```

### 3.5 Import/Export
- Export template as JSON
- Import custom templates
- Share templates via URL

### 3.6 User Custom Templates
- Save page configurations as templates
- Private templates per user
- Template versioning

---

## 4. Database Schema Updates

```typescript
// Add to schema.ts
export const userTemplates = sqliteTable('user_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  blocks: text('blocks').notNull(), // JSON array of blocks
  isPublic: text('is_public').notNull().default('false'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const templateBundles = sqliteTable('template_bundles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  pages: text('pages').notNull(), // JSON array of {slug, templateId, title}
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

---

## 5. API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/templates` | List all templates (with filters) |
| GET | `/api/templates/:id` | Get single template details |
| GET | `/api/templates/:id/preview` | Get full preview HTML |
| POST | `/api/templates` | Create custom template |
| PUT | `/api/templates/:id` | Update custom template |
| DELETE | `/api/templates/:id` | Delete custom template |
| GET | `/api/template-bundles` | List template bundles |
| POST | `/api/templates/import` | Import template JSON |
| POST | `/api/templates/export/:id` | Export template as JSON |

---

## 6. Dashboard UI Components

### New Components Needed
```
apps/dashboard/src/components/
├── cms-editor/
│   └── blocks/
│       ├── pricing/
│       ├── gallery/
│       ├── contact-form/
│       └── ... (all new blocks)
├── templates/
│   ├── TemplateLibrary.tsx      # Main template browser
│   ├── TemplateCard.tsx         # Individual template card
│   ├── TemplatePreview.tsx      # Full preview modal
│   ├── TemplateFilters.tsx      # Filter/search controls
│   ├── TemplateBundleCard.tsx   # Bundle display
│   ├── TemplateCustomizer.tsx   # Color/font picker
│   └── SavedTemplates.tsx       # User's saved templates
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Add new block types (Priority 1): pricing, gallery, contact-form, services
- [ ] Create 5 business templates
- [ ] Add template filtering UI
- [ ] Add template preview modal

### Phase 2: Expansion (Week 3-4)
- [ ] Add Priority 2 blocks
- [ ] Create 8 templates (portfolio, e-commerce, content)
- [ ] Implement template bundles
- [ ] Add customization options

### Phase 3: Advanced Features (Week 5-6)
- [ ] Add Priority 3 blocks
- [ ] Create remaining 7 templates
- [ ] Implement import/export
- [ ] Add user custom templates
- [ ] Add template thumbnails

### Phase 4: Polish (Week 7)
- [ ] Documentation
- [ ] Testing
- [ ] Performance optimization
- [ ] Accessibility review

---

## 8. Success Metrics

- [ ] 20+ professional templates available
- [ ] 15+ block types total
- [ ] Template selection time < 2 minutes
- [ ] User satisfaction score > 4.5/5
- [ ] 80%+ template-to-page conversion rate

---

## 9. Design Principles

1. **Professional Quality**: Every template must be production-ready
2. **Mobile-First**: All templates responsive by default
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Performance**: Lighthouse score > 90
5. **Customization**: Easy to personalize without code
6. **Consistency**: Shared design language across templates
