import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";

const makeCode = (name = "") => {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8) || "PARTNER";
  return base + "-" + String(Math.floor(Math.random() * 900) + 100);
};

export default function PartnerAdminPage() {
  const [user, setUser] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
    return unsub;
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setNotice("");
    try {
      const q = query(collection(db, "partnerApplications"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setApplications(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (err) {
      console.error(err);
      setNotice("Could not load partner applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadApplications();
  }, [user]);

  const visible = useMemo(() => {
    if (filter === "All") return applications;
    return applications.filter((item) => item.status === filter);
  }, [applications, filter]);

  const login = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.error(err);
      setAuthError("Sign-in failed. Check your Firebase admin email and password.");
    }
  };

  const updateApplication = async (application, changes) => {
    setSavingId(application.id);
    setNotice("");
    try {
      await updateDoc(doc(db, "partnerApplications", application.id), {
        ...changes,
        updatedAt: Timestamp.now(),
      });

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, ...changes } : item
        )
      );
    } catch (err) {
      console.error(err);
      setNotice("Could not update that partner application.");
    } finally {
      setSavingId("");
    }
  };

  const approve = async (application) => {
    const partnerCode = application.partnerCode || makeCode(application.businessName);
    await updateApplication(application, {
      status: "Approved",
      partnerCode,
      approvedAt: Timestamp.now(),
    });
  };

  const deny = async (application) => {
    await updateApplication(application, {
      status: "Denied",
      deniedAt: Timestamp.now(),
    });
  };

  const markReview = async (application) => {
    await updateApplication(application, {
      status: "Review",
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };

  if (user === undefined) {
    return <main className="min-h-screen bg-[#f4f0e7]" />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f4f0e7] px-5 py-16 text-[#171512]">
        <div className="mx-auto max-w-md rounded-[32px] border border-black/10 bg-white p-7 shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">
            Junk Buddies Admin
          </div>
          <h1 className="mt-3 text-3xl font-black">Partner applications</h1>
          <p className="mt-2 text-sm leading-6 text-black/50">
            Sign in with an existing Firebase Authentication account.
          </p>

          <form onSubmit={login} className="mt-6 space-y-3">
            <input
              className="w-full rounded-2xl border border-black/10 bg-[#fbf9f4] px-4 py-3.5 outline-none focus:border-[#b89b46]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              autoComplete="email"
            />
            <input
              className="w-full rounded-2xl border border-black/10 bg-[#fbf9f4] px-4 py-3.5 outline-none focus:border-[#b89b46]"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {authError}
              </div>
            )}
            <button className="jb-polished-gold-button w-full" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f0e7] px-4 py-8 text-[#171512] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-[32px] border border-black/10 bg-white/85 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">
              Partner Admin
            </div>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Applications</h1>
            <p className="mt-2 text-sm text-black/45">
              Review new partner leads, approve accounts, and assign partner codes.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadApplications}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold"
            >
              Refresh
            </button>
            <button
              onClick={() => signOut(auth)}
              className="rounded-xl bg-[#171512] px-4 py-2.5 text-sm font-bold text-white"
            >
              Sign Out
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-4">
          {["All", "New", "Review", "Approved"].map((status) => {
            const count =
              status === "All"
                ? applications.length
                : applications.filter((item) => item.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={
                  "rounded-2xl border p-4 text-left transition " +
                  (filter === status
                    ? "border-[#171512] bg-[#171512] text-white"
                    : "border-black/10 bg-white/75")
                }
              >
                <div className="text-2xl font-black">{count}</div>
                <div className={filter === status ? "text-white/55" : "text-black/45"}>
                  {status}
                </div>
              </button>
            );
          })}
        </section>

        {notice && (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {notice}
          </div>
        )}

        <section className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-black/45">
              Loading applications...
            </div>
          ) : visible.length ? (
            visible.map((application) => (
              <article
                key={application.id}
                className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black">{application.businessName || "Unnamed business"}</h2>
                      <span className="rounded-full bg-[#f0eadc] px-3 py-1 text-xs font-bold text-[#856b28]">
                        {application.status || "New"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-black/40">
                      {application.category || "—"} • received {formatDate(application.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {application.status !== "Review" && application.status !== "Approved" && (
                      <button
                        onClick={() => markReview(application)}
                        disabled={savingId === application.id}
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-bold"
                      >
                        Mark Review
                      </button>
                    )}
                    {application.status !== "Approved" && (
                      <button
                        onClick={() => approve(application)}
                        disabled={savingId === application.id}
                        className="jb-polished-gold-button px-4 py-2 text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {application.status !== "Denied" && (
                      <button
                        onClick={() => deny(application)}
                        disabled={savingId === application.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
                      >
                        Deny
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-black/8 pt-5 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Contact</div>
                    <div className="mt-1 font-bold">{application.contactName || "—"}</div>
                    <div className="text-sm text-black/50">{application.role || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Email / phone</div>
                    <div className="mt-1 break-all text-sm font-semibold">{application.email || "—"}</div>
                    <div className="text-sm text-black/50">{application.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Service area</div>
                    <div className="mt-1 text-sm font-semibold">{application.serviceArea || "—"}</div>
                    <div className="text-sm text-black/50">{application.website || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Partner code</div>
                    <div className="mt-1 text-lg font-black text-[#8e742a]">{application.partnerCode || "Not assigned"}</div>
                  </div>
                </div>

                {(application.audience || application.volume || application.notes) && (
                  <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7f3eb] p-4 md:grid-cols-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Audience</div>
                      <div className="mt-1 text-sm text-black/65">{application.audience || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Expected volume</div>
                      <div className="mt-1 text-sm text-black/65">{application.volume || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Notes</div>
                      <div className="mt-1 text-sm text-black/65">{application.notes || "—"}</div>
                    </div>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-black/45">
              No partner applications in this view.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
