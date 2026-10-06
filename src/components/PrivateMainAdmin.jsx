import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Image,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./PrivateMainAdmin.css";

const CONTENT_TYPES = [
  ["report", "Lab Report"],
  ["certificate", "Certificate"],
  ["cv", "CV"],
  ["project_document", "Project Documentation"],
  ["profile_image", "Profile Image"],
];

export default function PrivateMainAdmin({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    content_type: "report",
    title: "",
    description: "",
    objective: "",
    category: "",
    published: false,
    file: null,
  });

  async function loadContent() {
    setLoading(true);

    try {
      const response = await fetch("/api/private-admin-content");

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        setItems(data.items || []);
      }
    } catch {
      setMessage("Unable to load portfolio content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  async function login(event) {
    event.preventDefault();

    setLoginError("");

    try {
      const response = await fetch("/api/private-admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.error || "Invalid password.");
        return;
      }

      setPassword("");
      await loadContent();
    } catch {
      setLoginError("Unable to connect to the admin service.");
    }
  }

  async function logout() {
    await fetch("/api/private-admin-logout", {
      method: "POST",
    });

    setAuthenticated(false);
    setItems([]);
  }

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function uploadContent(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    if (!form.file) {
      setMessage("Choose a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const body = new FormData();

      body.append("content_type", form.content_type);
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("objective", form.objective);
      body.append("category", form.category);
      body.append("published", String(form.published));
      body.append("file", form.file);

      const response = await fetch("/api/private-admin-content", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      setMessage("Content uploaded successfully.");

      setForm({
        content_type: "report",
        title: "",
        description: "",
        objective: "",
        category: "",
        published: false,
        file: null,
      });

      document.getElementById("private-file-input").value = "";

      await loadContent();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(item) {
    try {
      setError("");

      const response = await fetch(
        `/api/private-admin-content?id=${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            published: !item.published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update publication status."
        );
      }

      await loadContent();
    } catch (error) {
      setError(
        error.message || "Unable to update publication status."
      );
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Delete this content permanently?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/private-admin-content?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Delete failed.");
      }

      setItems((current) =>
        current.filter((item) => item.id !== id)
      );

      setMessage("Content deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!authenticated && !loading) {
    return (
      <main className="private-admin-page">
        <section className="private-login">
          <button
            className="private-back"
            onClick={onBack}
            type="button"
          >
            <X size={16} />
            Back to portfolio
          </button>

          <div className="private-login-card">
            <span className="private-kicker">RESTRICTED SYSTEM</span>

            <h1>Private Main Admin</h1>

            <p>
              Central content management for the portfolio.
              Authorized access only.
            </p>

            <form onSubmit={login}>
              <label htmlFor="admin-password">
                Administrator Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                placeholder="Enter private admin password"
              />

              {loginError && (
                <div className="private-error">
                  {loginError}
                </div>
              )}

              <button className="private-primary" type="submit">
                <LogIn size={17} />
                Enter Private Admin
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="private-admin-page">
      <header className="private-admin-header">
        <div>
          <span className="private-kicker">
            PRIVATE CONTROL CENTER
          </span>
          <h1>Main Portfolio Admin</h1>
          <p>
            Manage the content displayed across the public portfolio.
          </p>
        </div>

        <div className="private-header-actions">
          <button onClick={onBack} type="button">
            Back to portfolio
          </button>

          <button onClick={logout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <section className="private-stats">
        <div>
          <strong>{items.length}</strong>
          <span>Total Content</span>
        </div>

        <div>
          <strong>
            {items.filter((item) => item.published).length}
          </strong>
          <span>Published</span>
        </div>

        <div>
          <strong>
            {items.filter((item) => !item.published).length}
          </strong>
          <span>Drafts</span>
        </div>
      </section>

      <section className="private-layout">
        <div className="private-upload-card">
          <div className="private-card-heading">
            <div>
              <span className="private-kicker">CONTENT</span>
              <h2>Add Portfolio Content</h2>
            </div>

            <Plus size={20} />
          </div>

          <form onSubmit={uploadContent}>
            <label>
              Content Type
              <select
                value={form.content_type}
                onChange={(event) =>
                  updateForm(
                    "content_type",
                    event.target.value
                  )
                }
              >
                {CONTENT_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                placeholder={
                  form.content_type === "report"
                    ? "Lab name"
                    : "Content title"
                }
              />
            </label>

            {form.content_type === "report" && (
              <label>
                Lab Objective / What the Lab Required
                <textarea
                  value={form.objective}
                  onChange={(event) =>
                    updateForm(
                      "objective",
                      event.target.value
                    )
                  }
                  placeholder="Explain what the lab required you to implement, investigate or demonstrate."
                  rows="5"
                />
              </label>
            )}

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe this content."
                rows="5"
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={(event) =>
                  updateForm(
                    "category",
                    event.target.value
                  )
                }
                placeholder="e.g. Network Security"
              />
            </label>

            <label>
              File
              <input
                id="private-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={(event) =>
                  updateForm(
                    "file",
                    event.target.files?.[0] || null
                  )
                }
              />
            </label>

            <label className="private-publish-toggle">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  updateForm(
                    "published",
                    event.target.checked
                  )
                }
              />
              <span>
                Publish immediately
              </span>
            </label>

            <button
              className="private-primary"
              type="submit"
              disabled={uploading}
            >
              <Upload size={17} />
              {uploading ? "Uploading..." : "Upload Content"}
            </button>
          </form>

          {message && (
            <div className="private-message">
              {message}
            </div>
          )}
        </div>

        <div className="private-content-card">
          <div className="private-card-heading">
            <div>
              <span className="private-kicker">LIBRARY</span>
              <h2>Portfolio Content</h2>
            </div>

            <FileText size={20} />
          </div>

          {loading ? (
            <p className="private-muted">Loading content...</p>
          ) : items.length === 0 ? (
            <div className="private-empty">
              <Image size={28} />
              <strong>No content uploaded yet.</strong>
              <span>
                Upload reports, certificates, your CV,
                documentation or profile media.
              </span>
            </div>
          ) : (
            <div className="private-list">
              {items.map((item) => (
                <article
                  className="private-item"
                  key={item.id}
                >
                  <div className="private-item-icon">
                    {item.content_type === "profile_image" ? (
                      <Image size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>

                  <div className="private-item-info">
                    <strong>{item.title}</strong>

                    <span>
                      {item.content_type.replace(
                        "_",
                        " "
                      )}
                    </span>

                    {item.file_name && (
                      <small>{item.file_name}</small>
                    )}
                  </div>

                  <div className="private-item-status">
                    {item.published ? (
                      <span className="published">
                        <Check size={14} />
                        Published
                      </span>
                    ) : (
                      <span className="draft">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="private-item-actions">
                    {item.file_url && (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      className={
                        item.published
                          ? "published-action"
                          : "publish-action"
                      }
                    >
                      {item.published ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteItem(item.id)
                      }
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
