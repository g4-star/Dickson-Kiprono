export const portfolio = {
  name: "Dickson Kiprono",
  shortName: "Dickson",
  title: "Cybersecurity & Software Developer",
  tagline:
    "I build secure digital products, practical applications, and automation systems that solve real problems.",
  location: "Kenya",

  social: {
    github: "https://github.com/g4-star",
    linkedin: "https://linkedin.com/in/dickson-sang-265737386",
    portfolio: "https://dickson-kiprono-portfolio.vercel.app/",
    email: "",
  },

  stats: [
    { value: "03+", label: "Major Projects" },
    { value: "10+", label: "Technologies" },
    { value: "04+", label: "Learning Platforms" },
    { value: "∞", label: "Ideas to Build" },
  ],

  technologies: [
    "Flutter",
    "Dart",
    "React",
    "JavaScript",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Supabase",
    "Firebase",
    "Linux",
    "Docker",
    "Git",
    "Vercel",
    "Bash",
  ],

  projects: [
    {
      id: "jumaa",
      number: "01",
      name: "JUMAA",
      type: "Mobile Application",
      description:
        "A rental discovery and housing marketplace designed to make finding apartments more practical, localized, and accessible.",
      details:
        "JUMAA is a Flutter mobile application built around the idea of helping people discover available rental units at a more useful level of detail. Instead of treating housing as a generic property listing problem, the platform focuses on location-aware discovery and unit-level availability.",
      technologies: [
        "Flutter",
        "Dart",
        "Supabase",
        "PostgreSQL",
        "Firebase",
        "FCM",
        "Geolocator",
      ],
      features: [
        "Unit-level apartment discovery",
        "County, subcounty and area filtering",
        "Property and unit management",
        "Owner functionality",
        "Location-aware discovery",
        "Firebase notifications",
        "Supabase backend",
        "Dark mode",
        "Connectivity-aware experience",
      ],
      github: "https://github.com/g4-star/Jumaa-.git",
    },

    {
      id: "jumaa-web",
      number: "02",
      name: "JUMAA Web",
      type: "Marketing Website",
      description:
        "A dedicated public-facing website for introducing JUMAA, explaining the product and directing users toward the mobile application.",
      details:
        "JUMAA Web is intentionally separate from the JUMAA mobile application. It acts as the public marketing and information layer, providing a clear introduction to the product, its purpose, and the problem it is designed to address.",
      technologies: [
        "React",
        "Vite",
        "JavaScript",
        "CSS",
        "Vercel",
      ],
      features: [
        "Product introduction",
        "Marketing content",
        "SEO structure",
        "Responsive design",
        "Application call-to-actions",
        "Public product information",
      ],
      live: "https://jumaaweb.vercel.app/",
      github: "https://github.com/g4-star/Jumaa-web",
    },

    {
      id: "autoai",
      number: "03",
      name: "TrippieAutoAI",
      type: "Automation Platform",
      description:
        "A job-search automation system designed to organize opportunities, evaluate matches and manage application workflows.",
      details:
        "TrippieAutoAI combines a Flutter dashboard with a Python backend and database layer. The project explores how repetitive job-search workflows can be organized through structured data, matching logic and controlled automation without fabricating qualifications or bypassing security controls.",
      technologies: [
        "Flutter",
        "Python",
        "FastAPI",
        "SQLAlchemy",
        "PostgreSQL",
        "Vercel",
      ],
      features: [
        "Job opportunity management",
        "Candidate-job matching",
        "Match scoring",
        "Application tracking",
        "Approval workflows",
        "Daily application limits",
        "Settings management",
        "Structured backend API",
      ],
      live: "https://dickson-auto-ai.vercel.app/",
    },
  ],
};
