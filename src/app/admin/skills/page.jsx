"use client";

import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/skills";

const predefinedSkills = [
  // Frontend
  { name: "HTML", category: "Frontend", level: 90, icon: "🌐" },
  { name: "CSS", category: "Frontend", level: 85, icon: "🎨" },
  { name: "JavaScript", category: "Frontend", level: 85, icon: "⚡" },
  { name: "React.js", category: "Frontend", level: 80, icon: "⚛️" },
  { name: "Next.js", category: "Frontend", level: 80, icon: "▲" },
  { name: "Tailwind CSS", category: "Frontend", level: 85, icon: "🌊" },
  { name: "Bootstrap", category: "Frontend", level: 85, icon: "🅱️" },

  // Backend
  { name: "Node.js", category: "Backend", level: 80, icon: "🟢" },
  { name: "Express.js", category: "Backend", level: 80, icon: "🚀" },

  // Database
  { name: "MongoDB", category: "Database", level: 80, icon: "🍃" },

  // Tools
  { name: "Git", category: "Tools", level: 80, icon: "🔧" },
  { name: "GitHub", category: "Tools", level: 85, icon: "🐙" },
];

const emptyForm = {
  name: "",
  category: "",
  level: 80,
  icon: "",
  featured: false,
};

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FETCH SKILLS
  // =====================================================

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load skills"
        );
      }

      setSkills(data.skills || []);
    } catch (err) {
      console.error("Fetch Skills Error:", err);

      setError(
        err.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // =====================================================
  // FORM CHANGE
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
          : name === "level"
          ? Number(value)
          : value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  // =====================================================
  // TOGGLE PREDEFINED SKILL
  // =====================================================

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter(
          (name) => name !== skillName
        );
      }

      return [...prev, skillName];
    });

    setMessage("");
    setError("");
  };

  // =====================================================
  // CHECK IF SKILL EXISTS
  // =====================================================

  const skillExists = (skillName) => {
    return skills.some(
      (existing) =>
        existing.name?.toLowerCase() ===
        skillName.toLowerCase()
    );
  };

  // =====================================================
  // SELECT ALL AVAILABLE
  // =====================================================

  const selectAll = () => {
    const availableSkills =
      predefinedSkills
        .filter(
          (skill) =>
            !skillExists(skill.name)
        )
        .map((skill) => skill.name);

    setSelectedSkills(
      availableSkills
    );

    setMessage(
      availableSkills.length
        ? `${availableSkills.length} skills selected.`
        : "All predefined skills are already added."
    );

    setError("");
  };

  // =====================================================
  // CLEAR SELECTION
  // =====================================================

  const clearSelection = () => {
    setSelectedSkills([]);
    setMessage("");
    setError("");
  };

  // =====================================================
  // ADD PREDEFINED SKILLS
  // =====================================================

  const addSelectedSkills = async () => {
    if (selectedSkills.length === 0) {
      setError(
        "Please select at least one skill."
      );
      setMessage("");
      return;
    }

    try {
      setAdding(true);
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

      const skillsToAdd =
        predefinedSkills.filter(
          (skill) =>
            selectedSkills.includes(
              skill.name
            )
        );

      const newSkills =
        skillsToAdd.filter(
          (skill) =>
            !skillExists(skill.name)
        );

      if (newSkills.length === 0) {
        setError(
          "Selected skills already exist."
        );

        setSelectedSkills([]);
        return;
      }

      const results =
        await Promise.all(
          newSkills.map(
            async (skill) => {
              return fetch(API, {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  name: skill.name,
                  category:
                    skill.category,
                  level: Number(
                    skill.level
                  ),
                  icon: skill.icon,
                  featured: false,
                }),
              });
            }
          )
        );

      const failed =
        results.filter(
          (response) =>
            !response.ok
        );

      if (failed.length > 0) {
        setError(
          `${failed.length} skill(s) could not be added.`
        );
      } else {
        setMessage(
          `${newSkills.length} skill(s) added successfully.`
        );
      }

      setSelectedSkills([]);

      await fetchSkills();
    } catch (err) {
      console.error(
        "Add Skills Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while adding skills."
      );
    } finally {
      setAdding(false);
    }
  };

  // =====================================================
  // ADD / UPDATE CUSTOM SKILL
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError(
        "Skill name is required."
      );
      return;
    }

    if (!form.category.trim()) {
      setError(
        "Skill category is required."
      );
      return;
    }

    if (
      Number(form.level) < 0 ||
      Number(form.level) > 100
    ) {
      setError(
        "Skill level must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          "adminToken"
        );

      if (!token) {
        throw new Error(
          "Please login as admin first."
        );
      }

      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            category:
              form.category.trim(),
            level: Number(
              form.level
            ),
            icon: form.icon.trim(),
            featured:
              form.featured,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Something went wrong"
        );
      }

      setMessage(
        editingId
          ? "Skill updated successfully."
          : "Skill added successfully."
      );

      resetForm();

      await fetchSkills();
    } catch (err) {
      console.error(
        "Save Skill Error:",
        err
      );

      setError(
        err.message ||
          "Unable to save skill."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT SKILL
  // =====================================================

  const editSkill = (skill) => {
    setEditingId(skill._id);

    setForm({
      name: skill.name || "",
      category:
        skill.category || "",
      level:
        typeof skill.level ===
        "number"
          ? skill.level
          : 80,
      icon: skill.icon || "",
      featured:
        skill.featured || false,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE SKILL
  // =====================================================

  const deleteSkill = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this skill?"
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

      const response =
        await fetch(
          `${API}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete skill"
        );
      }

      setMessage(
        "Skill deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await fetchSkills();
    } catch (err) {
      console.error(
        "Delete Skill Error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete skill."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        skills
          .map(
            (skill) =>
              skill.category
          )
          .filter(Boolean)
      ),
    ];

    return ["All", ...unique];
  }, [skills]);

  // =====================================================
  // FILTERED SKILLS
  // =====================================================

  const filteredSkills =
    useMemo(() => {
      return skills.filter(
        (skill) => {
          const matchesSearch =
            skill.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            skill.category
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesCategory =
            categoryFilter ===
              "All" ||
            skill.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      skills,
      search,
      categoryFilter,
    ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const featuredCount =
    skills.filter(
      (skill) =>
        skill.featured
    ).length;

  const frontendCount =
    skills.filter(
      (skill) =>
        skill.category?.toLowerCase() ===
        "frontend"
    ).length;

  const backendCount =
    skills.filter(
      (skill) =>
        skill.category?.toLowerCase() ===
        "backend"
    ).length;

  // =====================================================
  // CATEGORY STYLE
  // =====================================================

  const getCategoryStyle = (
    category
  ) => {
    switch (
      category?.toLowerCase()
    ) {
      case "frontend":
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";

      case "backend":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      case "database":
        return "border-purple-400/20 bg-purple-400/10 text-purple-300";

      case "tools":
        return "border-orange-400/20 bg-orange-400/10 text-orange-300";

      default:
        return "border-white/10 bg-white/5 text-slate-300";
    }
  };

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

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-black">
                  ⚡
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-400">
                  Portfolio Management
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Skills
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Add, edit and manage the technical skills displayed on your portfolio.
              </p>

            </div>

            <button
              type="button"
              onClick={
                fetchSkills
              }
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
                : "Refresh Skills"}
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

            <span>
              {message}
            </span>
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
            STATISTICS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon="⚡"
            label="Total Skills"
            value={skills.length}
          />

          <StatCard
            icon="⭐"
            label="Featured"
            value={featuredCount}
          />

          <StatCard
            icon="🎨"
            label="Frontend"
            value={frontendCount}
          />

          <StatCard
            icon="🚀"
            label="Backend"
            value={backendCount}
          />

        </div>

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl">

          {/* HEADER */}

          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                  {editingId
                    ? "✏️"
                    : "➕"}
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    {editingId
                      ? "Edit Skill"
                      : "Add Custom Skill"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {editingId
                      ? "Update the selected skill."
                      : "Add any skill that is not available in Quick Add."}
                  </p>

                </div>

              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMessage("");
                    setError("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel Editing
                </button>
              )}

            </div>

          </div>

          {/* FORM */}

          <div className="p-5 sm:p-6">

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="grid gap-5 lg:grid-cols-2">

                {/* NAME */}

                <div>

                  <FieldLabel>
                    Skill Name *
                  </FieldLabel>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: TypeScript"
                    required
                    className="input"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <FieldLabel>
                    Category *
                  </FieldLabel>

                  <input
                    type="text"
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Frontend"
                    required
                    className="input"
                  />

                </div>

                {/* LEVEL */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <FieldLabel>
                      Skill Level
                    </FieldLabel>

                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-sm font-bold">
                      {form.level}%
                    </span>

                  </div>

                  <input
                    type="range"
                    name="level"
                    min="0"
                    max="100"
                    value={
                      form.level
                    }
                    onChange={
                      handleChange
                    }
                    className="h-2 w-full cursor-pointer accent-white"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span>
                      Beginner
                    </span>

                    <span>
                      Intermediate
                    </span>

                    <span>
                      Expert
                    </span>
                  </div>

                </div>

                {/* ICON */}

                <div>

                  <FieldLabel>
                    Icon / Emoji
                  </FieldLabel>

                  <input
                    type="text"
                    name="icon"
                    value={
                      form.icon
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: 🐍"
                    className="input"
                  />

                </div>

                {/* FEATURED */}

                <div className="lg:col-span-2">

                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.04]">

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
                        Featured Skill
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Highlight this skill on your public portfolio.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              {/* BUTTON */}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

                {editingId && (
                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    className="rounded-xl border border-white/10 px-7 py-3 font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-xl bg-white px-8 py-3 font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Skill"
                    : "Add Skill"}
                </button>

              </div>

            </form>

          </div>

        </section>

        {/* =================================================
            QUICK ADD
        ================================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Quick Add Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select multiple predefined skills and add them together.
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    selectAll
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.08]"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    clearSelection
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Clear
                </button>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {predefinedSkills.map(
                (skill) => {
                  const selected =
                    selectedSkills.includes(
                      skill.name
                    );

                  const alreadyExists =
                    skillExists(
                      skill.name
                    );

                  return (
                    <button
                      type="button"
                      key={
                        skill.name
                      }
                      disabled={
                        alreadyExists
                      }
                      onClick={() =>
                        toggleSkill(
                          skill.name
                        )
                      }
                      className={`group rounded-2xl border p-4 text-left transition ${
                        alreadyExists
                          ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                          : selected
                          ? "border-white/30 bg-white/[0.08] shadow-lg"
                          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                            {
                              skill.icon
                            }
                          </div>

                          <div>

                            <h3 className="font-semibold">
                              {
                                skill.name
                              }
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                skill.category
                              }
                            </p>

                          </div>

                        </div>

                        <div>

                          {alreadyExists ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
                              ADDED
                            </span>
                          ) : selected ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                              ✓
                            </span>
                          ) : (
                            <span className="text-xl text-slate-600 transition group-hover:text-white">
                              +
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="mt-4">

                        <div className="mb-2 flex justify-between text-xs">

                          <span className="text-slate-500">
                            Level
                          </span>

                          <span className="font-semibold text-slate-300">
                            {
                              skill.level
                            }%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                          <div
                            className="h-full rounded-full bg-white transition-all"
                            style={{
                              width: `${skill.level}%`,
                            }}
                          />

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            {/* SELECTED */}

            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-semibold">
                    {selectedSkills.length}{" "}
                    selected
                  </p>

                  {selectedSkills.length >
                    0 && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {selectedSkills.join(
                        ", "
                      )}
                    </p>
                  )}

                </div>

                <button
                  type="button"
                  onClick={
                    addSelectedSkills
                  }
                  disabled={
                    adding ||
                    selectedSkills.length ===
                      0
                  }
                  className="rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {adding
                    ? "Adding Skills..."
                    : `Add Selected (${selectedSkills.length})`}
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            EXISTING SKILLS
        ================================================= */}

        <section>

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Existing Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the skills currently stored in your portfolio.
              </p>

            </div>

            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-white">
                {
                  filteredSkills.length
                }
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {skills.length}
              </span>
            </div>

          </div>

          {/* SEARCH + FILTER */}

          {!loading &&
            skills.length > 0 && (
              <div className="mb-6 flex flex-col gap-3 md:flex-row">

                <div className="relative flex-1">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={
                      search
                    }
                    onChange={(e) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search skills..."
                    className="input pl-11"
                  />

                </div>

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target
                        .value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

              </div>
            )}

          {/* LOADING */}

          {loading ? (

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">

              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-white" />

              <p className="mt-5 text-sm text-slate-500">
                Loading skills...
              </p>

            </div>

          ) : skills.length === 0 ? (

            /* EMPTY */

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-4xl">
                ⚡
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No Skills Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first skill using Custom Skill or Quick Add above.
              </p>

            </div>

          ) : filteredSkills.length ===
            0 ? (

            /* NO SEARCH RESULTS */

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="text-4xl">
                🔎
              </div>

              <h3 className="mt-4 text-lg font-bold">
                No matching skills
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter(
                    "All"
                  );
                }}
                className="mt-5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/5"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            /* SKILL GRID */

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {filteredSkills.map(
                (skill) => (
                  <SkillCard
                    key={
                      skill._id
                    }
                    skill={
                      skill
                    }
                    deleting={
                      deletingId ===
                      skill._id
                    }
                    categoryStyle={getCategoryStyle(
                      skill.category
                    )}
                    onEdit={
                      editSkill
                    }
                    onDelete={
                      deleteSkill
                    }
                  />
                )
              )}

            </div>

          )}

        </section>

      </div>

      {/* ===================================================
          LOCAL INPUT STYLE
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
// SKILL CARD
// =========================================================

function SkillCard({
  skill,
  deleting,
  categoryStyle,
  onEdit,
  onDelete,
}) {
  const level =
    Number(skill.level) || 0;

  return (
    <article className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">

      {/* TOP */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
            {skill.icon || "💻"}
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-lg font-bold">
              {skill.name}
            </h3>

            <span
              className={`mt-1 inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${categoryStyle}`}
            >
              {skill.category ||
                "Other"}
            </span>

          </div>

        </div>

        {skill.featured && (
          <span
            title="Featured skill"
            className="shrink-0 text-lg"
          >
            ⭐
          </span>
        )}

      </div>

      {/* LEVEL */}

      <div className="mt-6">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs font-medium text-slate-500">
            Skill Level
          </span>

          <span className="text-sm font-bold">
            {level}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  level
                )
              )}%`,
            }}
          />

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">

        <button
          type="button"
          onClick={() =>
            onEdit(skill)
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
              skill._id
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

    </article>
  );
}