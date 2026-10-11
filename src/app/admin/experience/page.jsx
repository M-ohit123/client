"use client";

import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/experience";

const EMPTY_FORM = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  technologies: "",
  current: false,
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [form, setForm] = useState(EMPTY_FORM);

  // =========================
  // FETCH EXPERIENCES
  // =========================

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load experiences");
      }

      setExperiences(data.experiences || []);
    } catch (error) {
      console.error("Fetch Experience Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (!form.company.trim()) {
      setMessage({
        type: "error",
        text: "Please enter company / organization name.",
      });
      return;
    }

    if (!form.role.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your role / position.",
      });
      return;
    }

    if (!form.startDate) {
      setMessage({
        type: "error",
        text: "Please select start date.",
      });
      return;
    }

    if (!form.current && form.endDate && form.endDate < form.startDate) {
      setMessage({
        type: "error",
        text: "End date cannot be before start date.",
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication token not found. Please login again.",
        });
        return;
      }

      const technologiesArray = form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: form.company.trim(),
          role: form.role.trim(),
          location: form.location.trim(),
          startDate: form.startDate,
          endDate: form.current ? "" : form.endDate,
          description: form.description.trim(),
          technologies: technologiesArray,
          current: form.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Experience updated successfully."
          : "Experience added successfully.",
      });

      resetForm(false);

      await fetchExperiences();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Save Experience Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to save experience.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const editExperience = (experience) => {
    setEditingId(experience._id);

    setForm({
      company: experience.company || "",
      role: experience.role || "",
      location: experience.location || "",
      startDate: experience.startDate
        ? experience.startDate.substring(0, 10)
        : "",
      endDate: experience.endDate
        ? experience.endDate.substring(0, 10)
        : "",
      description: experience.description || "",
      technologies: Array.isArray(experience.technologies)
        ? experience.technologies.join(", ")
        : "",
      current: Boolean(experience.current),
    });

    setMessage({
      type: "",
      text: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const deleteExperience = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication token not found. Please login again.",
        });
        return;
      }

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete experience");
      }

      if (editingId === id) {
        resetForm(false);
      }

      setMessage({
        type: "success",
        text: "Experience deleted successfully.",
      });

      await fetchExperiences();
    } catch (error) {
      console.error("Delete Experience Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to delete experience.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = (clearMessage = true) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });

    if (clearMessage) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "Present";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    const current = experiences.filter(
      (experience) => experience.current
    ).length;

    const previous = experiences.filter(
      (experience) => !experience.current
    ).length;

    const allTechnologies = experiences.flatMap((experience) =>
      Array.isArray(experience.technologies)
        ? experience.technologies
        : []
    );

    const uniqueTechnologies = new Set(
      allTechnologies
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    );

    return {
      total: experiences.length,
      current,
      previous,
      technologies: uniqueTechnologies.size,
    };
  }, [experiences]);

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredExperiences = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return experiences.filter((experience) => {
      const matchesSearch =
        !searchText ||
        experience.company?.toLowerCase().includes(searchText) ||
        experience.role?.toLowerCase().includes(searchText) ||
        experience.location?.toLowerCase().includes(searchText) ||
        experience.description?.toLowerCase().includes(searchText) ||
        experience.technologies?.some((technology) =>
          technology.toLowerCase().includes(searchText)
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "current" && experience.current) ||
        (filter === "previous" && !experience.current);

      return matchesSearch && matchesFilter;
    });
  }, [experiences, search, filter]);

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
                💼
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">
                Experience
              </h1>
            </div>

            <p className="text-slate-400">
              Manage your internships, jobs and professional experience.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchExperiences}
            disabled={loading}
            className="w-full lg:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition font-medium disabled:opacity-50"
          >
            🔄 {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ========================= */}
        {/* MESSAGE */}
        {/* ========================= */}

        {message.text && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {message.type === "success" ? "✓" : "⚠"}
              </span>

              <p className="text-sm leading-6">
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">
              Total Experience
            </p>

            <div className="flex items-end justify-between mt-3">
              <h2 className="text-3xl font-bold">
                {stats.total}
              </h2>

              <span className="text-2xl">
                💼
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">
              Current
            </p>

            <div className="flex items-end justify-between mt-3">
              <h2 className="text-3xl font-bold text-green-400">
                {stats.current}
              </h2>

              <span className="text-2xl">
                🟢
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">
              Previous
            </p>

            <div className="flex items-end justify-between mt-3">
              <h2 className="text-3xl font-bold text-blue-400">
                {stats.previous}
              </h2>

              <span className="text-2xl">
                📁
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">
              Technologies
            </p>

            <div className="flex items-end justify-between mt-3">
              <h2 className="text-3xl font-bold text-purple-400">
                {stats.technologies}
              </h2>

              <span className="text-2xl">
                🛠️
              </span>
            </div>
          </div>

        </div>

        {/* ========================= */}
        {/* ADD / EDIT FORM */}
        {/* ========================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  {editingId ? "Edit Experience" : "Add Experience"}
                </h2>

                {editingId && (
                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                    Editing
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-sm mt-1">
                {editingId
                  ? "Update your experience details."
                  : "Add your internship, job or professional experience."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-sm font-medium"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* COMPANY */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company / Organization
                  <span className="text-red-400 ml-1">*</span>
                </label>

                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Example: PN Infosys"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role / Position
                  <span className="text-red-400 ml-1">*</span>
                </label>

                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="Example: Web Developer Intern"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Example: Gwalior, Madhya Pradesh"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              {/* START DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date
                  <span className="text-red-400 ml-1">*</span>
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              {/* END DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={form.current}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                />

                {form.current && (
                  <p className="text-xs text-green-400 mt-2">
                    ✓ End date disabled because this is your current
                    experience.
                  </p>
                )}
              </div>

              {/* CURRENT */}

              <div className="flex items-end">
                <label className="w-full flex items-center gap-3 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 hover:border-slate-600 transition">

                  <input
                    type="checkbox"
                    name="current"
                    checked={form.current}
                    onChange={handleChange}
                    className="w-5 h-5 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-medium text-white">
                      I currently work here
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Mark this experience as ongoing.
                    </p>
                  </div>

                </label>
              </div>

              {/* TECHNOLOGIES */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Technologies / Skills
                </label>

                <input
                  type="text"
                  name="technologies"
                  value={form.technologies}
                  onChange={handleChange}
                  placeholder="HTML, CSS, JavaScript, React, Node.js"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Separate multiple technologies with commas.
                </p>

              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe your responsibilities, work, achievements and contributions..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Keep the description clear and professional.
                </p>

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3 mt-7">

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Experience"
                  : "+ Add Experience"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => resetForm()}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition font-semibold"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* ========================= */}
        {/* EXPERIENCE LIST */}
        {/* ========================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7">

          {/* LIST HEADER */}

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">

            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                Existing Experience
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Showing {filteredExperiences.length} of{" "}
                {experiences.length} experience
                {experiences.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* SEARCH */}

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

              <div className="relative w-full sm:w-72">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search experience..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                />

              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="all">
                  All Experience
                </option>

                <option value="current">
                  Current
                </option>

                <option value="previous">
                  Previous
                </option>
              </select>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="py-16 text-center">

              <div className="w-11 h-11 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />

              <p className="text-slate-400">
                Loading experience...
              </p>

            </div>
          ) : experiences.length === 0 ? (

            /* EMPTY */

            <div className="py-16 text-center border border-dashed border-slate-700 rounded-2xl">

              <div className="text-5xl mb-4">
                💼
              </div>

              <h3 className="text-lg font-semibold">
                No experience added yet
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                Add your first internship or professional experience
                using the form above.
              </p>

            </div>

          ) : filteredExperiences.length === 0 ? (

            /* NO SEARCH RESULTS */

            <div className="py-16 text-center border border-dashed border-slate-700 rounded-2xl">

              <div className="text-4xl mb-4">
                🔍
              </div>

              <h3 className="text-lg font-semibold">
                No matching experience
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                Try a different search term or filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-sm"
              >
                Clear Search
              </button>

            </div>

          ) : (

            /* EXPERIENCE CARDS */

            <div className="space-y-5">

              {filteredExperiences.map((experience) => (

                <div
                  key={experience._id}
                  className="relative bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 hover:border-slate-700 transition"
                >

                  {/* TOP */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl md:text-2xl font-bold break-words">
                          {experience.role}
                        </h3>

                        {experience.current && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Current
                          </span>
                        )}

                      </div>

                      <p className="text-blue-400 font-semibold mt-2">
                        {experience.company}
                      </p>

                      {experience.location && (
                        <p className="text-slate-400 text-sm mt-2">
                          📍 {experience.location}
                        </p>
                      )}

                    </div>

                    {/* DATE */}

                    <div className="shrink-0">

                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300">
                        📅

                        <span>
                          {formatDate(experience.startDate)}
                          {" — "}
                          {experience.current
                            ? "Present"
                            : formatDate(experience.endDate)}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  {experience.description && (
                    <div className="mt-6 pt-5 border-t border-slate-800">

                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Description
                      </p>

                      <p className="text-slate-300 leading-7 whitespace-pre-line">
                        {experience.description}
                      </p>

                    </div>
                  )}

                  {/* TECHNOLOGIES */}

                  {Array.isArray(experience.technologies) &&
                    experience.technologies.length > 0 && (

                    <div className="mt-6">

                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        Technologies
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {experience.technologies.map(
                          (technology, index) => (

                            <span
                              key={`${technology}-${index}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm"
                            >
                              {technology}
                            </span>

                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-800">

                    <button
                      type="button"
                      onClick={() => editExperience(experience)}
                      disabled={deletingId === experience._id}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteExperience(experience._id)
                      }
                      disabled={deletingId === experience._id}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-sm font-semibold"
                    >
                      {deletingId === experience._id
                        ? "Deleting..."
                        : "🗑️ Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}