import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./SecurityTeamAdmin.css";

const emptyForm = {
  name: "",
  role: "",
  description: "",
  github_url: "",
  linkedin_url: "",
  portfolio_url: "",
};

export default function SecurityTeamAdmin({
  initialAuthenticated = true,
  onLogout,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  const [profilePreview, setProfilePreview] = useState("");
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(null);

  const profileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/security-team", {
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load team members.");
      }

      setMembers(Array.isArray(data.team) ? data.team : []);
    } catch (err) {
      setError(err.message || "Unable to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAuthenticated) {
      loadMembers();
    }
  }, [initialAuthenticated]);

  const resetEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
    setProfileImage(null);
    setAdditionalImages([]);
    setProfilePreview("");
    setAdditionalPreviews([]);

    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }

    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  const startAdd = () => {
    setNotice("");
    setError("");
    resetEditor();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const startEdit = (member) => {
    setNotice("");
    setError("");

    setEditingId(member.id);
    setForm({
      name: member.name || "",
      role: member.role || "",
      description: member.description || "",
      github_url: member.github_url || "",
      linkedin_url: member.linkedin_url || "",
      portfolio_url: member.portfolio_url || "",
    });

    setProfileImage(null);
    setAdditionalImages([]);
    setProfilePreview(member.profile_image_url || member.image_url || "");
    setAdditionalPreviews([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleAdditionalImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setAdditionalImages((current) => [...current, ...files]);

    setAdditionalPreviews((current) => [
      ...current,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removePendingImage = (index) => {
    setAdditionalImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );

    setAdditionalPreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const saveMember = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Team member name is required.");
      return;
    }

    if (!form.role.trim()) {
      setError("Role or specialty is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("role", form.role.trim());
      formData.append("description", form.description.trim());
      formData.append("github_url", form.github_url.trim());
      formData.append("linkedin_url", form.linkedin_url.trim());
      formData.append("portfolio_url", form.portfolio_url.trim());

      if (editingId) {
        formData.append("id", String(editingId));
      }

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      additionalImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/security-team-member", {
        method: editingId ? "PUT" : "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to save team member.");
      }

      setNotice(
        editingId
          ? "Team member updated successfully."
          : "Team member added successfully.",
      );

      resetEditor();
      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/security-team-member?id=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete team member.");
      }

      setNotice("Team member deleted.");
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        resetEditor();
      }

      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to delete team member.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteImage = async (image) => {
    if (!image?.id) {
      return;
    }

    try {
      setImageDeleting(image.id);
      setError("");

      const response = await fetch(
        `/api/security-team-image?id=${encodeURIComponent(image.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete image.");
      }

      setNotice("Image deleted.");
      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to delete image.");
    } finally {
      setImageDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      onLogout?.();
    }
  };

  return (
    <main className="security-admin-page">
      <header className="security-admin-header">
        <div className="security-admin-header-inner">
          <button
            className="security-admin-back"
            type="button"
            onClick={onLogout}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="security-admin-brand">
            <div className="security-admin-brand-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <strong>Security Team Management</strong>
              <span>Authorized management panel</span>
            </div>
          </div>

          <button
            className="security-admin-logout"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="security-admin-container">
        <section className="security-admin-intro">
          <div>
            <span className="security-admin-eyebrow">
              <ShieldCheck size={14} />
              Authorized access
            </span>

            <h1>Manage the Security Team</h1>

            <p>
              Add members, update profiles, manage photographs and maintain
              the people presented on the public Security Team page.
            </p>
          </div>

          <button
            className="security-admin-add-button"
            type="button"
            onClick={startAdd}
          >
            <Plus size={18} />
            Add Team Member
          </button>
        </section>

        {error && (
          <div className="security-admin-alert security-admin-alert-error">
            <X size={17} />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="security-admin-alert security-admin-alert-success">
            <Check size={17} />
            <span>{notice}</span>
          </div>
        )}

        <section className="security-admin-editor">
          <div className="security-admin-section-heading">
            <div>
              <span className="security-admin-kicker">
                {editingId ? "Edit member" : "New member"}
              </span>
              <h2>{editingId ? "Update Team Member" : "Add Team Member"}</h2>
            </div>

            {editingId && (
              <button
                className="security-admin-secondary"
                type="button"
                onClick={resetEditor}
              >
                <X size={16} />
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={saveMember}>
            <div className="security-admin-form-grid">
              <div className="security-admin-photo-column">
                <div className="security-admin-photo-label">
                  Profile Photo
                </div>

                <button
                  className="security-admin-profile-upload"
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                >
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                  hidden
                />

                {profilePreview && (
                  <button
                    className="security-admin-change-photo"
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    Change profile photo
                  </button>
                )}
              </div>

              <div className="security-admin-fields">
                <label>
                  <span>Name *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="e.g. Dickson Kiprono"
                    required
                  />
                </label>

                <label>
                  <span>Role / Specialty *</span>
                  <input
                    name="role"
                    value={form.role}
                    onChange={updateField}
                    placeholder="e.g. Cybersecurity Professional"
                    required
                  />
                </label>

                <label className="security-admin-full">
                  <span>Bio / Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={5}
                    placeholder="Describe the member, their expertise and security focus..."
                  />
                </label>

                <label>
                  <span>GitHub</span>
                  <input
                    name="github_url"
                    value={form.github_url}
                    onChange={updateField}
                    placeholder="https://github.com/username"
                    type="url"
                  />
                </label>

                <label>
                  <span>LinkedIn</span>
                  <input
                    name="linkedin_url"
                    value={form.linkedin_url}
                    onChange={updateField}
                    placeholder="https://linkedin.com/in/username"
                    type="url"
                  />
                </label>

                <label className="security-admin-full">
                  <span>Portfolio</span>
                  <input
                    name="portfolio_url"
                    value={form.portfolio_url}
                    onChange={updateField}
                    placeholder="https://example.com"
                    type="url"
                  />
                </label>
              </div>
            </div>

            <div className="security-admin-images-section">
              <div className="security-admin-images-heading">
                <div>
                  <span className="security-admin-kicker">
                    Member gallery
                  </span>
                  <h3>Additional Images</h3>
                  <p>
                    Add photographs that belong specifically to this team
                    member.
                  </p>
                </div>

                <button
                  className="security-admin-secondary"
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                >
                  <ImagePlus size={17} />
                  Add Images
                </button>

                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImages}
                  hidden
                />
              </div>

              {editingId && (
                <div className="security-admin-existing-images">
                  {(members.find((member) => member.id === editingId)
                    ?.images || []).map((image) => (
                    <div className="security-admin-image-card" key={image.id}>
                      <img src={image.image_url} alt="" />

                      <button
                        type="button"
                        className="security-admin-image-delete"
                        onClick={() => deleteImage(image)}
                        disabled={imageDeleting === image.id}
                        aria-label="Delete image"
                      >
                        {imageDeleting === image.id ? (
                          <Loader2 size={15} className="security-admin-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {additionalPreviews.length > 0 && (
                <div className="security-admin-pending-images">
                  {additionalPreviews.map((preview, index) => (
                    <div className="security-admin-image-card" key={preview}>
                      <img src={preview} alt="Pending upload" />

                      <button
                        type="button"
                        className="security-admin-image-delete"
                        onClick={() => removePendingImage(index)}
                        aria-label="Remove pending image"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!editingId && additionalPreviews.length === 0 && (
                <div className="security-admin-empty-images">
                  <ImagePlus size={21} />
                  <span>No additional images selected.</span>
                </div>
              )}
            </div>

            <div className="security-admin-form-actions">
              <button
                className="security-admin-secondary"
                type="button"
                onClick={resetEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="security-admin-save"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="security-admin-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {editingId ? "Save Changes" : "Save Team Member"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="security-admin-members">
          <div className="security-admin-section-heading">
            <div>
              <span className="security-admin-kicker">Directory</span>
              <h2>All Security Team Members</h2>
            </div>

            <span className="security-admin-count">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          {loading ? (
            <div className="security-admin-loading">
              <Loader2 size={22} className="security-admin-spin" />
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="security-admin-empty">
              <ShieldCheck size={28} />
              <h3>No team members yet</h3>
              <p>Add the first Security Team member above.</p>
            </div>
          ) : (
            <div className="security-admin-member-list">
              {members.map((member) => (
                <article className="security-admin-member-card" key={member.id}>
                  <div className="security-admin-member-photo">
                    {member.profile_image_url || member.image_url ? (
                      <img
                        src={member.profile_image_url || member.image_url}
                        alt={member.name || "Team member"}
                      />
                    ) : (
                      <ShieldCheck size={28} />
                    )}
                  </div>

                  <div className="security-admin-member-main">
                    <div className="security-admin-member-title">
                      <div>
                        <h3>{member.name || "Unnamed Member"}</h3>
                        <span>{member.role || "Security Professional"}</span>
                      </div>

                      <span className="security-admin-status">
                        <Check size={13} />
                        Active
                      </span>
                    </div>

                    <p>
                      {member.description ||
                        "No profile description has been added yet."}
                    </p>

                    <div className="security-admin-member-meta">
                      <span>
                        {Array.isArray(member.images)
                          ? member.images.length
                          : 0}{" "}
                        additional images
                      </span>

                      {member.github_url && <span>GitHub</span>}
                      {member.linkedin_url && <span>LinkedIn</span>}
                      {member.portfolio_url && <span>Portfolio</span>}
                    </div>
                  </div>

                  <div className="security-admin-member-actions">
                    <button
                      className="security-admin-secondary"
                      type="button"
                      onClick={() => startEdit(member)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="security-admin-danger"
                      type="button"
                      onClick={() => setDeleteTarget(member)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <div className="security-admin-modal-backdrop">
          <div className="security-admin-confirm">
            <div className="security-admin-confirm-icon">
              <Trash2 size={22} />
            </div>

            <h2>Delete team member?</h2>

            <p>
              This will permanently remove{" "}
              <strong>{deleteTarget.name || "this member"}</strong> and their
              associated gallery images.
            </p>

            <div className="security-admin-form-actions">
              <button
                className="security-admin-secondary"
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="security-admin-danger security-admin-danger-solid"
                type="button"
                onClick={deleteMember}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={17} className="security-admin-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
