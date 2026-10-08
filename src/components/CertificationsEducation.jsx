import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import "./CertificationsEducation.css";

const education = [
  {
    number: "01",
    institution: "MORINGA SCHOOL",
    title: "Cybersecurity Training",
    type: "Professional Training",
    description:
      "Structured cybersecurity training focused on practical security concepts, Linux and systems, networking, security operations, vulnerability assessment, digital security and hands-on technical problem solving.",
    highlights: [
      "Cybersecurity fundamentals",
      "Network and system security",
      "Linux and security tooling",
      "Security operations concepts",
      "Practical security laboratories",
      "Technical investigation and reporting",
    ],
  },
];

const learningPlatforms = [
  {
    name: "TryHackMe",
    type: "HANDS-ON SECURITY LABS",
    description:
      "Practical cybersecurity rooms and guided exercises used to strengthen networking, Linux, reconnaissance, defensive security and offensive security knowledge.",
  },
  {
    name: "Hack The Box",
    type: "PRACTICAL SECURITY ENVIRONMENT",
    description:
      "Hands-on environments used to develop technical investigation, enumeration, vulnerability identification and security problem-solving skills.",
  },
  {
    name: "Cisco",
    type: "NETWORKING & SECURITY",
    description:
      "Networking and cybersecurity learning that supports a deeper understanding of infrastructure, communication, protocols and security controls.",
  },
];

const developmentAreas = [
  "Security Operations",
  "Penetration Testing",
  "Vulnerability Assessment",
  "Network Security",
  "Linux & Systems",
  "Digital Investigation",
  "Security Automation",
  "Incident Response",
];

export default function CertificationsEducation({ onBack }) {
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCredentials() {
      try {
        setCredentialsLoading(true);
        setCredentialsError("");

        const response = await fetch("/api/public-certificates");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load credentials."
          );
        }

        if (!active) return;

        setCertifications(
          Array.isArray(data.certifications)
            ? data.certifications
            : []
        );

        setAchievements(
          Array.isArray(data.achievements)
            ? data.achievements
            : []
        );
      } catch (error) {
        console.error("Credential loading error:", error);

        if (active) {
          setCredentialsError(
            "Unable to load certifications and achievements."
          );
        }
      } finally {
        if (active) {
          setCredentialsLoading(false);
        }
      }
    }

    loadCredentials();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ce-page">
      <header className="ce-header">
        <button type="button" onClick={onBack} className="ce-back">
          <ArrowLeft size={16} />
          BACK TO PORTFOLIO
        </button>

        <span>DK / EDUCATION & CERTIFICATIONS</span>
      </header>

      <main>
        <section className="ce-hero">
          <div className="ce-hero-main">
            <span className="ce-eyebrow">CERTIFICATIONS / EDUCATION</span>

            <h1>
              The foundation
              <br />
              <em>behind the work.</em>
            </h1>

            <p>
              A record of the education, professional training, certifications,
              practical laboratories and continuous learning that shape my
              cybersecurity work.
            </p>
          </div>

          <div className="ce-hero-side">
            <div>
              <strong>
                {String(education.length).padStart(2, "0")}
              </strong>
              <span>EDUCATION</span>
            </div>

            <div>
              <strong>
                {credentialsLoading
                  ? "--"
                  : String(certifications.length).padStart(2, "0")}
              </strong>
              <span>CERTIFICATIONS</span>
            </div>

            <div>
              <strong>
                {credentialsLoading
                  ? "--"
                  : String(achievements.length).padStart(2, "0")}
              </strong>
              <span>ACHIEVEMENTS</span>
            </div>

            <div>
              <strong>
                {String(learningPlatforms.length).padStart(2, "0")}+
              </strong>
              <span>LEARNING PLATFORMS</span>
            </div>
          </div>
        </section>

        <section className="ce-section">
          <div className="ce-section-heading">
            <span>01 / EDUCATION</span>
            <h2>Academic & professional foundation.</h2>
          </div>

          <div className="ce-education-grid">
            {education.map((item) => (
              <article className="ce-education-card" key={item.number}>
                <div className="ce-card-number">{item.number}</div>

                <div className="ce-card-icon">
                  <GraduationCap size={22} />
                </div>

                <span className="ce-card-label">{item.institution}</span>

                <h3>{item.title}</h3>

                <strong className="ce-card-type">{item.type}</strong>

                <p>{item.description}</p>

                <div className="ce-highlight-list">
                  {item.highlights.map((highlight) => (
                    <div key={highlight}>
                      <CheckCircle2 size={15} />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ce-section ce-certifications">
          <div className="ce-section-heading">
            <span>02 / CERTIFICATIONS</span>
            <h2>Credentials and verified learning.</h2>
          </div>

          {credentialsLoading ? (
            <div className="ce-empty-state">
              LOADING VERIFIED CREDENTIALS...
            </div>
          ) : credentialsError ? (
            <div className="ce-empty-state">
              {credentialsError}
            </div>
          ) : certifications.length === 0 ? (
            <div className="ce-empty-state">
              NO PUBLISHED CERTIFICATIONS YET.
            </div>
          ) : (
            <div className="ce-cert-grid">
              {certifications.map((item, index) => (
                <article
                  className="ce-cert-card"
                  key={item.id}
                >
                  <div className="ce-cert-top">
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Award size={22} />
                  </div>

                  {item.issuer && (
                    <span className="ce-card-label">
                      {item.issuer}
                    </span>
                  )}

                  <h3>{item.title}</h3>

                  {item.category && (
                    <strong>{item.category}</strong>
                  )}

                  {item.description && (
                    <p>{item.description}</p>
                  )}

                  {item.file_url && (
                    <div className="ce-credential-actions">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        VIEW CREDENTIAL
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="ce-section ce-capability">
          <div className="ce-section-heading">
            <span>04 / CAPABILITY OVER CREDENTIALS</span>
            <h2>What you can do matters.</h2>
            <p>
              Formal education can provide a strong foundation, but cybersecurity
              is ultimately a field where knowledge has to translate into
              practical capability.
            </p>
          </div>

          <div className="ce-capability-layout">
            <div className="ce-capability-lead">
              <span>THE PRINCIPLE</span>
              <h3>
                Skills are demonstrated,
                <br />
                <em>not simply declared.</em>
              </h3>
            </div>

            <div className="ce-capability-copy">
              <p>
                My cybersecurity journey has been built through focused
                professional training, certifications, practical laboratories,
                technical research and continuous hands-on learning.
              </p>

              <p>
                My formal academic path may not follow the traditional degree
                route, but that does not define the limits of what I can learn,
                investigate or accomplish. I have deliberately invested in
                cybersecurity education that develops practical understanding
                rather than relying only on academic titles.
              </p>

              <p>
                Through certifications, security labs, Capture The Flag
                challenges, technical projects and independent research, I
                continue to develop the ability to analyze systems, understand
                vulnerabilities, investigate security problems and think
                defensively.
              </p>

              <p>
                I believe credentials are valuable because they represent
                completed learning and verified effort. But credentials become
                meaningful when they are supported by practical knowledge,
                curiosity, discipline and the ability to apply what has been
                learned.
              </p>

              <p>
                That is the standard I hold myself to: keep learning, keep
                practicing, keep building and keep improving. My goal is not
                simply to collect certificates. It is to turn every course,
                laboratory and challenge into capability that can be applied to
                real security problems.
              </p>
            </div>
          </div>

          <div className="ce-capability-grid">
            <article>
              <span>01</span>
              <h3>Continuous Learning</h3>
              <p>
                Cybersecurity changes constantly. I treat learning as an
                ongoing process rather than something that ends with a
                certificate.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Practical Application</h3>
              <p>
                I focus on turning concepts into hands-on experience through
                security laboratories, projects, challenges and technical
                experimentation.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Proof Through Work</h3>
              <p>
                My certifications, lab reports, projects and security work
                provide tangible evidence of the areas I have studied and the
                skills I continue to develop.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Growth Mindset</h3>
              <p>
                I do not consider my current level a final destination. Every
                vulnerability, failed attempt and new technology is another
                opportunity to become better.
              </p>
            </article>
          </div>

          <div className="ce-capability-statement">
            <strong>
              I don't rely on a title to define my ability.
            </strong>
            <p>
              I rely on continuous learning, practical work, discipline,
              problem solving and measurable results.
            </p>
          </div>
        </section>

        <section className="ce-section ce-achievements">
          <div className="ce-section-heading">
            <span>05 / ACHIEVEMENTS</span>
            <h2>Milestones beyond certification.</h2>
            <p>
              Professional milestones, recognitions and other verified
              achievements that contribute to my cybersecurity journey.
            </p>
          </div>

          {credentialsLoading ? (
            <div className="ce-empty-state">
              LOADING VERIFIED ACHIEVEMENTS...
            </div>
          ) : credentialsError ? (
            <div className="ce-empty-state">
              {credentialsError}
            </div>
          ) : achievements.length === 0 ? (
            <div className="ce-empty-state">
              NO PUBLISHED ACHIEVEMENTS YET.
            </div>
          ) : (
            <div className="ce-cert-grid">
              {achievements.map((item, index) => (
                <article
                  className="ce-cert-card"
                  key={item.id}
                >
                  <div className="ce-cert-top">
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Award size={22} />
                  </div>

                  {item.issuer && (
                    <span className="ce-card-label">
                      {item.issuer}
                    </span>
                  )}

                  <h3>{item.title}</h3>

                  {item.category && (
                    <strong>{item.category}</strong>
                  )}

                  {item.description && (
                    <p>{item.description}</p>
                  )}

                  {item.file_url && (
                    <div className="ce-credential-actions">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        VIEW CREDENTIAL
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="ce-section ce-learning">
          <div className="ce-section-heading">
            <span>06 / CONTINUOUS LEARNING</span>
            <h2>Learning does not stop at certification.</h2>
            <p>
              Cybersecurity changes continuously. Practical laboratories,
              technical research and repeated experimentation are an important
              part of keeping security knowledge current.
            </p>
          </div>

          <div className="ce-platform-grid">
            {learningPlatforms.map((platform, index) => (
              <article className="ce-platform-card" key={platform.name}>
                <div className="ce-platform-index">
                  0{index + 1}
                </div>

                <Terminal size={20} />

                <span>{platform.type}</span>

                <h3>{platform.name}</h3>

                <p>{platform.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ce-section ce-development">
          <div className="ce-development-copy">
            <span>07 / CURRENT DEVELOPMENT</span>

            <h2>
              Building deeper
              <br />
              <em>security capability.</em>
            </h2>

            <p>
              Education provides the foundation, but cybersecurity capability
              grows through consistent practice. My current development focuses
              on understanding systems from both defensive and offensive
              perspectives while improving technical documentation,
              investigation and problem-solving.
            </p>
          </div>

          <div className="ce-development-list">
            {developmentAreas.map((area, index) => (
              <div key={area}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{area}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="ce-final">
          <ShieldCheck size={28} />

          <span>LEARNING / PRACTICE / RESEARCH</span>

          <h2>
            Education is the foundation.
            <br />
            <em>Practice builds capability.</em>
          </h2>

          <p>
            Every course, certification, laboratory and technical project
            contributes to a broader goal: becoming a more capable and
            responsible cybersecurity professional.
          </p>
        </section>
      </main>

      <footer className="ce-footer">
        <span>DK / CYBERSECURITY PORTFOLIO</span>

        <button type="button" onClick={onBack}>
          RETURN TO PORTFOLIO
          <ArrowUpRight size={15} />
        </button>
      </footer>
    </div>
  );
}
