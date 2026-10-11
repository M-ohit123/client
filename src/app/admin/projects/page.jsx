"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  technologies: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/projects`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load projects"
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Projects Error:", err);

      setError(
        err.message || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // ADD / UPDATE PROJECT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Please login as admin first."
        );
      }

      if (!form.title.trim()) {
        throw new Error(
          "Project title is required."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "Project description is required."
        );
      }

      const technologies =
        form.technologies
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const projectData = {
        title: form.title.trim(),
        description:
          form.description.trim(),
        image: form.image.trim(),
        technologies,
        liveUrl:
          form.liveUrl.trim(),
        githubUrl:
          form.githubUrl.trim(),
        featured: form.featured,
      };

      const url = editingId
        ? `${API}/projects/${editingId}`
        : `${API}/projects`;

      const method = editingId
        ? "PUT"
        : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          projectData
        ),
      });

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Something went wrong"
        );
      }

      setMessage(
        editingId
          ? "Project updated successfully."
          : "Project added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);

      await fetchProjects();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (project) => {
    setEditingId(project._id);

    setForm({
      title: project.title || "",
      description:
        project.description || "",
      image: project.image || "",

      technologies:
        Array.isArray(
          project.technologies
        )
          ? project.technologies.join(
              ", "
            )
          : "",

      liveUrl:
        project.liveUrl || "",

      githubUrl:
        project.githubUrl || "",

      featured:
        project.featured || false,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Please login as admin first."
        );
      }

      const res = await fetch(
        `${API}/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to delete project"
        );
      }

      setMessage(
        "Project deleted successfully."
      );

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await fetchProjects();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const featuredCount =
    projects.filter(
      (project) =>
        project.featured
    ).length;

  const projectsWithLiveDemo =
    projects.filter(
      (project) =>
        project.liveUrl
    ).length;

  const projectsWithGithub =
    projects.filter(
      (project) =>
        project.githubUrl
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-black shadow-lg">
                  💼
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-400">
                  Portfolio Management
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Projects
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Create, update and manage the projects displayed on your portfolio.
              </p>

            </div>

            <button
              type="button"
              onClick={fetchProjects}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <span
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {loading
                ? "Refreshing..."
                : "Refresh Projects"}
            </button>

          </div>

        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
            <span className="text-lg">
              ✓
            </span>

            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            <span className="text-lg">
              !
            </span>

            <div>
              <p className="font-semibold">
                Error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon="💼"
            label="Total Projects"
            value={projects.length}
          />

          <StatCard
            icon="⭐"
            label="Featured"
            value={featuredCount}
          />

          <StatCard
            icon="🌐"
            label="Live Demos"
            value={
              projectsWithLiveDemo
            }
          />

          <StatCard
            icon="⌘"
            label="GitHub Links"
            value={
              projectsWithGithub
            }
          />

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl">

          {/* FORM HEADER */}

          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                    {editingId
                      ? "✏️"
                      : "➕"}
                  </div>

                  <div>

                    <h2 className="text-xl font-bold">
                      {editingId
                        ? "Edit Project"
                        : "Add New Project"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {editingId
                        ? "Update the selected project."
                        : "Add a new project to your portfolio."}
                    </p>

                  </div>

                </div>

              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel Editing
                </button>
              )}

            </div>

          </div>

          {/* FORM BODY */}

          <div className="p-5 sm:p-6">

            <form
              onSubmit={handleSubmit}
            >

              <div className="grid gap-5 lg:grid-cols-2">

                {/* TITLE */}

                <div className="lg:col-span-2">

                  <FieldLabel>
                    Project Title *
                  </FieldLabel>

                  <input
                    type="text"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. College Inventory Management System"
                    required
                    className="input"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="lg:col-span-2">

                  <FieldLabel>
                    Description *
                  </FieldLabel>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={6}
                    required
                    placeholder="Explain what the project does, the problem it solves and the main features..."
                    className="input resize-none"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Keep the description clear and professional.
                  </p>

                </div>

                {/* IMAGE */}

                <div className="lg:col-span-2">

                  <FieldLabel>
                    Project Image URL
                  </FieldLabel>

                  <input
                    type="url"
                    name="image"
                    value={
                      form.image
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://i.ibb.co/example/project.jpg"
                    className="input"
                  />

                  {form.image && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">

                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Image Preview
                        </p>
                      </div>

                      <div className="p-3">

                        <img
                          src={
                            form.image
                          }
                          alt="Project preview"
                          className="h-56 w-full rounded-xl object-cover"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              "none";

                            const parent =
                              e.currentTarget.parentElement;

                            if (
                              parent &&
                              !parent.querySelector(
                                ".image-error"
                              )
                            ) {
                              const div =
                                document.createElement(
                                  "div"
                                );

                              div.className =
                                "image-error flex h-56 items-center justify-center rounded-xl bg-red-500/5 text-sm text-red-400";

                              div.innerText =
                                "Image could not be loaded";

                              parent.appendChild(
                                div
                              );
                            }
                          }}
                        />

                      </div>

                    </div>
                  )}

                </div>

                {/* TECHNOLOGIES */}

                <div>

                  <FieldLabel>
                    Technologies
                  </FieldLabel>

                  <input
                    type="text"
                    name="technologies"
                    value={
                      form.technologies
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Next.js, React, Node.js, MongoDB"
                    className="input"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Separate each technology with a comma.
                  </p>

                </div>

                {/* LIVE URL */}

                <div>

                  <FieldLabel>
                    Live Demo URL
                  </FieldLabel>

                  <input
                    type="url"
                    name="liveUrl"
                    value={
                      form.liveUrl
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://myproject.com"
                    className="input"
                  />

                </div>

                {/* GITHUB */}

                <div>

                  <FieldLabel>
                    GitHub URL
                  </FieldLabel>

                  <input
                    type="url"
                    name="githubUrl"
                    value={
                      form.githubUrl
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://github.com/username/project"
                    className="input"
                  />

                </div>

                {/* FEATURED */}

                <div className="flex items-center">

                  <label className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.04]">

                    <input
                      type="checkbox"
                      name="featured"
                      checked={
                        form.featured
                      }
                      onChange={
                        handleChange
                      }
                      className="h-5 w-5 accent-white"
                    />

                    <div>

                      <p className="font-semibold text-slate-200">
                        Featured Project
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Highlight this project on the public portfolio.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              {/* SUBMIT */}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

                {editingId && (
                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    className="rounded-xl border border-white/10 px-7 py-3 font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-white px-8 py-3 font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Project"
                    : "Add Project"}
                </button>

              </div>

            </form>

          </div>

        </section>

        {/* =================================================
            ALL PROJECTS
        ================================================= */}

        <section>

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Projects currently stored in your portfolio database.
              </p>

            </div>

            <p className="text-sm text-slate-500">
              {projects.length}{" "}
              {projects.length === 1
                ? "project"
                : "projects"}
            </p>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">

              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-white" />

              <p className="mt-5 text-sm text-slate-500">
                Loading projects...
              </p>

            </div>

          ) : projects.length === 0 ? (

            /* EMPTY */

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-4xl">
                💼
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No Projects Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your portfolio does not have any projects yet. Add your first project using the form above.
              </p>

            </div>

          ) : (

            /* PROJECT GRID */

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {projects.map(
                (project) => (
                  <ProjectCard
                    key={
                      project._id
                    }
                    project={
                      project
                    }
                    deleting={
                      deletingId ===
                      project._id
                    }
                    onEdit={
                      handleEdit
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                )
              )}

            </div>

          )}

        </section>

      </div>

      {/* ===================================================
          CUSTOM STYLES
      =================================================== */}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          padding: 0.85rem 1rem;
          color: white;
          outline: none;
          transition: 0.2s ease;
        }

        .input::placeholder {
          color: rgb(71 85 105);
        }

        .input:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>

    </main>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05] sm:p-5">

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold sm:text-3xl">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

// =========================================================
// FIELD LABEL
// =========================================================

function FieldLabel({
  children,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-300">
      {children}
    </label>
  );
}

// =========================================================
// PROJECT CARD
// =========================================================

function ProjectCard({
  project,
  deleting,
  onEdit,
  onDelete,
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">

      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-black/30">

        {project.image ? (

          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

        ) : (

          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-transparent">

            <div className="text-5xl">
              💼
            </div>

          </div>

        )}

        {/* IMAGE OVERLAY */}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* FEATURED */}

        {project.featured && (
          <span className="absolute right-4 top-4 rounded-full border border-yellow-400/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-yellow-300 backdrop-blur">
            ⭐ Featured
          </span>
        )}

      </div>

      {/* CONTENT */}

      <div className="p-5">

        <h3 className="line-clamp-1 text-xl font-bold">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
          {project.description}
        </p>

        {/* TECHNOLOGIES */}

        {project.technologies?.length >
          0 && (
          <div className="mt-4 flex flex-wrap gap-2">

            {project.technologies
              .slice(0, 6)
              .map(
                (tech, index) => (
                  <span
                    key={`${tech}-${index}`}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300"
                  >
                    {tech}
                  </span>
                )
              )}

            {project
              .technologies
              .length > 6 && (
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-500">
                +
                {project
                  .technologies
                  .length -
                  6}
              </span>
            )}

          </div>
        )}

        {/* LINKS */}

        {(project.liveUrl ||
          project.githubUrl) && (
          <div className="mt-5 flex gap-2">

            {project.liveUrl && (
              <a
                href={
                  project.liveUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold text-black transition hover:bg-slate-200"
              >
                Live Demo ↗
              </a>
            )}

            {project.githubUrl && (
              <a
                href={
                  project.githubUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-center text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                GitHub ↗
              </a>
            )}

          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">

          <button
            type="button"
            onClick={() =>
              onEdit(project)
            }
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                project._id
              )
            }
            disabled={deleting}
            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting
              ? "Deleting..."
              : "🗑 Delete"}
          </button>

        </div>

      </div>

    </article>
  );
}