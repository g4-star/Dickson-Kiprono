import { useState } from "react";
import {
  Bot,
  X,
  FileText,
  Eye,
  Download,
  ArrowUpRight,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import "./CVAssistant.css";

export default function CVAssistant() {
  const [open, setOpen] = useState(false);
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openAssistant() {
    setOpen(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public-profile", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load the CV.");
      }

      setCv(
        data.cv_url
          ? {
              url: data.cv_url,
              name: data.cv_file_name || "Dickson-Kiprono-CV.pdf",
              type: data.cv_file_type || "application/pdf",
            }
          : null
      );
    } catch (err) {
      setCv(null);
      setError(
        err?.message || "Unable to load the CV right now."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadUrl(url) {
    const target = new URL(url);
    target.searchParams.set("download", "1");
    return target.toString();
  }

  return (
    <div className="cv-assistant">
      {open && (
        <section
          className="cv-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cv-assistant-title"
        >
          <header className="cv-assistant-header">
            <div className="cv-assistant-avatar">
              <Bot size={22} />
            </div>

            <div className="cv-assistant-heading">
              <strong id="cv-assistant-title">CV Assistant</strong>
              <span>
                <span className="cv-assistant-status-dot" />
                Portfolio document assistant
              </span>
            </div>

            <button
              type="button"
              className="cv-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close CV assistant"
            >
              <X size={19} />
            </button>
          </header>

          <div className="cv-assistant-conversation">
            <div className="cv-assistant-message">
              Hello! I'm Dickson's CV assistant. How would you
              like to explore his professional CV?
            </div>

            {loading ? (
              <div className="cv-assistant-state" role="status">
                <LoaderCircle size={19} className="cv-assistant-spin" />
                Checking the latest published CV…
              </div>
            ) : error ? (
              <div className="cv-assistant-state cv-assistant-error">
                <p>{error}</p>
                <button
                  type="button"
                  className="cv-assistant-retry"
                  onClick={openAssistant}
                >
                  <RefreshCw size={15} /> Try again
                </button>
              </div>
            ) : cv ? (
              <>
                <div className="cv-assistant-document">
                  <div className="cv-assistant-file-icon">
                    <FileText size={24} />
                  </div>
                  <div className="cv-assistant-file-info">
                    <strong>Professional CV</strong>
                    <span>{cv.name}</span>
                    <small>Latest published version</small>
                  </div>
                </div>

                <p className="cv-assistant-question">
                  What would you like to do?
                </p>

                <div className="cv-assistant-actions">
                  <a
                    href={cv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-assistant-action cv-assistant-view"
                    onClick={() => setOpen(false)}
                  >
                    <Eye size={17} />
                    <span>
                      <strong>View CV</strong>
                      <small>Open in a new tab</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </a>

                  <a
                    href={downloadUrl(cv.url)}
                    download={cv.name}
                    className="cv-assistant-action cv-assistant-download"
                  >
                    <Download size={17} />
                    <span>
                      <strong>Download CV</strong>
                      <small>Save a copy to your device</small>
                    </span>
                  </a>
                </div>
              </>
            ) : (
              <div className="cv-assistant-state">
                <FileText size={22} />
                <p>
                  The CV is temporarily unavailable. Please check
                  back later.
                </p>
              </div>
            )}
          </div>

          <footer className="cv-assistant-footer">
            <span>POWERED BY DICKSON'S PORTFOLIO</span>
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`cv-assistant-launcher ${open ? "is-open" : ""}`}
        onClick={open ? () => setOpen(false) : openAssistant}
        aria-expanded={open}
        aria-label={open ? "Close CV assistant" : "Open CV assistant"}
      >
        {open ? <X size={19} /> : <FileText size={20} />}
        <span>CV</span>
        {!open && <span className="cv-assistant-launcher-dot" />}
      </button>
    </div>
  );
}
