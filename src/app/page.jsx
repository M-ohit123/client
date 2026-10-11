"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

const themes = [
  {
    id: "purple",
    name: "3D Purple",
    bg: "#070511",
    card: "#110d20",
    accent: "#8b5cf6",
    second: "#c084fc",
  },
  {
    id: "blue",
    name: "3D Blue",
    bg: "#030812",
    card: "#071426",
    accent: "#3b82f6",
    second: "#22d3ee",
  },
  {
    id: "green",
    name: "3D Emerald",
    bg: "#03100b",
    card: "#071b13",
    accent: "#10b981",
    second: "#34d399",
  },
  {
    id: "pink",
    name: "3D Pink",
    bg: "#10040b",
    card: "#1e0a17",
    accent: "#ec4899",
    second: "#f472b6",
  },
];

const navItems = [
  { id: "home", name: "Home", icon: "⌂" },
  { id: "about", name: "About", icon: "◈" },
  { id: "skills", name: "Skills", icon: "✦" },
  { id: "projects", name: "Projects", icon: "▣" },
  { id: "experience", name: "Experience", icon: "↗" },
  { id: "education", name: "Education", icon: "◇" },
  { id: "contact", name: "Contact", icon: "@" },
];

/* =========================================================
   CONTACT FORM
========================================================= */

function ContactForm({ theme }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    setStatus("");

    try {
      const response = await fetch(`${API}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Message failed"
        );
      }

      setStatus("success");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact Error:", error);
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[28px] border p-6 md:p-8"
      style={{
        background: `linear-gradient(145deg, ${theme.card}, ${theme.bg})`,
        borderColor: `${theme.accent}30`,
        boxShadow: `
          15px 15px 40px rgba(0,0,0,.35),
          inset 1px 1px 0 rgba(255,255,255,.05)
        `,
      }}
    >
      <div
        className="absolute -right-2 -top-2 h-20 w-20 rounded-full blur-3xl opacity-30"
        style={{
          backgroundColor: theme.accent,
        }}
      />

      <h3 className="relative mb-7 text-2xl font-black">
        Send a Message
      </h3>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-widest opacity-40">
            Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-white/30"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest opacity-40">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-white/30"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="text-xs uppercase tracking-widest opacity-40">
          Subject
        </label>

        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Project / Internship / Collaboration"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-white/30"
        />
      </div>

      <div className="mt-5">
        <label className="text-xs uppercase tracking-widest opacity-40">
          Message
        </label>

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Tell me about your project..."
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-white/30"
        />
      </div>

      {status === "success" && (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
          ✓ Message sent successfully.
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          Message could not be sent. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 w-full rounded-xl py-4 font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.second})`,
          boxShadow: `0 15px 35px ${theme.accent}35`,
        }}
      >
        {sending ? "Sending..." : "Send Message →"}
      </button>
    </form>
  );
}

/* =========================================================
   3D CARD
========================================================= */

function Card3D({
  children,
  theme,
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border ${className}`}
      style={{
        background: `linear-gradient(
          145deg,
          ${theme.card},
          ${theme.bg}
        )`,
        borderColor: `${theme.accent}20`,
        boxShadow: `
          20px 20px 60px rgba(0,0,0,.35),
          inset 1px 1px 0 rgba(255,255,255,.05)
        `,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-10"
        style={{
          backgroundColor: theme.accent,
        }}
      />

      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  text,
  theme,
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-[2px] w-10"
          style={{
            backgroundColor: theme.accent,
          }}
        />

        <p
          className="text-xs font-bold uppercase tracking-[0.35em]"
          style={{
            color: theme.accent,
          }}
        >
          {eyebrow}
        </p>
      </div>

      <h1 className="text-4xl font-black tracking-tight md:text-6xl">
        {title}
      </h1>

      {text && (
        <p className="mt-5 text-lg leading-8 opacity-50">
          {text}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  const [themeId, setThemeId] = useState("purple");
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const theme =
    themes.find((item) => item.id === themeId) ||
    themes[0];

  /* =========================================================
     LOAD SAVED THEME + PORTFOLIO
  ========================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("portfolio3DTheme");

    if (
      savedTheme &&
      themes.some((item) => item.id === savedTheme)
    ) {
      setThemeId(savedTheme);
    }

    loadPortfolio();
  }, []);

  /* =========================================================
     LOAD PORTFOLIO DATA
  ========================================================= */

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      const endpoints = [
        "profile",
        "projects",
        "skills",
        "experience",
        "education",
        "resume",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${API}/${endpoint}`, {
            cache: "no-store",
          })
        )
      );

      const data = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load ${response.url}`
            );
          }

          return response.json();
        })
      );

      const [
        profileData,
        projectsData,
        skillsData,
        experienceData,
        educationData,
        resumeData,
      ] = data;

      setProfile(
        profileData.profile || null
      );

      setProjects(
        Array.isArray(projectsData.projects)
          ? projectsData.projects
          : []
      );

      setSkills(
        Array.isArray(skillsData.skills)
          ? skillsData.skills
          : []
      );

      /*
        Backend returns:
        experiences
      */

      setExperience(
        Array.isArray(
          experienceData.experiences
        )
          ? experienceData.experiences
          : []
      );

      setEducation(
        Array.isArray(
          educationData.education
        )
          ? educationData.education
          : []
      );

      /*
        Resume:
        {
          resume: {
            fileName,
            fileUrl,
            uploadedAt
          }
        }
      */

      setResume(
        resumeData.resume || null
      );
    } catch (error) {
      console.error(
        "Portfolio Loading Error:",
        error
      );

      /*
        Keep page usable even if
        one API has a problem.
      */
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const changeSection = (section) => {
    setActiveSection(section);
    setMobileMenu(false);
    setThemeOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     THEME
  ========================================================= */

  const changeTheme = (id) => {
    setThemeId(id);

    localStorage.setItem(
      "portfolio3DTheme",
      id
    );

    setThemeOpen(false);
  };

  /* =========================================================
     RESUME
  ========================================================= */

  const handleResume = (e) => {
    if (!resume?.fileUrl) {
      e.preventDefault();

      alert(
        "Resume is not uploaded yet. Please upload it from Admin → Resume."
      );
    }
  };

  /* =========================================================
     RESUME URL
  ========================================================= */

  const resumeUrl = resume?.fileUrl || "";

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center text-white"
        style={{
          backgroundColor: theme.bg,
        }}
      >
        <div className="text-center">

          <div
            className="mx-auto h-14 w-14 animate-spin rounded-2xl border-2"
            style={{
              borderColor: `${theme.accent}25`,
              borderTopColor: theme.accent,
              boxShadow: `0 0 30px ${theme.accent}40`,
            }}
          />

          <p className="mt-6 text-sm text-white/40">
            Building your experience...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden text-white"
      style={{
        backgroundColor: theme.bg,
      }}
    >

      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="absolute -left-40 -top-48 h-[600px] w-[600px] rounded-full blur-[150px] opacity-15"
          style={{
            backgroundColor: theme.accent,
          }}
        />

        <div
          className="absolute -right-52 top-[45%] h-[650px] w-[650px] rounded-full blur-[160px] opacity-10"
          style={{
            backgroundColor: theme.second,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(
                ${theme.accent} 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                ${theme.accent} 1px,
                transparent 1px
              )
            `,
            backgroundSize: "70px 70px",
          }}
        />

      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-2xl"
        style={{
          backgroundColor: `${theme.bg}dd`,
          borderColor: `${theme.accent}12`,
        }}
      >

        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 md:px-8">

          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              changeSection("home")
            }
            className="flex items-center gap-3"
          >

            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-xl font-black text-white"
              style={{
                background: `linear-gradient(
                  145deg,
                  ${theme.second},
                  ${theme.accent}
                )`,
                boxShadow: `
                  7px 7px 15px rgba(0,0,0,.4),
                  inset 2px 2px 4px rgba(255,255,255,.25)
                `,
              }}
            >
              {profile?.name
                ?.charAt(0)
                ?.toUpperCase() || "M"}
            </div>

            <div className="hidden text-left sm:block">

              <p className="font-black leading-none">
                {profile?.name ||
                  "My Portfolio"}
              </p>

              <p
                className="mt-1 text-[9px] uppercase tracking-[0.25em]"
                style={{
                  color: theme.accent,
                }}
              >
                Full Stack Developer
              </p>

            </div>

          </button>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-1 xl:flex">

            {navItems.map((item) => {
              const active =
                activeSection === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    changeSection(item.id)
                  }
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                  style={
                    active
                      ? {
                          color: theme.accent,
                          backgroundColor: `${theme.accent}12`,
                          boxShadow: `inset 0 0 20px ${theme.accent}08`,
                        }
                      : {
                          opacity: 0.5,
                        }
                  }
                >
                  {item.name}
                </button>
              );
            })}

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">

            {/* THEME BUTTON */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setThemeOpen(
                    (previous) => !previous
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition hover:bg-white/5"
                aria-label="Change theme"
              >
                ✦
              </button>

              {themeOpen && (
                <div
                  className="absolute right-0 top-14 w-56 rounded-2xl border p-2 shadow-2xl"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: `${theme.accent}25`,
                  }}
                >

                  <p className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
                    3D Themes
                  </p>

                  {themes.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        changeTheme(item.id)
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                    >

                      <span
                        className="h-4 w-4 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${item.accent}, ${item.second})`,
                          boxShadow: `0 0 12px ${item.accent}`,
                        }}
                      />

                      <span className="flex-1 text-sm">
                        {item.name}
                      </span>

                      {themeId === item.id && (
                        <span
                          style={{
                            color: theme.accent,
                          }}
                        >
                          ✓
                        </span>
                      )}

                    </button>
                  ))}

                </div>
              )}

            </div>

            {/* DESKTOP RESUME */}

            <a
              href={resumeUrl || "#"}
              target={
                resumeUrl
                  ? "_blank"
                  : undefined
              }
              rel={
                resumeUrl
                  ? "noopener noreferrer"
                  : undefined
              }
              onClick={handleResume}
              className="hidden rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.02] sm:flex"
            >
              Resume ↗
            </a>

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileMenu(
                  (previous) => !previous
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 xl:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>

          </div>

        </div>

        {/* MOBILE NAV */}

        {mobileMenu && (
          <div
            className="border-t p-4 xl:hidden"
            style={{
              backgroundColor: theme.bg,
              borderColor: `${theme.accent}15`,
            }}
          >

            <div className="grid grid-cols-2 gap-2">

              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    changeSection(item.id)
                  }
                  className="rounded-xl border border-white/5 p-3 text-left text-sm"
                  style={
                    activeSection === item.id
                      ? {
                          color: theme.accent,
                          backgroundColor: `${theme.accent}12`,
                        }
                      : {
                          opacity: 0.6,
                        }
                  }
                >
                  {item.icon}{" "}
                  {item.name}
                </button>
              ))}

            </div>

            <a
              href={resumeUrl || "#"}
              target={
                resumeUrl
                  ? "_blank"
                  : undefined
              }
              rel={
                resumeUrl
                  ? "noopener noreferrer"
                  : undefined
              }
              onClick={handleResume}
              className="mt-3 flex justify-center rounded-xl bg-white py-3 font-bold text-black"
            >
              Download Resume ↗
            </a>

          </div>
        )}

      </nav>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 pt-[78px]">

        {/* ===================================================
            HOME
        =================================================== */}

        {activeSection === "home" && (
          <section className="flex min-h-[calc(100vh-78px)] items-center px-5 md:px-8">

            <div className="mx-auto grid w-full max-w-7xl items-center gap-16 py-20 lg:grid-cols-[1.15fr_.85fr]">

              {/* LEFT */}

              <div>

                <div
                  className="mb-7 inline-flex items-center gap-3 rounded-full border px-4 py-2"
                  style={{
                    borderColor: `${theme.accent}25`,
                    backgroundColor: `${theme.accent}09`,
                    boxShadow: `inset 0 0 20px ${theme.accent}06`,
                  }}
                >

                  <span
                    className="h-2 w-2 animate-pulse rounded-full"
                    style={{
                      backgroundColor:
                        theme.accent,
                      boxShadow: `0 0 15px ${theme.accent}`,
                    }}
                  />

                  <span className="text-xs uppercase tracking-[0.15em] opacity-70">
                    Available for opportunities
                  </span>

                </div>

                <p
                  className="text-sm font-bold uppercase tracking-[0.35em]"
                  style={{
                    color: theme.accent,
                  }}
                >
                  Hello, I'm
                </p>

                <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl md:text-7xl lg:text-[84px]">
                  {profile?.name ||
                    "Your Name"}
                </h1>

                <div className="mt-7 flex items-center gap-4">

                  <div
                    className="h-[2px] w-12"
                    style={{
                      backgroundColor:
                        theme.accent,
                      boxShadow: `0 0 15px ${theme.accent}`,
                    }}
                  />

                  <h2 className="text-xl font-bold opacity-80 md:text-2xl">
                    {profile?.title ||
                      "Full Stack Developer"}
                  </h2>

                </div>

                <p className="mt-7 max-w-2xl text-lg leading-8 opacity-50">
                  {profile?.about ||
                    "I build modern, scalable and user-focused web applications using contemporary technologies."}
                </p>

                {/* CTA */}

                <div className="mt-9 flex flex-wrap gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      changeSection(
                        "projects"
                      )
                    }
                    className="rounded-xl px-7 py-4 font-black text-white transition hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${theme.accent},
                        ${theme.second}
                      )`,
                      boxShadow: `
                        0 15px 40px ${theme.accent}30,
                        inset 2px 2px 5px rgba(255,255,255,.2)
                      `,
                    }}
                  >
                    Explore My Work →
                  </button>

                  <a
                    href={resumeUrl || "#"}
                    target={
                      resumeUrl
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      resumeUrl
                        ? "noopener noreferrer"
                        : undefined
                    }
                    onClick={handleResume}
                    className="rounded-xl border border-white/10 px-7 py-4 font-bold transition hover:bg-white/5"
                  >
                    View Resume
                  </a>

                </div>

                {/* SOCIAL */}

                <div className="mt-10 flex gap-6">

                  {profile?.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm opacity-40 transition hover:opacity-100"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {profile?.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm opacity-40 transition hover:opacity-100"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                  {profile?.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm opacity-40 transition hover:opacity-100"
                    >
                      Email ↗
                    </a>
                  )}

                </div>

              </div>

              {/* PROFILE */}

              <div className="flex justify-center lg:justify-end">

                <div
                  className="relative"
                  style={{
                    perspective: "1200px",
                  }}
                >

                  <div
                    className="absolute -inset-20 rounded-full blur-[80px] opacity-20"
                    style={{
                      backgroundColor:
                        theme.accent,
                    }}
                  />

                  <div
                    className="relative h-[370px] w-[280px] overflow-hidden rounded-[45px] border md:h-[460px] md:w-[350px]"
                    style={{
                      transform:
                        "rotateY(-8deg) rotateX(5deg)",
                      transformStyle:
                        "preserve-3d",
                      backgroundColor:
                        theme.card,
                      borderColor: `${theme.accent}40`,
                      boxShadow: `
                        35px 35px 70px rgba(0,0,0,.55),
                        -10px -10px 40px ${theme.accent}10,
                        inset 2px 2px 0 rgba(255,255,255,.08)
                      `,
                    }}
                  >

                    <img
                      src={
                        profile?.profileImage ||
                        "/profile.jpg"
                      }
                      alt={
                        profile?.name ||
                        "Profile"
                      }
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        if (
                          e.currentTarget.src.endsWith(
                            "/profile.jpg"
                          )
                        ) {
                          return;
                        }

                        e.currentTarget.src =
                          "/profile.jpg";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10" />

                    <div className="absolute bottom-7 left-7 right-7">

                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                        Full Stack Developer
                      </p>

                      <p className="mt-2 text-xl font-black text-white">
                        {profile?.name ||
                          "Developer"}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {profile?.location ||
                          "India"}
                      </p>

                    </div>

                  </div>

                  {/* PROJECT COUNT */}

                  <div
                    className="absolute -bottom-8 -left-10 rounded-2xl border px-6 py-5 backdrop-blur-xl md:-left-16"
                    style={{
                      backgroundColor: `${theme.card}ee`,
                      borderColor: `${theme.accent}30`,
                      boxShadow: `
                        18px 18px 35px rgba(0,0,0,.45),
                        inset 1px 1px 0 rgba(255,255,255,.08)
                      `,
                      transform:
                        "translateZ(70px) rotateY(5deg)",
                    }}
                  >

                    <p className="text-[10px] uppercase tracking-widest opacity-40">
                      Projects
                    </p>

                    <p
                      className="mt-1 text-3xl font-black"
                      style={{
                        color: theme.accent,
                      }}
                    >
                      {projects.length}+
                    </p>

                  </div>

                  {/* FLOATING ICON */}

                  <div
                    className="absolute -right-7 -top-8 flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl"
                    style={{
                      background: `linear-gradient(
                        145deg,
                        ${theme.accent},
                        ${theme.second}
                      )`,
                      borderColor:
                        "rgba(255,255,255,.15)",
                      boxShadow: `
                        15px 15px 35px rgba(0,0,0,.45),
                        inset 2px 2px 5px rgba(255,255,255,.25)
                      `,
                      transform:
                        "rotate(12deg)",
                    }}
                  >
                    ✦
                  </div>

                </div>
              </div>

            </div>
          </section>
        )}

        {/* ===================================================
            ABOUT
        =================================================== */}

        {activeSection === "about" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-7xl">

              <SectionHeading
                eyebrow="About Me"
                title="Turning ideas into digital experiences."
                text="A developer focused on building useful, scalable and visually polished web applications."
                theme={theme}
              />

              <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">

                <Card3D theme={theme}>

                  <div className="relative p-8 md:p-10">

                    <p className="text-lg leading-9 opacity-60">
                      {profile?.about ||
                        "I am a passionate full-stack developer who enjoys transforming ideas into functional and beautiful web applications."}
                    </p>

                    <div className="mt-10 grid gap-7 sm:grid-cols-2">

                      <div>

                        <p className="text-[10px] uppercase tracking-widest opacity-35">
                          Email
                        </p>

                        <p className="mt-2 break-all font-semibold">
                          {profile?.email ||
                            "Available on request"}
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] uppercase tracking-widest opacity-35">
                          Location
                        </p>

                        <p className="mt-2 font-semibold">
                          {profile?.location ||
                            "India"}
                        </p>

                      </div>

                    </div>

                  </div>

                </Card3D>

                <div className="grid grid-cols-2 gap-5">

                  {[
                    ["Projects", projects.length],
                    ["Skills", skills.length],
                    ["Experience", experience.length],
                    ["Education", education.length],
                  ].map(
                    ([label, value]) => (
                      <Card3D
                        key={label}
                        theme={theme}
                        className="min-h-[170px]"
                      >
                        <div className="relative flex h-full min-h-[170px] flex-col justify-end p-7">

                          <p
                            className="text-4xl font-black"
                            style={{
                              color:
                                theme.accent,
                              textShadow: `0 0 25px ${theme.accent}55`,
                            }}
                          >
                            {value}
                          </p>

                          <p className="mt-2 opacity-40">
                            {label}
                          </p>

                        </div>
                      </Card3D>
                    )
                  )}

                </div>

              </div>

            </div>
          </section>
        )}

        {/* ===================================================
            SKILLS
        =================================================== */}

        {activeSection === "skills" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-7xl">

              <SectionHeading
                eyebrow="Skills"
                title="My technical toolbox."
                text="Technologies I use to design, build and deploy modern applications."
                theme={theme}
              />

              {skills.length === 0 ? (
                <p className="opacity-40">
                  Skills will appear here.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                  {skills.map((skill) => (
                    <Card3D
                      key={skill._id}
                      theme={theme}
                    >
                      <div className="relative p-7">

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            {skill.icon && (
                              <span className="shrink-0 text-2xl">
                                {skill.icon}
                              </span>
                            )}

                            <h3 className="truncate text-lg font-black">
                              {skill.name}
                            </h3>

                          </div>

                          <span
                            className="shrink-0 text-sm font-black"
                            style={{
                              color:
                                theme.accent,
                            }}
                          >
                            {skill.level || 0}%
                          </span>

                        </div>

                        {skill.category && (
                          <p className="mt-2 text-xs opacity-35">
                            {skill.category}
                          </p>
                        )}

                        <div className="mt-7 h-2 overflow-hidden rounded-full bg-black/30">

                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${skill.level || 0}%`,
                              background: `linear-gradient(
                                90deg,
                                ${theme.accent},
                                ${theme.second}
                              )`,
                              boxShadow: `0 0 15px ${theme.accent}`,
                            }}
                          />

                        </div>

                      </div>
                    </Card3D>
                  ))}

                </div>
              )}

            </div>
          </section>
        )}

        {/* ===================================================
            PROJECTS
        =================================================== */}

        {activeSection === "projects" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-7xl">

              <SectionHeading
                eyebrow="Selected Work"
                title="Projects built to solve real problems."
                text="A selection of full-stack applications and systems."
                theme={theme}
              />

              {projects.length === 0 ? (
                <p className="opacity-40">
                  Projects will appear here.
                </p>
              ) : (
                <div className="space-y-8">

                  {projects.map(
                    (project, index) => (
                      <Card3D
                        key={project._id}
                        theme={theme}
                      >

                        <div className="grid lg:grid-cols-2">

                          <div className="relative min-h-[300px] overflow-hidden bg-black/20 lg:min-h-[400px]">

                            {project.image ? (
                              <img
                                src={
                                  project.image
                                }
                                alt={
                                  project.title
                                }
                                className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">

                                <span
                                  className="text-8xl font-black opacity-10"
                                  style={{
                                    color:
                                      theme.accent,
                                  }}
                                >
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>

                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                            <span
                              className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-xl font-black text-white"
                              style={{
                                background: `linear-gradient(
                                  135deg,
                                  ${theme.accent},
                                  ${theme.second}
                                )`,
                                boxShadow:
                                  "8px 8px 20px rgba(0,0,0,.4)",
                              }}
                            >
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                          </div>

                          <div className="relative flex flex-col justify-center p-8 md:p-10">

                            <div className="flex items-start justify-between gap-4">

                              <h2 className="text-2xl font-black md:text-3xl">
                                {
                                  project.title
                                }
                              </h2>

                              {project.featured && (
                                <span
                                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs"
                                  style={{
                                    color:
                                      theme.accent,
                                    backgroundColor: `${theme.accent}12`,
                                  }}
                                >
                                  Featured
                                </span>
                              )}

                            </div>

                            <p className="mt-5 leading-8 opacity-50">
                              {
                                project.description
                              }
                            </p>

                            {project.technologies?.length >
                              0 && (
                              <div className="mt-6 flex flex-wrap gap-2">

                                {project.technologies.map(
                                  (
                                    tech,
                                    i
                                  ) => (
                                    <span
                                      key={i}
                                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs opacity-60"
                                    >
                                      {tech}
                                    </span>
                                  )
                                )}

                              </div>
                            )}

                            <div className="mt-8 flex gap-6">

                              {project.liveUrl && (
                                <a
                                  href={
                                    project.liveUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-bold"
                                  style={{
                                    color:
                                      theme.accent,
                                  }}
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
                                  className="text-sm font-bold opacity-50 transition hover:opacity-100"
                                >
                                  Source Code ↗
                                </a>
                              )}

                            </div>

                          </div>

                        </div>

                      </Card3D>
                    )
                  )}

                </div>
              )}

            </div>
          </section>
        )}

        {/* ===================================================
            EXPERIENCE
        =================================================== */}

        {activeSection === "experience" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-5xl">

              <SectionHeading
                eyebrow="Experience"
                title="My professional journey."
                text="The experiences that shaped my development journey."
                theme={theme}
              />

              {experience.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                  <p className="opacity-40">
                    Experience will appear here.
                  </p>
                </div>
              ) : (
                <div className="relative">

                  <div
                    className="absolute bottom-2 left-[8px] top-2 w-px"
                    style={{
                      background: `linear-gradient(
                        ${theme.accent},
                        transparent
                      )`,
                    }}
                  />

                  <div className="space-y-8">

                    {experience.map(
                      (item) => (
                        <div
                          key={item._id}
                          className="relative pl-10"
                        >

                          <div
                            className="absolute left-0 top-8 h-[17px] w-[17px] rounded-full border-4"
                            style={{
                              backgroundColor:
                                theme.bg,
                              borderColor:
                                theme.accent,
                              boxShadow: `0 0 20px ${theme.accent}`,
                            }}
                          />

                          <Card3D theme={theme}>

                            <div className="p-7 md:p-9">

                              <div className="flex flex-col gap-4 md:flex-row md:justify-between">

                                <div>

                                  <h2 className="text-2xl font-black">
                                    {
                                      item.role
                                    }
                                  </h2>

                                  <p
                                    className="mt-2 font-bold"
                                    style={{
                                      color:
                                        theme.accent,
                                    }}
                                  >
                                    {
                                      item.company
                                    }
                                  </p>

                                </div>

                                <div className="text-left md:text-right">

                                  <p className="text-xs opacity-40">

                                    {item.startDate
                                      ? new Date(
                                          item.startDate
                                        ).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )
                                      : ""}

                                    {" — "}

                                    {item.current
                                      ? "Present"
                                      : item.endDate
                                      ? new Date(
                                          item.endDate
                                        ).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )
                                      : ""}

                                  </p>

                                  {item.current && (
                                    <span
                                      className="mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold"
                                      style={{
                                        color:
                                          theme.accent,
                                        backgroundColor: `${theme.accent}12`,
                                      }}
                                    >
                                      CURRENT
                                    </span>
                                  )}

                                </div>

                              </div>

                              {item.location && (
                                <p className="mt-4 text-xs opacity-40">
                                  📍{" "}
                                  {
                                    item.location
                                  }
                                </p>
                              )}

                              {item.description && (
                                <p className="mt-5 leading-8 opacity-50">
                                  {
                                    item.description
                                  }
                                </p>
                              )}

                              {item.technologies?.length >
                                0 && (
                                <div className="mt-5 flex flex-wrap gap-2">

                                  {item.technologies.map(
                                    (
                                      tech,
                                      i
                                    ) => (
                                      <span
                                        key={
                                          i
                                        }
                                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs"
                                      >
                                        {
                                          tech
                                        }
                                      </span>
                                    )
                                  )}

                                </div>
                              )}

                            </div>

                          </Card3D>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          </section>
        )}

        {/* ===================================================
            EDUCATION
        =================================================== */}

        {activeSection === "education" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-5xl">

              <SectionHeading
                eyebrow="Education"
                title="My academic background."
                text="The academic milestones behind my technical journey."
                theme={theme}
              />

              {education.length === 0 ? (
                <p className="opacity-40">
                  Education will appear here.
                </p>
              ) : (
                <div className="space-y-6">

                  {education.map(
                    (item) => (
                      <Card3D
                        key={item._id}
                        theme={theme}
                      >

                        <div className="p-7 md:p-9">

                          <div className="flex flex-col gap-5 md:flex-row md:justify-between">

                            <div>

                              <p
                                className="text-xs font-bold uppercase tracking-[0.2em]"
                                style={{
                                  color:
                                    theme.accent,
                                }}
                              >
                                {
                                  item.degree
                                }
                              </p>

                              <h2 className="mt-2 text-2xl font-black md:text-3xl">
                                {
                                  item.institution
                                }
                              </h2>

                            </div>

                            <p className="text-xs opacity-40">

                              {item.startYear ||
                                ""}

                              {item.startYear &&
                              (item.endYear ||
                                item.current)
                                ? " — "
                                : ""}

                              {item.current
                                ? "Present"
                                : item.endYear ||
                                  ""}

                            </p>

                          </div>

                          {item.field && (
                            <p className="mt-5 opacity-60">
                              {
                                item.field
                              }
                            </p>
                          )}

                          {item.location && (
                            <p className="mt-2 text-xs opacity-40">
                              {
                                item.location
                              }
                            </p>
                          )}

                          {item.grade && (
                            <span
                              className="mt-5 inline-block rounded-xl px-4 py-2 text-xs font-bold"
                              style={{
                                color:
                                  theme.accent,
                                backgroundColor: `${theme.accent}12`,
                              }}
                            >
                              Grade:{" "}
                              {
                                item.grade
                              }
                            </span>
                          )}

                          {item.description && (
                            <p className="mt-5 leading-8 opacity-50">
                              {
                                item.description
                              }
                            </p>
                          )}

                        </div>

                      </Card3D>
                    )
                  )}

                </div>
              )}

            </div>
          </section>
        )}

        {/* ===================================================
            CONTACT
        =================================================== */}

        {activeSection === "contact" && (
          <section className="min-h-[calc(100vh-78px)] px-5 py-20 md:px-8">

            <div className="mx-auto max-w-6xl">

              <SectionHeading
                eyebrow="Contact"
                title="Let's create something great."
                text="Have an opportunity, project or idea? Let's talk."
                theme={theme}
              />

              <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">

                <Card3D theme={theme}>

                  <div className="relative p-8 md:p-9">

                    <p className="text-xs uppercase tracking-[0.2em] opacity-40">
                      Get in touch
                    </p>

                    <h2 className="mt-5 text-3xl font-black">
                      Let's connect.
                    </h2>

                    <p className="mt-5 leading-8 opacity-50">
                      I'm open to internships,
                      development opportunities,
                      collaborations and
                      interesting projects.
                    </p>

                    <div className="mt-10 space-y-7">

                      {profile?.email && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest opacity-35">
                            Email
                          </p>

                          <a
                            href={`mailto:${profile.email}`}
                            className="mt-2 block break-all font-semibold"
                          >
                            {
                              profile.email
                            }
                          </a>

                        </div>
                      )}

                      {profile?.phone && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest opacity-35">
                            Phone
                          </p>

                          <a
                            href={`tel:${profile.phone}`}
                            className="mt-2 block font-semibold"
                          >
                            {
                              profile.phone
                            }
                          </a>

                        </div>
                      )}

                      {profile?.location && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest opacity-35">
                            Location
                          </p>

                          <p className="mt-2 font-semibold">
                            {
                              profile.location
                            }
                          </p>

                        </div>
                      )}

                    </div>

                    <div className="mt-10 flex gap-6 border-t border-white/10 pt-7">

                      {profile?.github && (
                        <a
                          href={
                            profile.github
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm opacity-50 transition hover:opacity-100"
                        >
                          GitHub ↗
                        </a>
                      )}

                      {profile?.linkedin && (
                        <a
                          href={
                            profile.linkedin
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm opacity-50 transition hover:opacity-100"
                        >
                          LinkedIn ↗
                        </a>
                      )}

                    </div>

                  </div>

                </Card3D>

                <ContactForm
                  theme={theme}
                />

              </div>

            </div>
          </section>
        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="relative z-10 border-t"
        style={{
          borderColor: `${theme.accent}12`,
        }}
      >

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-8">

          <p className="text-xs opacity-35">
            © {new Date().getFullYear()}{" "}
            {profile?.name ||
              "My Portfolio"}{" "}
            · Built with Next.js
          </p>

          <button
            type="button"
            onClick={() =>
              changeSection("home")
            }
            className="text-sm font-bold"
            style={{
              color: theme.accent,
            }}
          >
            Back to top ↑
          </button>

        </div>

      </footer>

    </main>
  );
}