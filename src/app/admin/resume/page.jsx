"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:5000/api/resume";

export default function ResumePage() {
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // FETCH CURRENT RESUME
  // ======================================================

  const fetchResume = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await fetch(API_URL, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch resume"
        );
      }

      setResume(data.resume || null);
    } catch (err) {
      console.error("Fetch Resume Error:", err);

      setError(
        err.message || "Failed to load resume."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  // ======================================================
  // CLEAR MESSAGES
  // ======================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ======================================================
  // FILE SELECT
  // ======================================================

  const handleFileChange = (e) => {
    clearMessages();

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // PDF validation
    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are allowed.");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // 5 MB validation
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("PDF size must be less than 5MB.");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
  };

  // ======================================================
  // REMOVE SELECTED FILE
  // ======================================================

  const removeSelectedFile = () => {
    setFile(null);
    clearMessages();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================================
  // UPLOAD / REPLACE RESUME
  // ======================================================

  const handleUpload = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Please login as admin first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("resume", file);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Resume upload failed."
        );
      }

      setResume(data.resume || null);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        "Resume uploaded successfully."
      );
    } catch (err) {
      console.error("Upload Resume Error:", err);

      setError(
        err.message || "Resume upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE RESUME
  // ======================================================

  const handleDelete = async () => {
    if (!resume) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete the current resume?"
    );

    if (!confirmed) return;

    clearMessages();

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Please login as admin first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete resume."
        );
      }

      setResume(null);

      setMessage(
        "Resume deleted successfully."
      );
    } catch (err) {
      console.error("Delete Resume Error:", err);

      setError(
        err.message || "Failed to delete resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FORMAT FILE SIZE
  // ======================================================

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) {
      return `${bytes} Bytes`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">

      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl text-black shadow-xl">
              📄
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Resume Management
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Upload and manage your portfolio resume.
              </p>
            </div>

          </div>

          <button
            onClick={fetchResume}
            disabled={fetching}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fetching ? "Refreshing..." : "↻ Refresh"}
          </button>

        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 font-bold">
              ✓
            </span>

            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 font-bold">
              !
            </span>

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==================================================
              UPLOAD CARD
          ================================================== */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl sm:p-6">

            <div className="mb-6">

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                  ⬆️
                </div>

                <h2 className="text-xl font-bold">
                  Upload Resume
                </h2>

              </div>

              <p className="text-sm leading-6 text-slate-400">
                Upload your latest resume. If a resume already
                exists, the new file will replace it.
              </p>

            </div>

            <form onSubmit={handleUpload}>

              {/* FILE DROP AREA */}

              <label
                htmlFor="resumeFile"
                className="group flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 p-6 text-center transition hover:border-white/30 hover:bg-white/[0.04]"
              >

                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.06] text-4xl transition group-hover:scale-105">
                  📄
                </div>

                <p className="font-semibold text-white">
                  {file
                    ? file.name
                    : "Click to select your resume"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  PDF format only • Maximum 5MB
                </p>

                <span className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400">
                  Choose PDF
                </span>

              </label>

              <input
                ref={fileInputRef}
                id="resumeFile"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* SELECTED FILE */}

              {file && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                      PDF
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-white">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/5 hover:text-white"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )}

              {/* UPLOAD BUTTON */}

              <button
                type="submit"
                disabled={!file || loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-black transition hover:scale-[1.01] hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Uploading...
                  </>
                ) : resume ? (
                  <>
                    🔄 Replace Resume
                  </>
                ) : (
                  <>
                    ⬆️ Upload Resume
                  </>
                )}

              </button>

            </form>

            {/* SECURITY INFO */}

            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">

              <p className="text-xs font-semibold text-slate-400">
                Upload requirements
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li>✓ PDF file only</li>
                <li>✓ Maximum file size: 5MB</li>
                <li>✓ Latest upload replaces the previous resume</li>
              </ul>

            </div>

          </section>

          {/* ==================================================
              CURRENT RESUME
          ================================================== */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl sm:p-6">

            <div className="mb-6">

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                  📋
                </div>

                <h2 className="text-xl font-bold">
                  Current Resume
                </h2>

              </div>

              <p className="text-sm leading-6 text-slate-400">
                Your currently active portfolio resume.
              </p>

            </div>

            {/* LOADING */}

            {fetching ? (

              <div className="flex min-h-60 items-center justify-center rounded-2xl border border-white/10 bg-black/20">

                <div className="text-center">

                  <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-white" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading resume...
                  </p>

                </div>

              </div>

            ) : resume ? (

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                {/* RESUME ICON + INFO */}

                <div className="flex items-start gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-2xl font-bold text-red-400">
                    PDF
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="break-all text-base font-bold text-white">
                      {resume.fileName || "My Resume.pdf"}
                    </h3>

                    <div className="mt-2 space-y-1">

                      <p className="text-xs text-emerald-400">
                        ● Resume is active
                      </p>

                      {resume.uploadedAt && (
                        <p className="text-xs text-slate-500">
                          Uploaded:{" "}
                          {formatDate(
                            resume.uploadedAt
                          )}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

                {/* PREVIEW */}

                {resume.fileUrl && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white">

                    <iframe
                      src={resume.fileUrl}
                      title="Resume Preview"
                      className="h-[420px] w-full"
                    />

                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {resume.fileUrl && (
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-black transition hover:bg-slate-200"
                    >
                      ↗ Open PDF
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    🗑 Delete Resume
                  </button>

                </div>

              </div>

            ) : (

              <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 px-6 text-center">

                <div className="mb-5 text-5xl">
                  📭
                </div>

                <p className="font-semibold text-slate-300">
                  No resume uploaded
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Upload your resume from the left panel.
                  Your visitors will be able to access the
                  latest uploaded version.
                </p>

              </div>

            )}

          </section>

        </div>

        {/* ==================================================
            FOOTER INFO
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">

          <p className="text-xs text-slate-600">
            Resume Management • Admin Only
          </p>

        </div>

      </div>

    </main>
  );
}