import { useEffect, useState } from "react";
import profileImage from "./assets/me.jpeg";
import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Globe,
  Layers3,
  LockKeyhole,
  Menu,
  Moon,
  Network,
  Server,
  ShieldCheck,
  Smartphone,
  Sun,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { portfolio } from "./data/portfolio";
import SecurityTeam from "./components/SecurityTeam";
import PrivateMainAdmin from "./components/PrivateMainAdmin";
import CertificationsEducation from "./components/CertificationsEducation";
import "./App.css";

const cyberDomains = [
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    text: "Security is the primary direction of my technical work. I focus on understanding how systems, networks and applications can be attacked, protected and monitored.",
    tags: ["Security Fundamentals", "Threat Awareness", "Defensive Thinking"],
  },
  {
    icon: Network,
    title: "Network Security",
    text: "I study network architecture, segmentation, traffic flows and security controls to understand how systems communicate and where security boundaries should exist.",
    tags: ["Networking", "Segmentation", "Zero Trust"],
  },
  {
    icon: Terminal,
    title: "Linux & Systems",
    text: "Linux is an important part of my security workflow. I use the command line to investigate systems, configure environments, automate tasks and work with security tooling.",
    tags: ["Linux", "Bash", "CLI"],
  },
  {
    icon: LockKeyhole,
    title: "Security Assessment",
    text: "I practice identifying weaknesses, understanding attack surfaces and documenting findings in a structured way through hands-on labs and technical exercises.",
    tags: ["Vulnerability Assessment", "Reconnaissance", "Hardening"],
  },
  {
    icon: Cpu,
    title: "Security Automation",
    text: "I use programming and automation to reduce repetitive work and build systems that can collect information, process data and support technical decision-making.",
    tags: ["Python", "Automation", "APIs"],
  },
  {
    icon: Server,
    title: "Security Operations",
    text: "My learning includes SOC concepts, monitoring, incident thinking, system logs and the processes used to identify and respond to suspicious activity.",
    tags: ["SOC", "Monitoring", "Incident Response"],
  },
];

const securityTools = [
  "Linux",
  "Bash",
  "Python",
  "Wireshark",
  "Nmap",
  "Git",
  "Docker",
  "PostgreSQL",
  "Supabase",
  "Firebase",
  "Cisco",
  "TryHackMe",
  "Hack The Box",
];

const learning = [
  {
    number: "01",
    title: "Moringa School",
    type: "Cybersecurity Training",
    text: "Structured cybersecurity training covering practical security concepts, technical labs, systems and security problem-solving.",
  },
  {
    number: "02",
    title: "TryHackMe",
    type: "Hands-on Practice",
    text: "Practical security exercises used to strengthen networking, Linux, reconnaissance, defensive and offensive security concepts.",
  },
  {
    number: "03",
    title: "Cisco",
    type: "Networking & Security",
    text: "Networking and cybersecurity learning focused on understanding infrastructure, communication and security fundamentals.",
  },
  {
    number: "04",
    title: "Hack The Box",
    type: "Security Labs",
    text: "Hands-on environments for developing practical security investigation and technical problem-solving skills.",
  },
];

const workflow = [
  ["01", "Understand", "Define the system, problem, environment and security objective before touching the technical implementation."],
  ["02", "Investigate", "Collect information, inspect the environment and identify relevant attack surfaces, weaknesses or constraints."],
  ["03", "Test", "Use controlled technical exercises and security tooling to validate assumptions and understand system behaviour."],
  ["04", "Document", "Record methodology, evidence, findings and lessons so the work can be reviewed and reproduced."],
  ["05", "Improve", "Use the findings to strengthen the system, improve the process or identify the next area that needs investigation."],
];

function SectionHeader({ eyebrow, title, text, number }) {
  return (
    <div className="section-header">
      <div className="section-index">
        <span>{number}</span>
        <i />
        <small>{eyebrow}</small>
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}


function SecurityMethod() {
  const stages = [
    {
      number: "01",
      title: "UNDERSTAND",
      short: "Establish the problem, scope and security context.",
      objective:
        "Before touching a system, I first establish what is being investigated, why it matters and what the expected outcome should be.",
      points: [
        "Define the objective and security question",
        "Identify systems, assets and boundaries",
        "Establish scope and constraints",
        "Understand requirements and assumptions",
        "Determine what evidence will be useful",
      ],
    },
    {
      number: "02",
      title: "INVESTIGATE",
      short: "Collect technical evidence and understand the environment.",
      objective:
        "I examine the available environment systematically, using technical evidence rather than assumptions to understand how systems, services, users and data interact.",
      points: [
        "Inspect systems, services and configurations",
        "Map relevant attack surfaces",
        "Review logs, outputs and available evidence",
        "Research technologies and security context",
        "Record observations as the investigation progresses",
      ],
    },
    {
      number: "03",
      title: "ANALYZE",
      short: "Turn technical observations into security findings.",
      objective:
        "Collected evidence is then correlated and evaluated to determine weaknesses, risks, likely impact and the conditions under which an issue could become significant.",
      points: [
        "Correlate technical evidence",
        "Identify weaknesses and misconfigurations",
        "Assess security impact and risk",
        "Separate confirmed findings from assumptions",
        "Prioritize issues based on technical significance",
      ],
    },
    {
      number: "04",
      title: "TEST",
      short: "Validate findings through controlled technical testing.",
      objective:
        "Where appropriate, I validate assumptions through controlled testing, security labs and technical experiments so that findings are supported by reproducible evidence.",
      points: [
        "Design controlled validation steps",
        "Reproduce security conditions safely",
        "Test configurations and security controls",
        "Compare expected and observed behavior",
        "Capture evidence from the validation process",
      ],
    },
    {
      number: "05",
      title: "DOCUMENT",
      short: "Produce clear evidence-backed technical reporting.",
      objective:
        "The final stage turns the technical work into documentation that another person can understand, review and use for remediation or future investigation.",
      points: [
        "Document methodology and scope",
        "Present evidence and key findings",
        "Explain technical impact clearly",
        "Record recommendations and remediation",
        "Capture lessons learned and next steps",
      ],
    },
  ];

  const [activeStage, setActiveStage] = useState(0);
  const active = stages[activeStage];

  return (
    <div className="security-method">
      <div className="method-stage-column">
        <div className="method-stage-line" />

        {stages.map((stage, index) => (
          <button
            className={`method-stage ${
              index === activeStage ? "active" : ""
            }`}
            key={stage.number}
            onClick={() => setActiveStage(index)}
            type="button"
            aria-label={`Open ${stage.title}`}
          >
            <span className="method-diamond">
              <span className="method-diamond-inner">
                {stage.number}
              </span>
            </span>

            <span className="method-stage-label">
              <small>STAGE {stage.number}</small>
              <strong>{stage.title}</strong>
            </span>
          </button>
        ))}
      </div>

      <div className="method-content">
        <div className="method-content-header">
          <div>
            <span className="method-content-index">
              STAGE {active.number} / 05
            </span>

            <h3>{active.title}</h3>

            <p className="method-short">
              {active.short}
            </p>
          </div>

          <div className="method-active">
            <span />
            ACTIVE
          </div>
        </div>

        <div className="method-divider" />

        <div className="method-objective">
          <span>OBJECTIVE</span>
          <p>{active.objective}</p>
        </div>

        <div className="method-details">
          <div className="method-detail-heading">
            <span>TECHNICAL APPROACH</span>
            <small>{active.number} / {active.title}</small>
          </div>

          <div className="method-points">
            {active.points.map((point, index) => (
              <div className="method-point" key={point}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="method-footer">
          <span>SECURITY WORKFLOW</span>
          <span>SELECT A STAGE TO CONTINUE</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("portfolio-theme");
    return saved !== "light";
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [labReports, setLabReports] = useState([]);
  const [privateAdminPage, setPrivateAdminPage] = useState(
    window.location.pathname === "/private-admin"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    let cancelled = false;

    async function loadLabReports() {
      try {
        const response = await fetch("/api/public-reports");

        if (!response.ok) {
          throw new Error("Unable to load lab reports.");
        }

        const data = await response.json();

        if (!cancelled) {
          setLabReports(
            Array.isArray(data.reports) ? data.reports : []
          );
        }
      } catch (error) {
        console.error("Public lab reports error:", error);

        if (!cancelled) {
          setLabReports([]);
        }
      }
    }

    loadLabReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = (id) => {
    setMenuOpen(false);

    if (id === "security-team" || id === "certifications") {
      setCurrentPage(id);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (currentPage !== "home") {
      setCurrentPage("home");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);

      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (privateAdminPage) {
    return (
      <PrivateMainAdmin
        onBack={() => {
          setPrivateAdminPage(false);
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    );
  }

  if (currentPage === "security-team") {
    return (
      <SecurityTeam
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    );
  }

  if (currentPage === "certifications") {
    return (
      <CertificationsEducation
        onBack={() => {
          setCurrentPage("home");
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    );
  }

  return (
    <div className="site-shell">
      <div className="noise" />

      <header className="navbar">
        <div className="nav-inner">
          <button className="brand" onClick={() => goTo("home")}>
            <span className="brand-mark brand-photo">
              <img
                src={profileImage}
                alt="Dickson Kiprono"
              />
            </span>
            <span className="brand-copy">
              <strong>DICKSON KIPRONO</strong>
              <small>CYBERSECURITY PORTFOLIO</small>
            </span>
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {[
              ["home", "Home"],
              ["about", "About"],
              ["cybersecurity", "Cybersecurity"],
              ["labs", "Lab Reports"],
              ["projects", "Projects"],
              ["skills", "Tools & Skills"],
              ["learning", "Learning"],
              ["services", "Services"],
              ["certifications", "Certifications & Education"],
              ["security-team", "Security Team"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => goTo(id)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={() => setDark((value) => !value)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Open navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section id="home" className="hero section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="status-line">
                <span className="status-dot" />
                AVAILABLE FOR CYBERSECURITY OPPORTUNITIES
              </div>

              <p className="hero-kicker">CYBERSECURITY PROFESSIONAL</p>

              <h1>
                Security.
                <br />
                <span>Systems.</span>
                <br />
                Technology.
              </h1>

              <p className="hero-description">
                I am <strong>Dickson Kiprono</strong>, a cybersecurity-focused
                technologist from Kenya. I investigate security problems,
                work with Linux and networking environments, build practical
                technical solutions and continuously develop my ability to
                understand and protect digital systems.
              </p>

              <div className="hero-actions">
                <button className="button primary" onClick={() => goTo("cybersecurity")}>
                  Explore Security Work
                  <ArrowUpRight size={17} />
                </button>

                <button className="button secondary" onClick={() => goTo("labs")}>
                  View Lab Reports
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="hero-meta">
                <span>BASED IN KENYA</span>
                <span>•</span>
                <a href={portfolio.social.github} target="_blank" rel="noreferrer">
                  GITHUB
                </a>
                <span>•</span>
                <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
                  LINKEDIN
                </a>
              </div>
            </div>

            <div className="hero-photo-card">
              <div className="hero-photo-frame">
                <img
                  src={profileImage}
                  alt="Dickson Kiprono — Cybersecurity Professional"
                />
                <div className="hero-photo-label">DICKSON KIPRONO / SECURITY</div>
              </div>

              <div className="hero-photo-meta">
                <span>BASED IN KENYA</span>
                <span>CYBERSECURITY PROFESSIONAL</span>
              </div>
            </div>

            <div className="terminal-card">
              <div className="terminal-top">
                <div className="terminal-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <small>trippie@parrot:~</small>
                <span className="terminal-lock">
                  <LockKeyhole size={13} />
                </span>
              </div>

              <div className="terminal-body">
                <p>
                  <span className="terminal-green">trippie@parrot</span>
                  <span>:</span>
                  <span className="terminal-blue">~</span>
                  <span>$ whoami</span>
                </p>
                <strong>cybersecurity-professional</strong>

                <p>
                  <span className="terminal-green">trippie@parrot</span>
                  <span>:</span>
                  <span className="terminal-blue">~</span>
                  <span>$ cat focus.txt</span>
                </p>

                <div className="terminal-list">
                  <span>→ cybersecurity</span>
                  <span>→ network security</span>
                  <span>→ Linux & systems</span>
                  <span>→ security labs</span>
                  <span>→ automation</span>
                  <span>→ continuous learning</span>
                </div>

                <p>
                  <span className="terminal-green">trippie@parrot</span>
                  <span>:</span>
                  <span className="terminal-blue">~</span>
                  <span>$ status</span>
                </p>

                <div className="terminal-status">
                  <span className="pulse" />
                  <span>learning · building · investigating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-bottom">
            <span>SCROLL TO INVESTIGATE ↓</span>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section about-section">
          <SectionHeader
            number="02"
            eyebrow="PROFILE"
            title="A cybersecurity-focused technical journey."
            text="My goal is to develop practical security capability through hands-on learning, technical investigation, documentation and real projects."
          />

          <div className="about-grid">
            <div className="about-main">
              <p className="large-copy">
                My goal is to develop practical cybersecurity capability through
                hands-on learning, technical investigation, security labs,
                documentation and real-world projects. I am building my career
                around understanding how digital systems operate, identifying
                where they can be exposed to risk, and applying security
                principles to make those systems more resilient.
              </p>

              <p>
                Cybersecurity is not only about protecting systems from attacks.
                It is about protecting the people, information, services and
                organizations that depend on those systems every day. It
                involves understanding threats, identifying vulnerabilities,
                reducing risk, securing networks and applications, protecting
                sensitive information, supporting reliable digital services,
                and helping organizations prepare for and respond to security
                incidents.
              </p>

              <p>
                I am particularly interested in the practical side of this
                work: understanding how attacks happen, investigating technical
                evidence, recognizing weaknesses and misconfigurations, working
                with Linux and networking environments, and continuously
                developing the skills required to detect, analyze and respond to
                security problems.
              </p>

              <p>
                I believe effective cybersecurity also has a wider
                responsibility. As more of everyday life moves online,
                protecting personal information, business data, digital
                infrastructure and online services contributes to a safer and
                more trustworthy internet for everyone. Security therefore has
                to be approached with both technical discipline and an
                understanding of the people and organizations being protected.
              </p>

              <p>
                My approach combines cybersecurity training with practical
                technical work. I work through hands-on security labs, study
                networking and security concepts, document technical
                investigations, and build practical solutions when programming
                can help solve a security or operational problem. I use
                technologies such as Linux, Python, Bash, networking tools,
                databases and application platforms as supporting capabilities
                for my cybersecurity work.
              </p>

              <p>
                Software development is therefore a supporting technical
                capability rather than the centre of my professional identity.
                My primary direction is <strong>cybersecurity</strong>, with
                development skills helping me understand applications, automate
                repetitive tasks, analyze systems and build useful tools around
                security problems.
              </p>

              <p className="about-highlight">
                <strong>
                  Cybersecurity is about protecting the people, information,
                  services and organizations that depend on digital systems.
                </strong>
              </p>
            </div>


          <aside className="about-aside">
              <div className="profile-terminal">
                <div className="profile-line">
                  <span>NAME</span>
                  <strong>Dickson Kiprono</strong>
                </div>
                <div className="profile-line">
                  <span>FIELD</span>
                  <strong>Cybersecurity</strong>
                </div>
                <div className="profile-line">
                  <span>LOCATION</span>
                  <strong>Kenya</strong>
                </div>
                <div className="profile-line">
                  <span>APPROACH</span>
                  <strong>Hands-on / Practical</strong>
                </div>
                <div className="profile-line">
                  <span>INTEREST</span>
                  <strong>Security & Systems</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="principles">
            <div>
              <span>01</span>
              <h3>Evidence over assumptions</h3>
              <p>
                I prefer to investigate systems and document what I actually
                observe rather than rely only on theory.
              </p>
            </div>
            <div>
              <span>02</span>
              <h3>Security through understanding</h3>
              <p>
                Understanding how a system operates makes it easier to reason
                about its attack surface and security controls.
              </p>
            </div>
            <div>
              <span>03</span>
              <h3>Keep learning</h3>
              <p>
                Cybersecurity changes continuously, so practical learning is
                part of the work rather than something that ends after a
                course.
              </p>
            </div>
          </div>
        </section>

        {/* CYBERSECURITY */}
        <section id="cybersecurity" className="section dark-section">
          <SectionHeader
            number="03"
            eyebrow="CORE DISCIPLINE"
            title="Cybersecurity is the centre of my work."
            text="These are the areas I am actively developing through coursework, labs, experimentation and technical projects."
          />

          <div className="security-grid">
            {cyberDomains.map((item) => {
              const Icon = item.icon;
              return (
                <article className="security-card" key={item.title}>
                  <div className="card-icon">
                    <Icon size={20} />
                  </div>
                  <span className="card-number">SECURITY DOMAIN</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="security-statement">
            <div>
              <span className="eyebrow">SECURITY MINDSET</span>
              <h3>
                Learn the system.
                <br />
                Understand the risk.
                <br />
                Improve the control.
              </h3>
            </div>
            <p>
              Whether the environment is a Linux machine, windows machine, a network, a
              database-backed application or an automated workflow, I approach
              technical problems by first understanding what exists, how it
              communicates and what could go wrong.
            </p>
          </div>
        </section>

        {/* LAB REPORTS */}
        <section id="labs" className="section labs-section">
          <SectionHeader
            number="04"
            eyebrow="TECHNICAL EVIDENCE"
            title="Cybersecurity Lab Reports"
            text="A growing archive of documented cybersecurity laboratories, assessments and practical security exercises."
          />

          {labReports.length > 0 ? (
            <div className="lab-reports-archive">
              {labReports.map((report, index) => (
                <article className="lab-report-card" key={report.id}>
                  <div className="lab-report-card-top">
                    <span className="lab-report-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="lab-status">
                      PUBLISHED
                    </span>
                  </div>

                  <div className="lab-report-card-body">
                    <span className="lab-report-category">
                      {report.category || "CYBERSECURITY LAB"}
                    </span>

                    <h3>{report.title}</h3>

                    <p>
                      {(report.description ||
                        report.objective ||
                        "Practical cybersecurity laboratory documented through a technical report.")
                        .replace(/\\s+/g, " ")
                        .trim()
                        .slice(0, 220)}
                      {(report.description || report.objective || "").length > 220
                        ? "..."
                        : ""}
                    </p>
                  </div>

                  <div className="lab-report-card-footer">
                    {report.file_url && (
                      <>
                        <a
                          className="lab-report-link primary"
                          href={report.file_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={14} />
                          View Report
                        </a>

                        <a
                          className="lab-report-link secondary"
                          href={report.file_url}
                          download={report.file_name || true}
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="lab-coming">
              <div className="lab-coming-title">
                <span>LAB ARCHIVE</span>
                <strong>
                  Technical reports will appear here when published.
                </strong>
              </div>

              <div className="archive-grid">
                <span>NETWORK SECURITY</span>
                <span>LINUX SECURITY</span>
                <span>DIGITAL FORENSICS</span>
                <span>SOC / BLUE TEAM</span>
                <span>ZERO TRUST</span>
                <span>OTHER LABS</span>
              </div>
            </div>
          )}
        </section>

        {/* PROJECTS */}
        <section id="projects" className="section projects-section">
          <SectionHeader
            number="05"
            eyebrow="PRACTICAL WORK"
            title="Projects that demonstrate technical problem-solving."
            text="Software projects appear here as evidence of practical engineering capability supporting my wider cybersecurity and technology work."
          />

          <div className="project-stack">
            {portfolio.projects.map((project, index) => (
              <article className="project-row" key={project.id}>
                <div className="project-number">{project.number}</div>

                <div className="project-main">
                  <div className="project-heading">
                    <span>{project.type}</span>
                    <h3>{project.name}</h3>
                  </div>

                  <p className="project-description">{project.description}</p>
                  <p className="project-details">{project.details}</p>

                  <div className="project-features">
                    {project.features?.map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </div>

                  <div className="project-tech">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>

                <div className="project-side">
                  <span>PROJECT {String(index + 1).padStart(2, "0")}</span>

                  {project.live && (
                    <a href={project.live} target="_blank" rel="noreferrer">
                      Live
                      <ArrowUpRight size={15} />
                    </a>
                  )}

                  {project.github && (
                    <a href={project.github} target="_blank" rel="noreferrer">
                      Source
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TOOLS */}
        <section id="skills" className="section tools-section">
          <SectionHeader
            number="06"
            eyebrow="TECHNICAL TOOLKIT"
            title="Tools I use to investigate, build and understand systems."
            text="The list combines cybersecurity tooling with the systems and programming technologies that support my security work."
          />

          <div className="tool-layout">
            <div className="tool-cloud">
              {securityTools.map((tool, index) => (
                <div className="tool-chip" key={tool}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {tool}
                </div>
              ))}
            </div>

            <div className="technology-groups">
              <div>
                <Network size={18} />
                <h3>Security & Networking</h3>
                <p>
                  Security concepts, network communication, segmentation,
                  reconnaissance, monitoring and defensive thinking.
                </p>
              </div>

              <div>
                <Terminal size={18} />
                <h3>Systems</h3>
                <p>
                  Linux, command-line workflows, Bash, system environments,
                  Docker and technical troubleshooting.
                </p>
              </div>

              <div>
                <Code2 size={18} />
                <h3>Programming</h3>
                <p>
                  Python and other development technologies used when
                  automation or software engineering supports a security task.
                </p>
              </div>

              <div>
                <Database size={18} />
                <h3>Data & Backend</h3>
                <p>
                  PostgreSQL, APIs, backend services and database architecture
                  used to understand and build connected systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LEARNING */}
        <section id="learning" className="section learning-section">
          <SectionHeader
            number="07"
            eyebrow="CONTINUOUS DEVELOPMENT"
            title="Learning is part of the security workflow."
            text="My cybersecurity knowledge is built through structured training and repeated hands-on practice."
          />

          <div className="learning-list">
            {learning.map((item) => (
              <article key={item.number} className="learning-row">
                <span className="learning-number">{item.number}</span>
                <div>
                  <span>{item.type}</span>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.text}</p>
                <ChevronRight size={19} />
              </article>
            ))}
          </div>

          <div className="learning-note">
            <Layers3 size={22} />
            <div>
              <strong>Current approach</strong>
              <p>
                I am building a portfolio around evidence: labs, reports,
                projects, technical notes and practical experiments rather
                than relying only on a list of technologies.
              </p>
            </div>
          </div>
        </section>

        {/* METHOD */}
        <section className="section workflow-section">
          <SectionHeader
            number="08"
            eyebrow="METHOD"
            title="How I approach technical security projects."
            text="I use a structured security workflow to move from understanding a problem to producing evidence-backed findings and clear technical documentation."
          />

          <SecurityMethod />

        </section>

        {/* DEVELOPMENT */}
        <section className="section development-section">
          <div className="supporting-label">SUPPORTING TECHNICAL CAPABILITY</div>

          <div className="development-grid">
            <div>
              <h2>
                I can also build
                <br />
                the technology I secure.
              </h2>
            </div>

            <div>
              <p>
                Software development is not the main label I use for myself,
                but it is an important technical advantage. Understanding how
                applications are designed helps me reason about application
                security, APIs, databases, authentication, data flows and
                automation.
              </p>

              <div className="dev-stack">
                <span><Smartphone size={15} /> Flutter / Dart</span>
                <span><Code2 size={15} /> React / JavaScript</span>
                <span><Terminal size={15} /> Python / Bash</span>
                <span><Database size={15} /> PostgreSQL</span>
                <span><Server size={15} /> FastAPI</span>
                <span><Globe size={15} /> APIs / Web</span>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section services-section">
          <SectionHeader
            number="09"
            eyebrow="WHAT I CAN HELP WITH"
            title="Technical services with a security mindset."
            text="My services are focused on practical technical assistance, security awareness and building technology that takes security seriously."
          />

          <div className="services-grid">
            <article>
              <span>01</span>
              <h3>Cybersecurity Support</h3>
              <p>
                Practical assistance with security concepts, system
                hardening, Linux environments, basic security assessment and
                technical security documentation.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Security Documentation</h3>
              <p>
                Clear technical documentation for labs, security exercises,
                system investigations, procedures and project security
                considerations.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Linux & Technical Support</h3>
              <p>
                Linux setup, troubleshooting, command-line workflows,
                development environments and technical configuration.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Security-Focused Development</h3>
              <p>
                Building small applications, dashboards and automation tools
                where software development supports a practical technical or
                security requirement.
              </p>
            </article>
          </div>
        </section>

        {/* CURRENT FOCUS */}
        <section className="section focus-section">
          <div className="focus-grid">
            <div>
              <span className="eyebrow">CURRENT FOCUS</span>
              <h2>Building deeper practical cybersecurity capability.</h2>
            </div>

            <div className="focus-list">
              <div>
                <strong>01</strong>
                <span>Security labs and technical reporting</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Linux, networking and infrastructure security</span>
              </div>
              <div>
                <strong>03</strong>
                <span>SOC and defensive security concepts</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Security automation with Python</span>
              </div>
              <div>
                <strong>05</strong>
                <span>Real-world security problem solving</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section contact-section">
          <SectionHeader
            number="10"
            eyebrow="CONTACT"
            title="Let's talk about cybersecurity, technology or opportunities."
            text="I am interested in cybersecurity internships, junior security roles, technical collaborations and opportunities where I can continue developing practical security capability."
          />

          <div className="contact-panel">
            <div>
              <span className="eyebrow">OPEN TO OPPORTUNITIES</span>
              <h3>Have a security problem or opportunity?</h3>
              <p>
                Reach out directly if you would like to discuss a cybersecurity
                opportunity, internship, technical collaboration, security
                project or another professional opportunity. I am especially
                interested in SOC and security operations, networking, Linux,
                security testing, technical investigations and security-focused
                technology.
              </p>

              <p>
                For professional opportunities, email is the best way to reach
                me. WhatsApp is also available for direct communication and
                initial discussions.
              </p>
            </div>

            <div className="contact-links">
              <a
                href="mailto:dicksonsang434@gmail.com"
                className="contact-link-primary"
              >
                Email Me
                <ArrowUpRight size={17} />
              </a>

              <a
                href="https://wa.link/6ajzh7"
                target="_blank"
                rel="noreferrer"
                className="contact-link-whatsapp"
              >
                WhatsApp
                <ArrowUpRight size={17} />
              </a>

              <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
                <ArrowUpRight size={17} />
              </a>

              <a href={portfolio.social.github} target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>DICKSON KIPRONO</strong>
          <span>CYBERSECURITY PROFESSIONAL</span>
        </div>

        <p>
          Security-first thinking · Practical learning · Continuous growth
        </p>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DICKSON KIPRONO</span>

          <a
            href="/private-admin"
            className="footer-admin-link"
          >
            ADMIN ACCESS
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
