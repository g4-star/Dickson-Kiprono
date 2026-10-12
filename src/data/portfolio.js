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
        "A Flutter-based rental discovery mobile application focused on apartment search, unit-level availability and location-aware housing discovery in Kenya. The project explores mobile application development, backend integration and practical digital product design.",
      details:
        "JUMAA is a Flutter mobile application for finding rental homes and apartments. It connects a mobile interface with Supabase and PostgreSQL services, supports county, subcounty and area filtering, and models availability at the individual rental-unit level. The project involves mobile development, API and database integration, location-aware features, connectivity handling and Firebase notifications.",
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
        "A responsive React website presenting JUMAA, a rental discovery mobile app. It demonstrates frontend development, product communication, search engine optimization (SEO), responsive web design and clear pathways from a public product page to the mobile application.",
      details:
        "JUMAA Web is a separate marketing website, not the mobile application itself. Built with React and Vite, it introduces the product, explains its purpose and directs visitors toward the app. Its implementation covers responsive frontend components, page metadata, public product information and deployment through Vercel.",
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
        "A job-search automation project combining a Flutter dashboard and Python backend to organize job opportunities, assess candidate-role matches and track application workflows. It demonstrates workflow automation, structured data handling and backend API development.",
      details:
        "TrippieAutoAI combines a Flutter dashboard with a Python backend, FastAPI endpoints and SQLAlchemy data models. It explores job discovery, candidate-job match scoring, application tracking and configurable approval controls. The project demonstrates API design, database-backed workflows and responsible automation, with controls intended to keep application activity reviewable.",
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
