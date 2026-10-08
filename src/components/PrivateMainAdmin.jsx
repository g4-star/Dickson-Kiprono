import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  Check,
  Edit3,
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
  ["project_code", "Project Code"],
  ["profile_image", "Profile Image"],
];

async function readApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned invalid JSON (HTTP ${response.status}).`
      );
    }
  }

  throw new Error(
    text.trim() ||
      `Request failed with HTTP ${response.status}.`
  );
}

export default function PrivateMainAdmin({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [editingId, setEditingId] = useState(null);

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

      const data = await readApiResponse(response);

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

      const data = await readApiResponse(response);

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
    setUploadProgress(0);
    setMessage("");

    try {
      const file = form.file;

      setMessage("Preparing secure upload...");

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/private-admin-blob-upload",
        clientPayload: JSON.stringify({
          content_type: form.content_type,
          file_name: file.name,
        }),
        multipart: true,
        onUploadProgress: ({ percentage }) => {
          const progress = Math.max(
            0,
            Math.min(100, Math.round(percentage))
          );

          setUploadProgress(progress);
          setMessage(`Uploading ${progress}%...`);
        },
      });

      setMessage("Upload complete. Saving content metadata...");

      const response = await fetch(
        "/api/private-admin-content-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_type: form.content_type,
            title: form.title,
            description: form.description,
            objective: form.objective,
            category: form.category,
            published: form.published,
            file_url: blob.url,
            file_name: file.name,
            file_type: file.type || blob.contentType,
            file_size: file.size,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save uploaded content."
        );
      }

      setUploadProgress(100);
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

      const fileInput = document.getElementById(
        "private-file-input"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadContent();
    } catch (error) {
      setMessage(
        error?.message || "Unable to upload content."
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  function startEditing(item) {
    setEditingId(item.id);

    setForm({
      content_type: item.content_type || "report",
      title: item.title || "",
      description: item.description || "",
      objective: item.objective || "",
      category: item.category || "",
      published: Boolean(item.published),
      file: null,
    });

    setMessage(
      `Editing "${item.title}". Choose a new file only if you want to replace the current one.`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingId(null);

    setForm({
      content_type: "report",
      title: "",
      description: "",
      objective: "",
      category: "",
      published: false,
      file: null,
    });

    const fileInput = document.getElementById(
      "private-file-input"
    );

    if (fileInput) {
      fileInput.value = "";
    }

    setMessage("");
  }

  async function saveEdit(event) {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    if (!form.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const currentItem = items.find(
        (item) => item.id === editingId
      );

      if (!currentItem) {
        throw new Error("The content item could not be found.");
      }

      let fileData = {
        file_url: currentItem.file_url,
        file_name: currentItem.file_name,
        file_type: currentItem.file_type,
        file_size: currentItem.file_size,
      };

      if (form.file) {
        const file = form.file;

        setMessage("Preparing replacement file upload...");

        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/private-admin-blob-upload",
          clientPayload: JSON.stringify({
            content_type: form.content_type,
            file_name: file.name,
          }),
          multipart: true,
          onUploadProgress: ({ percentage }) => {
            const progress = Math.max(
              0,
              Math.min(100, Math.round(percentage))
            );

            setUploadProgress(progress);
            setMessage(
              `Uploading replacement ${progress}%...`
            );
          },
        });

        fileData = {
          file_url: blob.url,
          file_name: file.name,
          file_type: file.type || blob.contentType,
          file_size: file.size,
        };
      }

      setMessage("Saving content changes...");

      const response = await fetch(
        `/api/private-admin-content?id=${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_type: form.content_type,
            title: form.title,
            description: form.description,
            objective: form.objective,
            category: form.category,
            published: form.published,
            ...fileData,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save content changes."
        );
      }

      setEditingId(null);

      setForm({
        content_type: "report",
        title: "",
        description: "",
        objective: "",
        category: "",
        published: false,
        file: null,
      });

      const fileInput = document.getElementById(
        "private-file-input"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("Content updated successfully.");

      await loadContent();
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to update portfolio content."
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function togglePublished(item) {
    try {
      setMessage("");

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

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update publication status."
        );
      }

      setMessage(
        item.published
          ? "Content unpublished successfully."
          : "Content published successfully."
      );

      await loadContent();
    } catch (error) {
      setMessage(
        error.message || "Unable to update publication status."
      );
    }
  }


  async function togglePinned(item) {
    try {
      setMessage("");

      const response = await fetch(
        `/api/private-admin-content?id=${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinned: !item.pinned,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update pin status."
        );
      }

      setMessage(
        item.pinned
          ? "Content unpinned successfully."
          : "Content pinned successfully."
      );

      await loadContent();
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to update pin status."
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

      const data = await readApiResponse(response);

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
              <h2>
                {editingId
                  ? "Edit Portfolio Content"
                  : "Add Portfolio Content"}
              </h2>
            </div>

            <Plus size={20} />
          </div>

          <form onSubmit={editingId ? saveEdit : uploadContent}>
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.svg,.py,.html,.htm,.css,.js,.jsx,.ts,.tsx,.dart,.java,.php,.c,.cpp,.cs,.rs,.go,.sh,.bash,.sql,.json,.xml,.md,.txt"
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
              {editingId ? (
                <Edit3 size={17} />
              ) : (
                <Upload size={17} />
              )}

              {uploading
                ? editingId
                  ? "Saving..."
                  : "Uploading..."
                : editingId
                  ? "Save Changes"
                  : "Upload Content"}
            </button>

            {editingId && (
              <button
                className="private-secondary"
                type="button"
                onClick={cancelEditing}
                disabled={uploading}
              >
                <X size={17} />
                Cancel Edit
              </button>
            )}
          </form>

          {uploadProgress !== null && (
            <div
              className="private-upload-progress"
              role="status"
              aria-live="polite"
            >
              <div className="private-upload-progress-header">
                <div className="private-upload-progress-info">
                  <strong>
                    {editingId
                      ? "Replacing file"
                      : "Uploading file"}
                  </strong>

                  <span>
                    {form.file?.name ||
                      "Preparing file..."}
                  </span>
                </div>

                <strong className="private-upload-progress-percent">
                  {uploadProgress}%
                </strong>
              </div>

              <div
                className="private-upload-progress-track"
                aria-hidden="true"
              >
                <div
                  className="private-upload-progress-fill"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>

              <div className="private-upload-progress-footer">
                <span>
                  {uploadProgress === 100
                    ? "Upload complete — saving..."
                    : `${uploadProgress}% uploaded`}
                </span>
              </div>
            </div>
          )}

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
                    {item.pinned && (
                      <span className="pinned">
                        📌 Pinned
                      </span>
                    )}

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
                    <button
                      type="button"
                      onClick={() => togglePinned(item)}
                      className={
                        item.pinned
                          ? "pinned-action"
                          : ""
                      }
                      aria-label={
                        item.pinned
                          ? `Unpin ${item.title}`
                          : `Pin ${item.title}`
                      }
                      title={
                        item.pinned
                          ? "Unpin"
                          : "Pin for later"
                      }
                    >
                      <span aria-hidden="true">
                        {item.pinned ? "📌" : "📍"}
                      </span>
                      {item.pinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      aria-label={`Edit ${item.title}`}
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

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
