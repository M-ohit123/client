"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/profile";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    title: "",
    about: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await fetch(API_URL, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch profile"
        );
      }

      if (data.profile) {
        setForm({
          name: data.profile.name || "",
          title: data.profile.title || "",
          about: data.profile.about || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          location: data.profile.location || "",
          linkedin: data.profile.linkedin || "",
          github: data.profile.github || "",
          website: data.profile.website || "",
        });

        if (data.profile.profileImage) {
          setPreview(
            data.profile.profileImage
          );
        }
      }
    } catch (error) {
      console.error(
        "Profile Fetch Error:",
        error
      );

      setError(
        error.message ||
          "Failed to load profile"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setMessage("");
    setError("");

    if (!file) {
      setProfileImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );

      setProfileImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );

      setProfileImage(null);
      return;
    }

    setProfileImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
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

      if (!form.name.trim()) {
        throw new Error(
          "Name is required."
        );
      }

      if (!form.title.trim()) {
        throw new Error(
          "Title is required."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "about",
        form.about
      );

      formData.append(
        "email",
        form.email
      );

      formData.append(
        "phone",
        form.phone
      );

      formData.append(
        "location",
        form.location
      );

      formData.append(
        "linkedin",
        form.linkedin
      );

      formData.append(
        "github",
        form.github
      );

      formData.append(
        "website",
        form.website
      );

      if (profileImage) {
        formData.append(
          "profileImage",
          profileImage
        );
      }

      const response =
        await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      if (data.profile) {
        setForm({
          name: data.profile.name || "",
          title: data.profile.title || "",
          about: data.profile.about || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          location:
            data.profile.location || "",
          linkedin:
            data.profile.linkedin || "",
          github:
            data.profile.github || "",
          website:
            data.profile.website || "",
        });

        if (data.profile.profileImage) {
          setPreview(
            data.profile.profileImage
          );
        }
      }

      setProfileImage(null);

      const input =
        document.getElementById(
          "profileImage"
        );

      if (input) {
        input.value = "";
      }

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      setError(
        error.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (fetching) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">

        <div className="mx-auto max-w-5xl">

          <div className="h-9 w-48 animate-pulse rounded-lg bg-white/10" />

          <div className="mt-8 h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />

        </div>

      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-black">
              👤
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Profile
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage your personal portfolio information.
              </p>

            </div>

          </div>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-400">
            ✓ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400">
            ! {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">

            <div className="mb-7">

              <h2 className="text-xl font-bold">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This information will appear on your portfolio.
              </p>

            </div>

            {/* IMAGE */}

            <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row">

              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5">

                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    👤
                  </div>
                )}

              </div>

              <div>

                <h3 className="font-semibold">
                  Profile Photo
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  JPG, PNG or WebP • Maximum 5MB
                </p>

                <label
                  htmlFor="profileImage"
                  className="mt-4 inline-flex cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
                >
                  Choose Photo
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </div>

            </div>

            {/* BASIC FIELDS */}

            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />

              <Input
                label="Professional Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Full Stack Developer"
                required
              />

              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                type="email"
              />

              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
              />

              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Gwalior, Madhya Pradesh"
              />

            </div>

            {/* ABOUT */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                About Me
              </label>

              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                rows={6}
                placeholder="Write something professional about yourself..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/30"
              />

            </div>

          </section>

          {/* =================================================
              SOCIAL LINKS
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">

            <div className="mb-7">

              <h2 className="text-xl font-bold">
                Social & Website
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add links to your professional profiles.
              </p>

            </div>

            <div className="grid gap-5">

              <Input
                label="LinkedIn URL"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
              />

              <Input
                label="GitHub URL"
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />

              <Input
                label="Website URL"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />

            </div>

          </section>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="mt-6 flex justify-end">

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-8 py-3.5 font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {loading
                ? "Saving..."
                : "Save Profile"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

// =========================================================
// INPUT COMPONENT
// =========================================================

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-300"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/30"
      />

    </div>
  );
}