import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import "./SecurityTeam.css";
import SecurityTeamAdmin from "./SecurityTeamAdmin";

export default function SecurityTeam({ onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [slide, setSlide] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  async function loadTeam() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/security-team", {
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load security team");
      }

      setMembers(Array.isArray(data.team) ? data.team : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "The security team could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  const slideshowImages = useMemo(() => {
    const images = [];

    members.forEach((member) => {
      if (member.profile_image_url) {
        images.push({
          url: member.profile_image_url,
          name: member.name,
          type: "profile",
        });
      }

      if (Array.isArray(member.images)) {
        member.images.forEach((image) => {
          if (image?.image_url) {
            images.push({
              url: image.image_url,
              name: member.name,
              type: "team",
            });
          }
        });
      }
    });

    return images;
  }, [members]);

  useEffect(() => {
    setSlide(0);
  }, [slideshowImages.length]);

  useEffect(() => {
    if (slideshowImages.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slideshowImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slideshowImages.length]);

  function previousSlide() {
    if (!slideshowImages.length) return;

    setSlide(
      (current) =>
        (current - 1 + slideshowImages.length) % slideshowImages.length
    );
  }

  function nextSlide() {
    if (!slideshowImages.length) return;

    setSlide((current) => (current + 1) % slideshowImages.length);
  }

  function openAdminLogin() {
    setAdminPassword("");
    setAdminError("");
    setShowAdminLogin(true);
  }

  async function loginToAdmin(event) {
    event.preventDefault();

    if (!adminPassword.trim()) {
      setAdminError("Enter the shared Security Team password.");
      return;
    }

    setAdminLoading(true);
    setAdminError("");

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Access denied");
      }

      setAdminPassword("");
      setShowAdminLogin(false);
      setShowAdminPanel(true);
    } catch (err) {
      setAdminError(err.message || "Access denied");
    } finally {
      setAdminLoading(false);
    }
  }

  function logoutAdmin() {
    setShowAdminPanel(false);
    setShowAdminLogin(false);
    setAdminPassword("");
    setAdminError("");
  }

  if (showAdminPanel) {
    return (
      <SecurityTeamAdmin
        initialAuthenticated={true}
        onLogout={logoutAdmin}
      />
    );
  }

  useEffect(() => {
    if (slideshowImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slideshowImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slideshowImages.length]);

  const heroSlides = [
    {
      label: "PEOPLE BEHIND THE WORK",
      title: "Security starts",
      accent: "with people.",
      description:
        "A growing network of people focused on cybersecurity, research, collaboration and practical security problem-solving.",
    },
    {
      label: "OFFENSIVE SECURITY",
      title: "Think like",
      accent: "an attacker.",
      description:
        "Understanding vulnerabilities, attack paths and weaknesses helps us build stronger defenses.",
    },
    {
      label: "DEFENSIVE SECURITY",
      title: "Build stronger",
      accent: "defenses.",
      description:
        "Detection, monitoring, hardening and incident-response thinking help turn security knowledge into resilience.",
    },
    {
      label: "CONTINUOUS LEARNING",
      title: "Stay ahead of",
      accent: "the threat.",
      description:
        "Cybersecurity changes constantly. Research, practical labs and continuous learning keep the team moving forward.",
    },
  ];

  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slideshowImages[slide];

  return (
    <main className="security-team-page">
      <header className="security-team-nav">
        <button
          type="button"
          className="security-team-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          <span>BACK TO PORTFOLIO</span>
        </button>

        <div className="security-team-brand">
          <strong>DK / SECURITY TEAM</strong>
          <span>CYBERSECURITY NETWORK</span>
        </div>

        <button
          type="button"
          className="security-team-access"
          onClick={openAdminLogin}
        >
          <LockKeyhole size={15} />
          TEAM ACCESS
        </button>
      </header>

      <section className="security-team-intro">
        <div className="security-team-intro-copy">
          <span className="security-team-label">SECURITY TEAM</span>

          <div className="security-team-hero-rotator">
            <span key={heroSlide} className="security-team-hero-rotating">
              {heroSlides[heroSlide].label}
            </span>

            <h1 key={`title-${heroSlide}`}>
              {heroSlides[heroSlide].title}
              <br />
              <em>{heroSlides[heroSlide].accent}</em>
            </h1>

            <p key={`text-${heroSlide}`} className="security-team-hero-rotating-copy">
              {heroSlides[heroSlide].description}
            </p>
          </div>

          <p>
            Meet the people contributing to cybersecurity learning, research,
            experimentation, collaboration and technical problem-solving.
            Together, we build knowledge, investigate security challenges and
            develop practical skills for protecting digital environments.
          </p>

          <div className="security-team-stat-row">
            <div>
              <strong>{String(members.length).padStart(2, "0")}</strong>
              <span>TEAM MEMBERS</span>
            </div>

            <div>
              <strong>{String(slideshowImages.length).padStart(2, "0")}</strong>
              <span>TEAM IMAGES</span>
            </div>

            <div>
              <strong>01</strong>
              <span>SECURITY NETWORK</span>
            </div>
          </div>
        </div>
      </section>

      <section className="security-team-people">
        <div className="security-team-people-heading">
          <span>PEOPLE BEHIND THE WORK</span>
          <h2>Built by people who take security seriously.</h2>
        </div>

        <div className="security-team-people-content">
          <p>
            The Security Team brings together cybersecurity professionals,
            security practitioners, researchers and technology enthusiasts
            with a shared commitment to protecting people, systems and digital
            environments. Our work is built around the understanding that
            effective cybersecurity is not the responsibility of a single
            person or a single discipline. Strong security comes from people
            who can investigate problems, understand vulnerabilities, analyze
            threats, strengthen defenses and continuously improve their
            knowledge.
          </p>

          <p>
            Our collective focus covers security operations, penetration
            testing, vulnerability assessment, digital investigations,
            defensive security, security awareness and incident-response
            thinking. Different members bring different strengths and
            perspectives, allowing the team to examine security challenges
            from multiple angles. Offensive security helps us understand how
            systems can be attacked, while defensive security helps us design
            better ways to detect, contain and prevent those attacks.
          </p>

          <p>
            Practical experience is at the center of the team's development.
            Through hands-on laboratories, controlled security assessments,
            technical experimentation, research and real-world problem
            solving, members continue developing the ability to identify
            weaknesses and understand the technologies behind them. The goal
            is not simply to learn security concepts, but to understand how
            those concepts apply when protecting real systems, applications,
            networks, organizations and people.
          </p>

          <p>
            Collaboration is equally important. Cybersecurity changes
            constantly, and no individual can know everything. Sharing
            knowledge, discussing findings, reviewing techniques and learning
            from mistakes allows every member to improve. A vulnerability
            discovered by one person can become a learning opportunity for
            the entire team, while a defensive technique developed by another
            member can strengthen the team's overall security awareness.
          </p>

          <p>
            Ethical responsibility is fundamental to the way we approach
            security work. Testing, research and experimentation should be
            performed with authorization and within responsible boundaries.
            We support ethical security testing, responsible disclosure,
            privacy-conscious research and security-first decision making.
            Technical ability should be used to identify risk, improve
            resilience and contribute to safer digital environments rather
            than create unnecessary harm.
          </p>

          <p>
            The team also maintains an incident-response mindset. Security is
            not only about preventing attacks; it is also about being prepared
            to recognize unusual activity, investigate what happened,
            understand the impact and respond effectively. Developing this
            mindset helps members think beyond individual tools and focus on
            the complete security lifecycle: preparation, detection,
            analysis, response, recovery and continuous improvement.
          </p>

          <p>
            Continuous learning is therefore part of the team's culture. New
            vulnerabilities, attack techniques, technologies and defensive
            methods appear every day. Members are encouraged to explore new
            tools, study security research, work through practical labs,
            document their findings and challenge their existing assumptions.
            Curiosity is treated as an important security skill because the
            ability to keep learning is essential in a rapidly changing
            technical environment.
          </p>

          <p>
            Together, the people featured on this page represent a growing
            security network focused on practical cybersecurity, technical
            collaboration and responsible innovation. Their specialties may
            differ, but the objective remains the same: understand security
            problems, develop better solutions, share knowledge and use
            cybersecurity skills to make digital environments more resilient.
          </p>
        </div>
      </section>

      <section className="security-team-showcase">
        <div className="security-team-showcase-heading">
          <span>SECURITY NETWORK / TEAM ARCHIVE</span>
          <h2>Inside the Security Team.</h2>
          <p>
            A visual look at the people, collaboration and technical work
            behind the network.
          </p>
        </div>

        <div className="security-team-slideshow">
          {activeSlide ? (
            <>
              <div className="security-team-slide">
                <img
                  key={activeSlide.url}
                  src={activeSlide.url}
                  alt={`${activeSlide.name} Security Team`}
                />

                <div className="security-team-slide-overlay" />

                <div className="security-team-slide-caption">
                  <span>SECURITY NETWORK / {activeSlide.type.toUpperCase()}</span>
                  <strong>{activeSlide.name || "Security Team"}</strong>
                </div>
              </div>

              {slideshowImages.length > 1 && (
                <>
                  <div className="security-team-slide-controls">
                    <button
                      type="button"
                      onClick={previousSlide}
                      aria-label="Previous team image"
                    >
                      <ArrowLeft size={17} />
                    </button>

                    <span>
                      {String(slide + 1).padStart(2, "0")} /{" "}
                      {String(slideshowImages.length).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next team image"
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>

                  <div className="security-team-slide-dots">
                    {slideshowImages.map((image, index) => (
                      <button
                        type="button"
                        key={`${image.url}-${index}`}
                        className={index === slide ? "active" : ""}
                        onClick={() => setSlide(index)}
                        aria-label={`Show team image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="security-team-slide-empty">
              <ImageIcon size={42} />
              <strong>No team images yet</strong>
              <span>
                Team images added through the authorized panel will appear
                here automatically.
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="security-team-members">
        <div className="security-team-section-heading">
          <div>
            <span>THE PEOPLE</span>
            <h2>Meet the Security Team.</h2>
          </div>

          <p>
            Explore the individual members of the network, their specialties,
            experience and the work they contribute to the cybersecurity
            community.
          </p>
        </div>

        {loading ? (
          <div className="security-team-state">
            <ShieldCheck size={27} />
            <span>Loading Security Team...</span>
          </div>
        ) : error ? (
          <div className="security-team-state error">
            <span>{error}</span>

            <button type="button" onClick={loadTeam}>
              Try Again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="security-team-state">
            <ShieldCheck size={27} />
            <span>The Security Team is being assembled.</span>
          </div>
        ) : (
          <div className="security-team-grid">
            {members.map((member) => (
              <article
                className="security-team-member-card"
                key={member.id}
              >
                <button
                  type="button"
                  className="security-team-member-open"
                  onClick={() => setSelectedMember(member)}
                  aria-label={`View ${member.name} profile`}
                >
                  <div className="security-team-member-photo">
                    {member.profile_image_url ? (
                      <img
                        src={member.profile_image_url}
                        alt={member.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="security-team-member-placeholder">
                        <ShieldCheck size={32} />
                      </div>
                    )}
                  </div>

                  <span className="security-team-member-index">
                    MEMBER / {String(member.id).padStart(2, "0")}
                  </span>

                  <h3>{member.name || "Security Team Member"}</h3>

                  <strong>
                    {member.role || "Cybersecurity Professional"}
                  </strong>

                  <p>
                    {member.description ||
                      "Member of the cybersecurity network contributing to technical learning and collaboration."}
                  </p>

                  <span className="security-team-view">
                    VIEW PROFILE
                    <ArrowUpRight size={15} />
                  </span>
                </button>

                <div className="security-team-links">
                  {member.github_url && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} GitHub`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      GH
                      GitHub
                    </a>
                  )}

                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      IN
                      LinkedIn
                    </a>
                  )}

                  {member.portfolio_url && (
                    <a
                      href={member.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} Portfolio`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ArrowUpRight size={15} />
                      Portfolio
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="security-team-cta">
        <div>
          <span>AUTHORIZED TEAM ACCESS</span>
          <h2>Team management is restricted.</h2>
          <p>
            Authorized Security Team members can add profiles, update
            information, manage images and maintain the network.
          </p>
        </div>

        <button type="button" onClick={openAdminLogin}>
          <LockKeyhole size={17} />
          ENTER TEAM ACCESS
        </button>
      </section>

      <footer className="security-team-footer">
        <button type="button" onClick={onBack}>
          <ArrowLeft size={16} />
          BACK TO PORTFOLIO
        </button>

        <span>DK / SECURITY NETWORK</span>
      </footer>

      {selectedMember && (
        <div
          className="security-team-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMember.name} profile`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMember(null);
            }
          }}
        >
          <div className="security-team-profile">
            <button
              type="button"
              className="security-team-modal-close"
              onClick={() => setSelectedMember(null)}
              aria-label="Close profile"
            >
              <X size={19} />
            </button>

            <div className="security-team-profile-header">
              <div className="security-team-profile-photo">
                {selectedMember.profile_image_url ? (
                  <img
                    src={selectedMember.profile_image_url}
                    alt={selectedMember.name}
                  />
                ) : (
                  <ShieldCheck size={38} />
                )}
              </div>

              <div>
                <span>SECURITY TEAM MEMBER</span>
                <h2>{selectedMember.name}</h2>
                <strong>{selectedMember.role}</strong>
              </div>
            </div>

            <div className="security-team-profile-body">
              <p>
                {selectedMember.description ||
                  "This member is part of the cybersecurity network."}
              </p>

              <div className="security-team-profile-links">
                {selectedMember.github_url && (
                  <a
                    href={selectedMember.github_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GH
                    GitHub
                    <ArrowUpRight size={14} />
                  </a>
                )}

                {selectedMember.linkedin_url && (
                  <a
                    href={selectedMember.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    IN
                    LinkedIn
                    <ArrowUpRight size={14} />
                  </a>
                )}

                {selectedMember.portfolio_url && (
                  <a
                    href={selectedMember.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowUpRight size={16} />
                    Portfolio
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>

              {Array.isArray(selectedMember.images) &&
                selectedMember.images.length > 0 && (
                  <div className="security-team-profile-gallery">
                    <div className="security-team-profile-gallery-heading">
                      <span>ADDITIONAL IMAGES</span>
                      <strong>
                        {selectedMember.images.length}{" "}
                        {selectedMember.images.length === 1
                          ? "IMAGE"
                          : "IMAGES"}
                      </strong>
                    </div>

                    <div className="security-team-profile-images">
                      {selectedMember.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.image_url}
                          alt={`${selectedMember.name} additional`}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div
          className="security-team-login-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Security Team authorization"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAdminLogin(false);
            }
          }}
        >
          <form
            className="security-team-login"
            onSubmit={loginToAdmin}
          >
            <button
              type="button"
              className="security-team-modal-close"
              onClick={() => setShowAdminLogin(false)}
              aria-label="Close authorization"
            >
              <X size={19} />
            </button>

            <div className="security-team-login-icon">
              <LockKeyhole size={24} />
            </div>

            <span>RESTRICTED AREA</span>

            <h2>Security Team Access</h2>

            <p>
              Enter the shared Security Team password to access the
              authorized management panel.
            </p>

            <label>
              Shared password
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => {
                  setAdminPassword(event.target.value);
                  setAdminError("");
                }}
                autoFocus
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </label>

            {adminError && (
              <div className="security-team-login-error">
                {adminError}
              </div>
            )}

            <button
              type="submit"
              className="security-team-login-submit"
              disabled={adminLoading}
            >
              {adminLoading ? "AUTHORIZING..." : "AUTHORIZE ACCESS"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
