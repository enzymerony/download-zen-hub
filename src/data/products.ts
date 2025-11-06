import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    title: "Premium UI Kit Pro",
    description: "A comprehensive UI kit with 200+ components, designed for modern web applications. Includes light and dark modes, responsive layouts, and extensive documentation.",
    shortDescription: "Complete UI component library with 200+ elements",
    price: 79,
    originalPrice: 129,
    category: "UI Kits",
    tags: ["react", "typescript", "tailwind", "components"],
    rating: 4.9,
    reviewCount: 342,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    featured: true,
    badge: "bestseller",
    whatIncluded: [
      "200+ UI Components",
      "Light & Dark Modes",
      "Figma Source Files",
      "Documentation",
      "Free Updates",
      "Commercial License"
    ],
    features: [
      "Fully responsive design",
      "TypeScript support",
      "Customizable themes",
      "Accessible components",
      "Regular updates"
    ],
    compatibility: ["React 18+", "Next.js 13+", "Vite"],
    version: "2.1.0",
    lastUpdate: "2025-01-15",
    fileFormat: ["React", "TypeScript", "Figma"],
    requirements: ["Node.js 18+", "npm or yarn"]
  },
  {
    id: "2",
    title: "Dashboard Template X",
    description: "Modern admin dashboard template with analytics, user management, and beautiful charts. Perfect for SaaS applications and internal tools.",
    shortDescription: "Feature-rich admin dashboard for modern apps",
    price: 99,
    category: "Templates",
    tags: ["dashboard", "admin", "saas", "analytics"],
    rating: 4.8,
    reviewCount: 218,
    images: ["/placeholder.svg", "/placeholder.svg"],
    featured: true,
    badge: "new",
    whatIncluded: [
      "20+ Dashboard Pages",
      "Authentication System",
      "Chart Components",
      "User Management",
      "API Integration Examples",
      "Lifetime Updates"
    ],
    features: [
      "Real-time data updates",
      "Multiple chart types",
      "Role-based access",
      "Dark mode support",
      "Mobile responsive"
    ],
    compatibility: ["React 18+", "Next.js 14+"],
    version: "1.0.0",
    lastUpdate: "2025-01-20",
    fileFormat: ["React", "TypeScript", "Next.js"],
    requirements: ["Node.js 18+", "PostgreSQL"]
  },
  {
    id: "3",
    title: "Icon Pack Ultimate",
    description: "5000+ meticulously crafted icons in multiple styles. Available in SVG, React components, and icon font formats.",
    shortDescription: "5000+ premium icons in multiple formats",
    price: 49,
    originalPrice: 79,
    category: "Icons",
    tags: ["icons", "svg", "design", "ui"],
    rating: 4.7,
    reviewCount: 892,
    images: ["/placeholder.svg"],
    featured: false,
    badge: "sale",
    whatIncluded: [
      "5000+ Icons",
      "SVG Format",
      "React Components",
      "Icon Font",
      "Figma File",
      "Commercial License"
    ],
    features: [
      "Multiple styles",
      "Fully customizable",
      "Lightweight",
      "Regular additions",
      "Easy integration"
    ],
    compatibility: ["All frameworks", "Figma", "Adobe XD"],
    version: "3.2.1",
    lastUpdate: "2025-01-10",
    fileFormat: ["SVG", "React", "Font", "Figma"],
    requirements: ["None"]
  },
  {
    id: "4",
    title: "E-commerce Starter Kit",
    description: "Complete e-commerce solution with product management, shopping cart, checkout, and payment integration. Ready to customize and launch.",
    shortDescription: "Full-featured e-commerce platform starter",
    price: 149,
    category: "Templates",
    tags: ["ecommerce", "shop", "payments", "storefront"],
    rating: 4.9,
    reviewCount: 156,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    featured: true,
    whatIncluded: [
      "Product Catalog",
      "Shopping Cart",
      "Checkout System",
      "Payment Integration",
      "Admin Dashboard",
      "Email Templates"
    ],
    features: [
      "Stripe integration",
      "Inventory management",
      "Order tracking",
      "Customer accounts",
      "Mobile optimized"
    ],
    compatibility: ["Next.js 14+", "Supabase", "Stripe"],
    version: "1.5.0",
    lastUpdate: "2025-01-18",
    fileFormat: ["React", "TypeScript", "Next.js"],
    requirements: ["Node.js 18+", "Supabase account", "Stripe account"]
  },
  {
    id: "5",
    title: "Animation Library Pro",
    description: "Beautiful pre-built animations and transitions for web applications. Easy to implement with simple CSS classes or React components.",
    shortDescription: "Ready-to-use animations for modern websites",
    price: 39,
    category: "Utilities",
    tags: ["animations", "css", "transitions", "effects"],
    rating: 4.6,
    reviewCount: 423,
    images: ["/placeholder.svg"],
    featured: false,
    whatIncluded: [
      "100+ Animations",
      "CSS Classes",
      "React Components",
      "Documentation",
      "Code Examples",
      "Updates"
    ],
    features: [
      "Smooth transitions",
      "Performance optimized",
      "Customizable timing",
      "No dependencies",
      "Cross-browser"
    ],
    compatibility: ["All frameworks", "Vanilla JS", "React"],
    version: "2.0.3",
    lastUpdate: "2024-12-20",
    fileFormat: ["CSS", "React", "JavaScript"],
    requirements: ["None"]
  },
  {
    id: "6",
    title: "Landing Page Builder",
    description: "Create stunning landing pages in minutes with this flexible template system. Includes 15+ sections and multiple layout options.",
    shortDescription: "Flexible landing page template system",
    price: 69,
    category: "Templates",
    tags: ["landing", "marketing", "conversion", "pages"],
    rating: 4.8,
    reviewCount: 267,
    images: ["/placeholder.svg", "/placeholder.svg"],
    featured: true,
    badge: "bestseller",
    whatIncluded: [
      "15+ Sections",
      "5 Complete Pages",
      "Form Integration",
      "SEO Optimized",
      "Analytics Ready",
      "Documentation"
    ],
    features: [
      "Drag and drop ready",
      "Mobile responsive",
      "Fast loading",
      "A/B test ready",
      "Conversion focused"
    ],
    compatibility: ["React", "Next.js", "Gatsby"],
    version: "1.8.0",
    lastUpdate: "2025-01-12",
    fileFormat: ["React", "TypeScript"],
    requirements: ["Node.js 18+"]
  },
  {
    id: "7",
    title: "Design System Bundle",
    description: "Professional design system with typography, color palettes, spacing scales, and component patterns. Perfect for maintaining consistency.",
    shortDescription: "Complete design system for consistent branding",
    price: 89,
    category: "Design Systems",
    tags: ["design", "system", "branding", "consistency"],
    rating: 4.9,
    reviewCount: 189,
    images: ["/placeholder.svg"],
    featured: false,
    whatIncluded: [
      "Design Tokens",
      "Component Library",
      "Style Guide",
      "Figma File",
      "Documentation",
      "Code Examples"
    ],
    features: [
      "Theme customization",
      "Token-based system",
      "Scalable architecture",
      "Accessibility focused",
      "Well documented"
    ],
    compatibility: ["Any framework", "Figma", "Sketch"],
    version: "1.2.0",
    lastUpdate: "2025-01-05",
    fileFormat: ["Figma", "CSS", "JSON"],
    requirements: ["None"]
  },
  {
    id: "8",
    title: "Form Components Pro",
    description: "Advanced form components with validation, multi-step forms, and beautiful error handling. Includes integration with popular form libraries.",
    shortDescription: "Advanced form components with validation",
    price: 59,
    category: "Components",
    tags: ["forms", "validation", "inputs", "ui"],
    rating: 4.7,
    reviewCount: 334,
    images: ["/placeholder.svg", "/placeholder.svg"],
    featured: false,
    whatIncluded: [
      "30+ Form Components",
      "Validation Schemas",
      "Multi-step Forms",
      "File Uploads",
      "Date Pickers",
      "Documentation"
    ],
    features: [
      "React Hook Form ready",
      "Zod validation",
      "Accessible inputs",
      "Error handling",
      "Custom styling"
    ],
    compatibility: ["React 18+", "Next.js"],
    version: "2.3.1",
    lastUpdate: "2025-01-08",
    fileFormat: ["React", "TypeScript"],
    requirements: ["Node.js 16+"]
  }
];

export const categories = [
  { id: "all", name: "All Products", count: products.length },
  { id: "ui-kits", name: "UI Kits", count: products.filter(p => p.category === "UI Kits").length },
  { id: "templates", name: "Templates", count: products.filter(p => p.category === "Templates").length },
  { id: "icons", name: "Icons", count: products.filter(p => p.category === "Icons").length },
  { id: "components", name: "Components", count: products.filter(p => p.category === "Components").length },
  { id: "utilities", name: "Utilities", count: products.filter(p => p.category === "Utilities").length },
  { id: "design-systems", name: "Design Systems", count: products.filter(p => p.category === "Design Systems").length },
];
