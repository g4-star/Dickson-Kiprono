import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LogIn,
  LogOut,
  ShieldCheck,
  Upload,
  UserPlus,
} from "lucide-react";
import "./SecurityTeamAdmin.css";

export default function SecurityTeamAdmin({
  initialAuthenticated = false,
  onLogout,
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    setError("");
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Use JPG, PNG or WebP.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setImage(selected);

    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const uploadMember = async (event) => {
    event.preventDefault();

    if (!image) {
      setError("Please select a profile image.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("name", name);
      formData.append("role", role);
      formData.append("description", description);
      formData.append("github_url", github);
      formData.append("linkedin_url", linkedin);
      formData.append("portfolio_url", portfolio);

      const response = await fetch("/api/security-team-upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(`${data.member.name} was added to the Security Team.`);

      setImage(null);
      setPreview("");
      setName("");
      setRole("");
      setDescription("");
      setGithub("");
      setLinkedin("");
      setPortfolio("");

      const input = document.getElementById("security-member-image");

      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin-logout", {
      method: "POST",
      credentials: "same-origin",
    });

    setAuthenticated(false);

    if (onLogout) {
      onLogout();
    }
  };

  if (!authenticated) {
    return (
      <main className="security-admin-page">
        <div className="security-admin-shell security-admin-login">
          <div className="security-admin-brand">
            <ShieldCheck size={22} />
            <span>SECURITY NETWORK / ADMIN</span>
          </div>

          <div className="security-admin-login-panel">
            <div className="security-admin-icon">
              <LogIn size={25} />
            </div>

            <span className="security-admin-eyebrow">
              RESTRICTED ACCESS
            </span>

            <h1>Security Team Admin</h1>

            <p>
              Authorized access only. Sign in to add members and upload
              security network profile images.
            </p>

            <form onSubmit={login}>
              <label htmlFor="admin-password">ADMIN PASSWORD</label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              {error && (
                <div className="security-admin-error">
                  {error}
                </div>
              )}

              <button
                className="security-admin-submit"
                type="submit"
                disabled={loading}
              >
                <LogIn size={17} />
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </form>

            <a className="security-admin-back" href="/">
              <ArrowLeft size={15} />
              Back to portfolio
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="security-admin-page">
      <div className="security-admin-shell">
        <header className="security-admin-header">
          <div>
            <div className="security-admin-brand">
              <ShieldCheck size={22} />
              <span>SECURITY NETWORK / ADMIN</span>
            </div>

            <h1>Add Security Team Member</h1>

            <p>
              Upload a colleague's profile image and add their public
              professional information to the Security Network.
            </p>
          </div>

          <button
            className="security-admin-logout"
            type="button"
            onClick={logout}
          >
            <LogOut size={16} />
            LOG OUT
          </button>
        </header>

        <form
          className="security-admin-form"
          onSubmit={uploadMember}
        >
          <section className="security-admin-upload">
            <div className="security-admin-section-heading">
              <UserPlus size={18} />
              <div>
                <span>NEW MEMBER</span>
                <h2>Profile information</h2>
              </div>
            </div>

            <div className="security-admin-image-area">
              <div className="security-admin-preview">
                {preview ? (
                  <img src={preview} alt="Selected member preview" />
                ) : (
                  <div>
                    <ImagePlus size={30} />
                    <span>NO IMAGE</span>
                  </div>
                )}
              </div>

              <div className="security-admin-file">
                <label htmlFor="security-member-image">
                  <Upload size={17} />
                  Choose profile image
                </label>

                <input
                  id="security-member-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectImage}
                />

                <small>
                  JPG, PNG or WebP · Maximum 5 MB
                </small>
              </div>
            </div>

            <div className="security-admin-fields">
              <label>
                <span>NAME *</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sang"
                  maxLength={120}
                  required
                />
              </label>

              <label>
                <span>ROLE / FOCUS *</span>
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. Cybersecurity Professional"
                  maxLength={160}
                  required
                />
              </label>

              <label className="full">
                <span>DESCRIPTION</span>
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Short professional introduction..."
                  maxLength={1000}
                  rows={5}
                />
              </label>

              <label>
                <span>GITHUB</span>
                <input
                  type="url"
                  value={github}
                  onChange={(event) => setGithub(event.target.value)}
                  placeholder="https://github.com/..."
                />
              </label>

              <label>
                <span>LINKEDIN</span>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(event) =>
                    setLinkedin(event.target.value)
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </label>

              <label className="full">
                <span>PORTFOLIO</span>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(event) =>
                    setPortfolio(event.target.value)
                  }
                  placeholder="https://..."
                />
              </label>
            </div>

            {error && (
              <div className="security-admin-error">
                {error}
              </div>
            )}

            {message && (
              <div className="security-admin-success">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            <button
              className="security-admin-save"
              type="submit"
              disabled={loading}
            >
              <Upload size={17} />
              {loading ? "UPLOADING..." : "UPLOAD & ADD MEMBER"}
            </button>
          </section>
        </form>

        <a className="security-admin-back" href="/">
          <ArrowLeft size={15} />
          Return to portfolio
        </a>
      </div>
    </main>
  );
}
