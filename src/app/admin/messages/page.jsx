"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/contact";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch messages"
        );
      }

      setMessages(data.messages || []);
    } catch (error) {
      console.error("Messages Error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // MARK AS READ
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API}/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark message as read"
        );
      }

      fetchMessages();
    } catch (error) {
      console.error("Mark Read Error:", error);
      alert(error.message);
    }
  };

  // DELETE MESSAGE
  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete message"
        );
      }

      fetchMessages();
    } catch (error) {
      console.error("Delete Message Error:", error);
      alert(error.message);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Loading messages...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
            Contact
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Messages
          </h1>

          <p className="text-slate-400 mt-2">
            Messages received from your portfolio contact form.
          </p>
        </div>

        <div className="flex gap-3">

          <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500">
              Total
            </p>

            <p className="text-xl font-bold mt-1">
              {messages.length}
            </p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500">
              Unread
            </p>

            <p className="text-xl font-bold mt-1">
              {messages.filter((item) => !item.read).length}
            </p>
          </div>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-5 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          ❌ {error}
        </div>
      )}

      {/* NO MESSAGES */}
      {!error && messages.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.03]">

          <div className="text-5xl mb-5">
            📭
          </div>

          <h2 className="text-2xl font-bold">
            No Messages Yet
          </h2>

          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            When someone submits the contact form on your
            portfolio, their message will appear here.
          </p>

        </div>
      )}

      {/* MESSAGES */}
      {messages.length > 0 && (
        <div className="space-y-5">

          {messages.map((item) => (
            <div
              key={item._id}
              className={`
                rounded-3xl
                border
                p-6
                md:p-7
                transition
                ${
                  item.read
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/20 bg-white/[0.05]"
                }
              `}
            >

              {/* TOP */}
              <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                <div className="flex-1">

                  {/* NAME */}
                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-xl md:text-2xl font-bold">
                      {item.name}
                    </h2>

                    {!item.read && (
                      <span className="px-3 py-1 text-xs rounded-full bg-white text-slate-950 font-bold">
                        NEW
                      </span>
                    )}

                    {item.read && (
                      <span className="px-3 py-1 text-xs rounded-full bg-white/5 text-slate-500 border border-white/10">
                        READ
                      </span>
                    )}

                  </div>

                  {/* EMAIL */}
                  <a
                    href={`mailto:${item.email}`}
                    className="inline-block mt-2 text-slate-400 hover:text-white transition"
                  >
                    {item.email}
                  </a>

                  {/* SUBJECT */}
                  {item.subject && (
                    <div className="mt-5">

                      <p className="text-xs uppercase tracking-wider text-slate-600">
                        Subject
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {item.subject}
                      </p>

                    </div>
                  )}

                  {/* MESSAGE */}
                  <div className="mt-5">

                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Message
                    </p>

                    <p className="mt-2 text-slate-300 leading-7 whitespace-pre-wrap">
                      {item.message}
                    </p>

                  </div>

                  {/* DATE */}
                  <p className="text-xs text-slate-600 mt-6">
                    Received:{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>

                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap lg:flex-col gap-3">

                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item._id)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/10 transition"
                    >
                      ✓ Mark Read
                    </button>
                  )}

                  <a
                    href={`mailto:${item.email}?subject=Re: ${
                      item.subject || "Your message"
                    }`}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-center hover:bg-white/10 transition"
                  >
                    ↩ Reply
                  </a>

                  <button
                    onClick={() => deleteMessage(item._id)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition"
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}