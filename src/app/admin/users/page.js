"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [isSuper, setIsSuper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // ucitavanje liste admina
  useEffect(() => {
    async function loadAdmins() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/users");
        if (res.status === 401) {
          setError("Unauthorized – please log in again.");
          return;
        }
        if (res.status === 403) {
          setError("Only super admins can manage users.");
          return;
        }
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin users.");
      } finally {
        setLoading(false);
      }
    }
    loadAdmins();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pwd.trim()) {
      toast.error("Fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: pwd.trim(),
          isSuper,
        }),
      });

      if (res.status === 409) {
        toast.error("Email already in use.");
        return;
      }

      if (res.status === 403) {
        toast.error("Only super admins can create users.");
        return;
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }

      const created = await res.json();
      setAdmins((prev) => [...prev, created]);
      toast.success("Admin user created.");
      setName("");
      setEmail("");
      setPwd("");
      setIsSuper(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create admin user.");
    } finally {
      setSaving(false);
    }
  }
  function startEdit(admin) {
    setEditingId(admin.id);
    setEditName(admin.name);
    setEditEmail(admin.email);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  }

  async function saveEdit(id) {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Fill in name and email.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
        }),
      });

      if (res.status === 409) {
        toast.error("Email already in use.");
        return;
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }

      const updated = await res.json();

      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );

      toast.success("Admin updated.");
      cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update admin.");
    }
  }

  async function deleteAdmin(id) {
    if (!window.confirm("Delete this admin user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }

      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.success("Admin deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete admin.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-slate-900">
          Users
        </h1>

        {/* Forma za dodavanje admina */}
        <section className="mb-8 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-medium mb-3 text-slate-900">
            Add new admin
          </h2>

          <form
            onSubmit={onSubmit}
            className="grid gap-4 sm:grid-cols-2 sm:gap-6"
          >
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="isSuper"
                type="checkbox"
                className="h-4 w-4 border-slate-300 rounded"
                checked={isSuper}
                onChange={(e) => setIsSuper(e.target.checked)}
              />
              <label
                htmlFor="isSuper"
                className="text-sm text-slate-700 select-none"
              >
                Super admin
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--green-primary)] text-white text-sm font-semibold px-4 py-2 uppercase tracking-wide hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Add admin"}
              </button>
            </div>
          </form>
        </section>

        {/* Lista admina */}
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-medium mb-3 text-slate-900">
            Existing admins
          </h2>

          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-slate-600">No admins yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      ID
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      Email
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      Role
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      Created
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((a) => {
                    const isEditing = editingId === a.id;
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="py-2 px-3 text-slate-800">{a.id}</td>

                        <td className="py-2 px-3 text-slate-800">
                          {isEditing ? (
                            <input
                              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            a.name
                          )}
                        </td>

                        <td className="py-2 px-3 text-slate-700">
                          {isEditing ? (
                            <input
                              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                          ) : (
                            a.email
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {a.isSuper ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              SUPER
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              ADMIN
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-slate-500">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString()
                            : "-"}
                        </td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(a.id)}
                                className="text-xs px-3 py-1 rounded bg-[var(--green-primary)] text-white hover:brightness-110"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(a)}
                                className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAdmin(a.id)}
                                className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
