import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./SecurityTeamAdmin.css";

export default function SecurityTeamAdmin({
  initialAuthenticated = false,
  onLogout,
}) {
  const [authenticated] = useState(initialAuthenticated);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    loadImages();
  }, [authenticated]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function loadImages() {
    try {
      setLoadingMembers(true);
      setError("");

      const response = await fetch("/api/security-team");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load images");
      }

      setMembers(Array.isArray(data.team) ? data.team : []);
    } catch (err) {
      setError(err.message || "Unable to load images");
    } finally {
      setLoadingMembers(false);
    }
  }

  function selectImage(event) {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    setError("");
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Use JPG, PNG or WebP.");
      event.target.value = "";
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearSelectedImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadImage(event) {
    event.preventDefault();

    if (!image) {
      setError("Select an image first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/security-team-upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Image uploaded successfully.");

      clearSelectedImage();
      await loadImages();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(id) {
    const confirmed = window.confirm(
      "Delete this Security Team image permanently?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/security-team-delete?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Delete failed");
      }

      setMembers((current) =>
        current.filter((member) => member.id !== id)
      );

      setMessage("Image deleted successfully.");
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (!authenticated) {
    return null;
  }

  return (
    <main className="security-admin-page">
      <div className="security-admin-shell">
        <header className="security-admin-header">
          <div className="security-admin-heading">
            <div className="security-admin-icon">
              <ShieldCheck size={24} />
            </div>

            <div>
              <span>RESTRICTED AREA</span>
              <h1>Security Team Admin</h1>
              <p>
                Upload and manage the images displayed on the Security Team.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="security-admin-logout"
            onClick={onLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </header>

        {message && (
          <div className="security-admin-message success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="security-admin-message error">
            {error}
          </div>
        )}

        <section className="security-admin-upload-card">
          <div className="security-admin-section-heading">
            <div>
              <span>01 / MEDIA</span>
              <h2>Upload team image</h2>
              <p>
                Add a JPG, PNG or WebP image up to 5 MB.
              </p>
            </div>
          </div>

          <form onSubmit={uploadImage}>
            <input
              ref={fileInputRef}
              id="security-member-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectImage}
              hidden
            />

            {!preview ? (
              <button
                type="button"
                className="security-admin-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={34} />
                <strong>Choose an image</strong>
                <span>JPG, PNG or WebP · Maximum 5 MB</span>
              </button>
            ) : (
              <div className="security-admin-preview">
                <img src={preview} alt="Selected team member" />

                <button
                  type="button"
                  className="security-admin-clear"
                  onClick={clearSelectedImage}
                  aria-label="Remove selected image"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="security-admin-upload-actions">
              <button
                type="button"
                className="security-admin-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={17} />
                Select Image
              </button>

              <button
                type="submit"
                className="security-admin-primary"
                disabled={!image || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={17} className="security-admin-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="security-admin-gallery">
          <div className="security-admin-section-heading">
            <div>
              <span>02 / MANAGE</span>
              <h2>Current team images</h2>
              <p>
                Images currently stored in the Security Team.
              </p>
            </div>

            <strong className="security-admin-count">
              {members.length} {members.length === 1 ? "IMAGE" : "IMAGES"}
            </strong>
          </div>

          {loadingMembers ? (
            <div className="security-admin-empty">
              <Loader2 size={22} className="security-admin-spin" />
              Loading images...
            </div>
          ) : members.length === 0 ? (
            <div className="security-admin-empty">
              No team images have been uploaded yet.
            </div>
          ) : (
            <div className="security-admin-grid">
              {members.map((member) => (
                <article
                  className="security-admin-image-card"
                  key={member.id}
                >
                  <div className="security-admin-image-wrapper">
                    <img
                      src={member.image_url}
                      alt="Security Team member"
                    />

                    <button
                      type="button"
                      className="security-admin-delete"
                      onClick={() => deleteImage(member.id)}
                      disabled={deletingId === member.id}
                      aria-label="Delete image"
                    >
                      {deletingId === member.id ? (
                        <Loader2
                          size={18}
                          className="security-admin-spin"
                        />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          className="security-admin-back"
          onClick={onLogout}
        >
          <ArrowLeft size={17} />
          Back to Security Team
        </button>
      </div>
    </main>
  );
}
