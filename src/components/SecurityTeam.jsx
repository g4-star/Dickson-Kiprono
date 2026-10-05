import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import "./SecurityTeam.css";
import SecurityTeamAdmin from "./SecurityTeamAdmin";

export default function SecurityTeam({ onBack }) {
  const [members, setMembers] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/security-team");

        if (!response.ok) {
          throw new Error("Unable to load security team");
        }

        const data = await response.json();
        const team = Array.isArray(data.team) ? data.team : [];

        if (!cancelled) {
          setMembers(team);
          setActiveMember(team[0] ?? null);
        }
      } catch {
        if (!cancelled) {
          setError("The security team could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTeam();

    return () => {
      cancelled = true;
    };
  }, []);

  const openAdminLogin = () => {
    setAdminError("");
    setAdminPassword("");
    setShowAdminLogin(true);
  };

  const loginToAdmin = async (event) => {
    event.preventDefault();

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
      setAdminLoading(false);
      setAdminError("");
      setShowAdminPanel(true);
    } catch (err) {
      setAdminError(err.message || "Access denied");
      setAdminLoading(false);
    }
  };

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (showAdminPanel) {
    return (
      <SecurityTeamAdmin
        initialAuthenticated={true}
        onLogout={() => {
          setShowAdminPanel(false);
          setShowAdminLogin(false);
          setAdminPassword("");
          setAdminError("");
        }}
      />
    );
  }

  const scrollingMembers =
    members.length > 1 ? [...members, ...members] : members;

  return (
    <main className="security-team-page">
      <div className="security-team-bg" />

      <header className="security-team-nav">
        <button
          type="button"
          className="security-team-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          <span>BACK TO PORTFOLIO</span>
        </button>

        <div className="security-team-nav-title">
          <span>DK / SECURITY NETWORK</span>
          <small>CYBERSECURITY COMMUNITY</small>
        </div>

        <div className="security-team-nav-status">
          <i />
          NETWORK ONLINE
        </div>
      </header>

      <section className="security-team-hero">
        <div className="security-team-hero-copy">
          <span className="security-team-kicker">
            01 — SECURITY NETWORK
          </span>

          <h1>
            The people
            <br />
            behind the
            <br />
            <em>learning.</em>
          </h1>

          <p>
            Cybersecurity is a collaborative discipline. This space
            highlights classmates, friends, lab partners and members
            of the technical network that contributes to learning,
            practice and knowledge sharing.
          </p>

          <div className="security-team-hero-meta">
            <span>CYBERSECURITY</span>
            <span>COLLABORATION</span>
            <span>KENYA / REMOTE</span>
          </div>
        </div>

        <div className="security-room">
          <div className="security-room-scanlines" />

          <div className="security-room-grid" />

          <div className="server-rack rack-one">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="server-rack rack-two">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="security-monitor">
            <div className="monitor-top">
              <span>SECURITY OPERATIONS</span>
              <span>LIVE</span>
            </div>

            <div className="monitor-lines">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="monitor-terminal">
              <small>$ network_status</small>
              <strong>SECURE / ACTIVE</strong>
              <small>$ team_connection</small>
              <strong>ESTABLISHED</strong>
            </div>
          </div>

          <div className="security-room-label">
            <Terminal size={14} />
            SECURITY OPERATIONS / TEAM ENVIRONMENT
          </div>
        </div>
      </section>

      <section className="security-team-content">
        <div className="security-team-section-heading">
          <div>
            <span>02 — THE NETWORK</span>
            <h2>Cybersecurity is stronger together.</h2>
          </div>

          <p>
            Technical skills grow through repetition, discussion,
            experimentation and exposure to different ways of solving
            the same problem.
          </p>
        </div>

        <div className="security-team-network-panel">
          <div className="network-panel-header">
            <div>
              <span>SECURITY NETWORK / PEOPLE</span>
              <strong>
                {loading
                  ? "CONNECTING..."
                  : `${String(members.length).padStart(2, "0")} MEMBERS`}
              </strong>
            </div>

            <div className="network-live">
              <i />
              {loading ? "SYNCING" : "LIVE"}
            </div>
          </div>

          <div className="security-admin-gateway">
            <button
              type="button"
              className="security-admin-profile"
              onClick={openAdminLogin}
            >
              <div className="security-admin-profile-photo">
                <img
                  src="/src/assets/me.jpeg"
                  alt="Dickson Kiprono"
                />
                <span>ADMIN</span>
              </div>

              <div className="security-admin-profile-copy">
                <span>RESTRICTED PROFILE</span>
                <strong>Dickson Kiprono</strong>
                <small>CYBERSECURITY / NETWORK ADMINISTRATOR</small>
                <em>
                  Input password to view
                  <ArrowUpRight size={14} />
                </em>
              </div>
            </button>
          </div>

          {showAdminLogin && (
            <div className="security-admin-gateway-overlay">
              <div className="security-admin-gateway-panel">
                <button
                  type="button"
                  className="security-admin-gateway-close"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  aria-label="Close password panel"
                >
                  ×
                </button>

                <div className="security-admin-gateway-icon">
                  <ShieldCheck size={28} />
                </div>

                <span className="security-admin-gateway-label">
                  RESTRICTED SECURITY PROFILE
                </span>

                <h2>Input password to view</h2>

                <p>
                  This profile contains protected security network
                  administration controls.
                </p>

                <form onSubmit={loginToAdmin}>
                  <label htmlFor="security-gateway-password">
                    ACCESS PASSWORD
                  </label>

                  <input
                    id="security-gateway-password"
                    type="password"
                    value={adminPassword}
                    onChange={(event) =>
                      setAdminPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    autoFocus
                    required
                  />

                  {adminError && (
                    <div className="security-admin-gateway-error">
                      {adminError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="security-admin-gateway-submit"
                    disabled={adminLoading}
                  >
                    <ShieldCheck size={16} />
                    {adminLoading
                      ? "VERIFYING ACCESS..."
                      : "ACCESS PROFILE"}
                  </button>
                </form>

                <small className="security-admin-gateway-note">
                  AUTHENTICATION IS VERIFIED BY THE SECURITY SERVER
                </small>
              </div>
            </div>
          )}

          {loading ? (
            <div className="security-team-empty">
              <Terminal size={24} />
              <strong>CONNECTING TO SECURITY NETWORK</strong>
              <p>
                Retrieving team records from the portfolio backend.
              </p>
            </div>
          ) : error ? (
            <div className="security-team-empty">
              <ShieldCheck size={24} />
              <strong>NETWORK CONNECTION ERROR</strong>
              <p>{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="security-team-empty">
              <Users size={24} />
              <strong>NETWORK READY</strong>
              <p>
                No team profiles have been added yet. Add your
                classmates and security collaborators from the
                protected administration panel.
              </p>
            </div>
          ) : (
            <>
              <div className="security-team-marquee">
                <div className="security-team-track">
                  {scrollingMembers.map((member, index) => (
                    <button
                      type="button"
                      key={`${member.id}-${index}`}
                      className={`security-member-card ${
                        activeMember?.id === member.id ? "active" : ""
                      }`}
                      onClick={() => setActiveMember(member)}
                    >
                      <div className="security-member-photo">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="security-member-placeholder">
                            <ShieldCheck size={30} />
                          </div>
                        )}

                        <span>
                          {String(
                            (index % members.length) + 1,
                          ).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="security-member-details">
                        <strong>{member.name}</strong>
                        <small>
                          {member.role ||
                            "CYBERSECURITY NETWORK MEMBER"}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="security-team-marquee-note">
                <span>AUTO-SCROLLING NETWORK</span>
                <span>SELECT A MEMBER TO VIEW DETAILS</span>
              </div>
            </>
          )}
        </div>
      </section>

      {activeMember && (
        <section className="security-member-profile">
          <div className="security-profile-photo">
            {activeMember.image_url ? (
              <img
                src={activeMember.image_url}
                alt={activeMember.name}
              />
            ) : (
              <div className="security-profile-placeholder">
                <ShieldCheck size={48} />
              </div>
            )}

            <span>
              MEMBER / {String(activeMember.id).padStart(3, "0")}
            </span>
          </div>

          <div className="security-profile-copy">
            <span className="security-team-kicker">
              03 — MEMBER PROFILE
            </span>

            <h2>{activeMember.name}</h2>

            <strong>
              {activeMember.role || "Cybersecurity Community"}
            </strong>

            <p>
              {activeMember.description ||
                "A member of the cybersecurity learning and collaboration network."}
            </p>

            <div className="security-profile-links">
              {activeMember.github_url && (
                <a
                  href={activeMember.github_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                  <ArrowUpRight size={16} />
                </a>
              )}

              {activeMember.linkedin_url && (
                <a
                  href={activeMember.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                  <ArrowUpRight size={16} />
                </a>
              )}

              {activeMember.portfolio_url && (
                <a
                  href={activeMember.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Portfolio
                  <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="security-team-principles">
        <div>
          <span>04 — COLLABORATION</span>
          <h2>What we build through shared learning.</h2>
        </div>

        <div className="security-principle-grid">
          <article>
            <span>01</span>
            <h3>Practice</h3>
            <p>
              Working through practical labs and technical exercises
              turns security concepts into skills that can be applied.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Knowledge</h3>
            <p>
              Sharing approaches and explaining difficult concepts
              helps strengthen everyone's understanding.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Collaboration</h3>
            <p>
              Security problems often require different perspectives,
              making collaboration an important technical advantage.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>Growth</h3>
            <p>
              Every lab, investigation and discussion contributes to
              deeper technical capability and professional growth.
            </p>
          </article>
        </div>
      </section>

      <footer className="security-team-footer">
        <span>DK / SECURITY NETWORK</span>

        <button type="button" onClick={onBack}>
          RETURN TO PORTFOLIO
          <ArrowLeft size={15} />
        </button>
      </footer>
    </main>
  );
}
