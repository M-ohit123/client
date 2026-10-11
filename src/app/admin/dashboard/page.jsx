"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:5000/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
    messages: 0,
    unreadMessages: 0,
    resume: false,
    profile: false,
  });

  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        throw new Error(
          "Admin session not found. Please login again."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        projectsResponse,
        skillsResponse,
        experienceResponse,
        educationResponse,
        profileResponse,
        resumeResponse,
        messagesResponse,
      ] = await Promise.all([
        fetch(`${API}/projects`, {
          cache: "no-store",
        }),

        fetch(`${API}/skills`, {
          cache: "no-store",
        }),

        fetch(`${API}/experience`, {
          cache: "no-store",
        }),

        fetch(`${API}/education`, {
          cache: "no-store",
        }),

        fetch(`${API}/profile`, {
          cache: "no-store",
        }),

        fetch(`${API}/resume`, {
          cache: "no-store",
        }),

        fetch(`${API}/contact`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const [
        projectsData,
        skillsData,
        experienceData,
        educationData,
        profileData,
        resumeData,
        messagesData,
      ] = await Promise.all([
        projectsResponse.json(),
        skillsResponse.json(),
        experienceResponse.json(),
        educationResponse.json(),
        profileResponse.json(),
        resumeResponse.json(),
        messagesResponse.json(),
      ]);

      // =================================================
      // ARRAYS
      // =================================================

      const projectList =
        projectsData.projects || [];

      const skillList =
        skillsData.skills || [];

      const experienceList =
        experienceData.experiences || [];

      const educationList =
        educationData.education ||
        educationData.educations ||
        [];

      const messageList =
        messagesData.messages || [];

      // =================================================
      // UNREAD MESSAGES
      // =================================================

      const unreadCount =
        messageList.filter(
          (item) => !item.read
        ).length;

      // =================================================
      // SET DATA
      // =================================================

      setStats({
        projects: projectList.length,

        skills: skillList.length,

        experience:
          experienceList.length,

        education:
          educationList.length,

        messages:
          messageList.length,

        unreadMessages:
          unreadCount,

        resume:
          !!resumeData.resume,

        profile:
          !!profileData.profile,
      });

      // Recent projects
      setProjects(
        [...projectList]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
          .slice(0, 4)
      );

      // Recent messages
      setMessages(
        [...messageList]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
          .slice(0, 4)
      );
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    icon,
    href,
    description,
  }) => {
    return (
      <Link
        href={href}
        className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
      >
        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm text-slate-400">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {value}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {description}
            </p>

          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl transition group-hover:scale-110">
            {icon}
          </div>

        </div>
      </Link>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-white/10" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/5" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              )
            )}

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-black">
                ⚡
              </div>

              <div>

                <h1 className="text-3xl font-bold">
                  Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your portfolio from one place.
                </p>

              </div>

            </div>

          </div>

          <button
            onClick={() =>
              fetchDashboard(true)
            }
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

              <button
                onClick={() =>
                  fetchDashboard()
                }
                className="rounded-lg border border-red-500/20 px-4 py-2 text-sm hover:bg-red-500/10"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Projects"
            value={stats.projects}
            icon="💼"
            href="/admin/projects"
            description="Portfolio projects"
          />

          <StatCard
            title="Skills"
            value={stats.skills}
            icon="🧠"
            href="/admin/skills"
            description="Technical skills"
          />

          <StatCard
            title="Experience"
            value={stats.experience}
            icon="🚀"
            href="/admin/experience"
            description="Work experience"
          />

          <StatCard
            title="Education"
            value={stats.education}
            icon="🎓"
            href="/admin/education"
            description="Education records"
          />

          <StatCard
            title="Messages"
            value={stats.messages}
            icon="✉️"
            href="/admin/messages"
            description={
              stats.unreadMessages > 0
                ? `${stats.unreadMessages} unread`
                : "No unread messages"
            }
          />

          <StatCard
            title="Unread"
            value={stats.unreadMessages}
            icon="🔔"
            href="/admin/messages"
            description="Messages waiting"
          />

          <StatCard
            title="Profile"
            value={
              stats.profile
                ? "Ready"
                : "Missing"
            }
            icon="👤"
            href="/admin/profile"
            description={
              stats.profile
                ? "Profile is configured"
                : "Complete your profile"
            }
          />

          <StatCard
            title="Resume"
            value={
              stats.resume
                ? "Uploaded"
                : "Missing"
            }
            icon="📄"
            href="/admin/resume"
            description={
              stats.resume
                ? "Resume is available"
                : "Upload your resume"
            }
          />

        </div>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* =================================================
              RECENT PROJECTS
          ================================================= */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Recent Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest projects added to your portfolio.
                </p>

              </div>

              <Link
                href="/admin/projects"
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                View All →
              </Link>

            </div>

            {projects.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">

                <div className="text-4xl">
                  📁
                </div>

                <p className="mt-3 font-semibold">
                  No projects yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first project.
                </p>

                <Link
                  href="/admin/projects"
                  className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  Add Project
                </Link>

              </div>

            ) : (

              <div className="space-y-3">

                {projects.map(
                  (project) => (
                    <div
                      key={
                        project._id
                      }
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.04]"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">

                        {project.image ? (
                          <img
                            src={
                              project.image
                            }
                            alt={
                              project.title
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">
                            💼
                          </span>
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate font-semibold">
                          {project.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {project.technologies
                            ?.slice(
                              0,
                              3
                            )
                            .join(
                              " • "
                            ) ||
                            "Project"}
                        </p>

                      </div>

                      {project.featured && (
                        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300 sm:block">
                          Featured
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>

            )}

          </section>

          {/* =================================================
              RECENT MESSAGES
          ================================================= */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Recent Messages
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest messages from visitors.
                </p>

              </div>

              <Link
                href="/admin/messages"
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                View All →
              </Link>

            </div>

            {messages.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">

                <div className="text-4xl">
                  📭
                </div>

                <p className="mt-3 font-semibold">
                  No messages yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Visitor messages will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {messages.map(
                  (item) => (
                    <Link
                      href="/admin/messages"
                      key={
                        item._id
                      }
                      className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.04]"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <h3 className="truncate font-semibold">
                              {item.name}
                            </h3>

                            {!item.read && (
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                                NEW
                              </span>
                            )}

                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {item.email}
                          </p>

                          <p className="mt-2 truncate text-sm text-slate-400">
                            {item.subject ||
                              item.message}
                          </p>

                        </div>

                        <span className="shrink-0 text-xs text-slate-600">
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : ""}
                        </span>

                      </div>

                    </Link>
                  )
                )}

              </div>

            )}

          </section>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly manage your portfolio.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/admin/projects"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="text-2xl">
                ➕
              </div>

              <h3 className="mt-3 font-semibold">
                Add Project
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add a new portfolio project.
              </p>
            </Link>

            <Link
              href="/admin/profile"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="text-2xl">
                👤
              </div>

              <h3 className="mt-3 font-semibold">
                Edit Profile
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Update your personal information.
              </p>
            </Link>

            <Link
              href="/admin/resume"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="text-2xl">
                📄
              </div>

              <h3 className="mt-3 font-semibold">
                Manage Resume
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Upload or replace your resume.
              </p>
            </Link>

            <Link
              href="/admin/messages"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="text-2xl">
                ✉️
              </div>

              <h3 className="mt-3 font-semibold">
                View Messages
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Check messages from visitors.
              </p>
            </Link>

          </div>

        </section>

        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <span>
            Portfolio Admin Panel
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            System connected
          </span>

        </div>

      </div>

    </main>
  );
}