"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api/education";

const EMPTY_FORM = {
  institution: "",
  degree: "",
  field: "",
  location: "",
  startYear: "",
  endYear: "",
  grade: "",
  description: "",
  current: false,
};

export default function EducationPage() {
  const router = useRouter();

  const [education, setEducation] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // =========================
  // FETCH EDUCATION
  // =========================

  const fetchEducation = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch education"
        );
      }

      setEducation(data.education || []);
    } catch (error) {
      console.error("Education Fetch Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN + FETCH
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    fetchEducation();
  }, [router]);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = (clearMessage = true) => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);

    if (clearMessage) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (!formData.institution.trim()) {
      setMessage({
        type: "error",
        text: "Please enter institution name.",
      });
      return;
    }

    if (!formData.degree.trim()) {
      setMessage({
        type: "error",
        text: "Please enter degree / course.",
      });
      return;
    }

    if (
      formData.startYear &&
      formData.endYear &&
      !formData.current &&
      Number(formData.endYear) < Number(formData.startYear)
    ) {
      setMessage({
        type: "error",
        text: "End year cannot be before start year.",
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const payload = {
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        field: formData.field.trim(),
        location: formData.location.trim(),
        startYear: formData.startYear,
        endYear: formData.current ? "" : formData.endYear,
        grade: formData.grade.trim(),
        description: formData.description.trim(),
        current: formData.current,
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save education"
        );
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Education updated successfully."
          : "Education added successfully.",
      });

      resetForm(false);

      await fetchEducation();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Save Education Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to save education.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      institution: item.institution || "",
      degree: item.degree || "",
      field: item.field || "",
      location: item.location || "",
      startYear: item.startYear || "",
      endYear: item.endYear || "",
      grade: item.grade || "",
      description: item.description || "",
      current: Boolean(item.current),
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this education record?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete education"
        );
      }

      if (editingId === id) {
        resetForm(false);
      }

      setMessage({
        type: "success",
        text: "Education deleted successfully.",
      });

      await fetchEducation();
    } catch (error) {
      console.error("Delete Education Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to delete education.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    const current = education.filter(
      (item) => item.current
    ).length;

    const completed = education.filter(
      (item) => !item.current
    ).length;

    const institutions = new Set(
      education
        .map((item) => item.institution?.trim().toLowerCase())
        .filter(Boolean)
    ).size;

    return {
      total: education.length,
      current,
      completed,
      institutions,
    };
  }, [education]);

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredEducation = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return education.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.institution?.toLowerCase().includes(searchText) ||
        item.degree?.toLowerCase().includes(searchText) ||
        item.field?.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText) ||
        item.grade?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "current" && item.current) ||
        (filter === "completed" && !item.current);

      return matchesSearch && matchesFilter;
    });
  }, [education, search, filter]);

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20 text-2xl">
                🎓
              </div>

              <h1 className="text-3xl font-bold md:text-4xl">
                Education
              </h1>

            </div>

            <p className="text-slate-400">
              Manage your academic background and qualifications.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEducation}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-medium transition hover:bg-slate-700 disabled:opacity-50 lg:w-auto"
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
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
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

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Total Education
            </p>

            <div className="mt-3 flex items-end justify-between">

              <h2 className="text-3xl font-bold">
                {stats.total}
              </h2>

              <span className="text-2xl">
                🎓
              </span>

            </div>

          </div>

          {/* CURRENT */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Currently Studying
            </p>

            <div className="mt-3 flex items-end justify-between">

              <h2 className="text-3xl font-bold text-green-400">
                {stats.current}
              </h2>

              <span className="text-2xl">
                🟢
              </span>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Completed
            </p>

            <div className="mt-3 flex items-end justify-between">

              <h2 className="text-3xl font-bold text-blue-400">
                {stats.completed}
              </h2>

              <span className="text-2xl">
                ✅
              </span>

            </div>

          </div>

          {/* INSTITUTIONS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Institutions
            </p>

            <div className="mt-3 flex items-end justify-between">

              <h2 className="text-3xl font-bold text-purple-400">
                {stats.institutions}
              </h2>

              <span className="text-2xl">
                🏫
              </span>

            </div>

          </div>

        </div>

        {/* ========================= */}
        {/* ADD / EDIT FORM */}
        {/* ========================= */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-xl font-bold md:text-2xl">
                  {editingId
                    ? "Edit Education"
                    : "Add Education"}
                </h2>

                {editingId && (
                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                    Editing
                  </span>
                )}

              </div>

              <p className="mt-1 text-sm text-slate-400">
                {editingId
                  ? "Update your academic information."
                  : "Add school, college or university details."}
              </p>

            </div>

            {editingId && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-700"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* INSTITUTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  School / College / University
                  <span className="ml-1 text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Prestige Institute of Management & Research"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* DEGREE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Degree / Course
                  <span className="ml-1 text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="Bachelor of Computer Applications (BCA)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* FIELD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Field / Specialization
                </label>

                <input
                  type="text"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="Computer Applications"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Gwalior, Madhya Pradesh"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* START YEAR */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Start Year
                </label>

                <input
                  type="number"
                  name="startYear"
                  value={formData.startYear}
                  onChange={handleChange}
                  placeholder="2024"
                  min="1950"
                  max="2100"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* END YEAR */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  End Year
                </label>

                <input
                  type="number"
                  name="endYear"
                  value={formData.endYear}
                  onChange={handleChange}
                  disabled={formData.current}
                  placeholder="2027"
                  min="1950"
                  max="2100"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                />

                {formData.current && (
                  <p className="mt-2 text-xs text-green-400">
                    ✓ End year disabled because this education is ongoing.
                  </p>
                )}
              </div>

              {/* GRADE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Percentage / CGPA / Grade
                </label>

                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="70% / 8.5 CGPA"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* CURRENT */}

              <div className="flex items-end">

                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 transition hover:border-slate-600">

                  <input
                    type="checkbox"
                    name="current"
                    checked={formData.current}
                    onChange={handleChange}
                    className="h-5 w-5 accent-blue-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-white">
                      Currently studying here
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Mark this education as ongoing.
                    </p>

                  </div>

                </label>

              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Currently pursuing BCA with focus on web development, programming and databases."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Add relevant academic details, achievements or focus areas.
                </p>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Education"
                  : "+ Add Education"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => resetForm()}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold transition hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* ========================= */}
        {/* EXISTING EDUCATION */}
        {/* ========================= */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <h2 className="text-xl font-bold md:text-2xl">
                Existing Education
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Showing {filteredEducation.length} of{" "}
                {education.length} record
                {education.length !== 1 ? "s" : ""}
              </p>

            </div>

            {/* SEARCH + FILTER */}

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">

              <div className="relative w-full sm:w-72">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search education..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500"
                />

              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              >
                <option value="all">
                  All Education
                </option>

                <option value="current">
                  Currently Studying
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="py-16 text-center">

              <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

              <p className="text-slate-400">
                Loading education...
              </p>

            </div>

          ) : education.length === 0 ? (

            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">

              <div className="mb-4 text-5xl">
                🎓
              </div>

              <h3 className="text-lg font-semibold">
                No education added yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first school, college or university above.
              </p>

            </div>

          ) : filteredEducation.length === 0 ? (

            /* NO RESULTS */

            <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">

              <div className="mb-4 text-4xl">
                🔍
              </div>

              <h3 className="text-lg font-semibold">
                No matching education
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term or filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm transition hover:bg-slate-700"
              >
                Clear Search
              </button>

            </div>

          ) : (

            /* EDUCATION CARDS */

            <div className="space-y-5">

              {filteredEducation.map((item) => (

                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700 md:p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="break-words text-xl font-bold md:text-2xl">
                          {item.degree}
                        </h3>

                        {item.current && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                            Current

                          </span>
                        )}

                      </div>

                      <p className="mt-2 font-semibold text-blue-400">
                        {item.institution}
                      </p>

                      {item.field && (
                        <p className="mt-2 text-sm text-slate-300">
                          📚 {item.field}
                        </p>
                      )}

                      {item.location && (
                        <p className="mt-1 text-sm text-slate-400">
                          📍 {item.location}
                        </p>
                      )}

                    </div>

                    {/* YEAR */}

                    <div className="shrink-0">

                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
                        📅

                        <span>
                          {item.startYear || "—"}
                          {" — "}
                          {item.current
                            ? "Present"
                            : item.endYear || "—"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* GRADE */}

                  {item.grade && (
                    <div className="mt-6">

                      <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                        Result
                      </p>

                      <span className="inline-flex rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200">
                        📊 {item.grade}
                      </span>

                    </div>
                  )}

                  {/* DESCRIPTION */}

                  {item.description && (
                    <div className="mt-6 border-t border-slate-800 pt-5">

                      <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                        Description
                      </p>

                      <p className="whitespace-pre-line leading-7 text-slate-300">
                        {item.description}
                      </p>

                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row">

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      disabled={deletingId === item._id}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === item._id
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