"use client";

import { FormEvent, useMemo, useState } from "react";

type Role = "owner" | "warden" | "guard" | "security" | "staff" | "tenant" | "parent" | "platform";
type SectionId =
  | "overview"
  | "rooms"
  | "tenants"
  | "gate"
  | "visitors"
  | "finance"
  | "complaints"
  | "announcements"
  | "mess"
  | "documents"
  | "staff"
  | "parents"
  | "notifications"
  | "platform";

type Module = {
  id: SectionId;
  title: string;
  description: string;
  stat: string;
  meta: string;
  roles: Role[];
  action: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT";
};

type LoginState = {
  accessToken: string;
  userName: string;
  email: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

const modules: Module[] = [
  { id: "overview", title: "Overview", description: "Occupancy, requests, dues, and service queue.", stat: "84%", meta: "occupancy", roles: ["owner", "warden"], action: "Refresh", endpoint: "/metrics", method: "GET" },
  { id: "rooms", title: "Rooms", description: "Floors, room capacity, availability, and room history.", stat: "42", meta: "rooms", roles: ["owner", "warden", "guard", "security", "tenant", "parent"], action: "Create room", endpoint: "/rooms", method: "POST" },
  { id: "tenants", title: "Tenants", description: "Residents, room assignment, parent links, and vacate flow.", stat: "118", meta: "active", roles: ["owner", "warden"], action: "Invite tenant", endpoint: "/orgs/invites", method: "POST" },
  { id: "gate", title: "Gate Passes", description: "Outing requests, approval, and check-in/out scanning.", stat: "9", meta: "pending", roles: ["owner", "warden", "guard", "security", "tenant"], action: "Request pass", endpoint: "/gate-passes", method: "POST" },
  { id: "visitors", title: "Visitors", description: "Visitor pre-approval and guard entry/exit logs.", stat: "6", meta: "today", roles: ["owner", "warden", "guard", "security", "tenant"], action: "Add visitor", endpoint: "/visitors", method: "POST" },
  { id: "finance", title: "Dues & Payments", description: "Raise dues, collect payments, and set reminders.", stat: "₹2.4L", meta: "due", roles: ["owner", "warden", "tenant", "parent"], action: "Create due", endpoint: "/dues", method: "POST" },
  { id: "complaints", title: "Complaints", description: "Report, assign, update, and close complaints.", stat: "14", meta: "open", roles: ["owner", "warden", "staff", "guard", "security", "tenant"], action: "Create complaint", endpoint: "/complaints", method: "POST" },
  { id: "announcements", title: "Announcements", description: "Targeted notices by property, floor, room, or tenant.", stat: "3", meta: "unread", roles: ["owner", "warden", "guard", "security", "staff", "tenant"], action: "Create notice", endpoint: "/announcements", method: "POST" },
  { id: "mess", title: "Mess", description: "Weekly menu, publishing, feedback, and summary.", stat: "78%", meta: "rating", roles: ["owner", "warden", "staff", "tenant"], action: "Edit menu", endpoint: "/mess-menus", method: "POST" },
  { id: "documents", title: "Documents", description: "Upload and verify resident documents.", stat: "21", meta: "pending", roles: ["owner", "warden", "tenant"], action: "Upload", endpoint: "/documents", method: "POST" },
  { id: "staff", title: "Staff Contacts", description: "Emergency contacts and staff directory.", stat: "18", meta: "contacts", roles: ["owner", "warden", "guard", "security", "staff", "tenant"], action: "Add contact", endpoint: "/staff-contacts", method: "POST" },
  { id: "parents", title: "Parent Portal", description: "Ward details, privacy, dues, and movement visibility.", stat: "64", meta: "linked", roles: ["owner", "warden", "tenant", "parent"], action: "Link parent", endpoint: "/parents/link", method: "POST" },
  { id: "notifications", title: "Notifications", description: "Pass, payment, complaint, and announcement alerts.", stat: "12", meta: "new", roles: ["owner", "warden", "guard", "security", "staff", "tenant"], action: "Mark read", endpoint: "/notifications", method: "GET" },
  { id: "platform", title: "Platform", description: "Organizations, subscription plans, and feature toggles.", stat: "27", meta: "orgs", roles: ["platform"], action: "View orgs", endpoint: "/platform/organizations", method: "GET" },
];

const dataRows: Record<SectionId, string[][]> = {
  overview: [["Gate pass", "Rohan Patel", "Pending", "7:30 PM return"], ["Complaint", "Water leakage", "Assigned", "Housekeeping"], ["Document", "Aadhaar", "Review", "Aarav Mehta"]],
  rooms: [["A-101", "First floor", "2/2", "Occupied"], ["A-102", "First floor", "2/3", "Available"], ["B-204", "Second floor", "1/1", "Maintenance"], ["C-305", "Third floor", "5/6", "Available"]],
  tenants: [["Aarav Mehta", "A-101", "₹12,000 due", "Active"], ["Isha Rao", "A-102", "₹0 due", "Active"], ["Kabir Singh", "C-305", "₹4,500 due", "Onboarding"]],
  gate: [["Rohan Patel", "Home visit", "Pending", "Out 5 PM"], ["Maya Nair", "Coaching", "Approved", "Return 8 PM"], ["Kabir Singh", "Medical", "Completed", "Returned"]],
  visitors: [["Priya Shah", "Isha Rao", "Approved", "Waiting"], ["Delivery", "Office", "Checked in", "Gate 1"], ["Mr. Nair", "Maya Nair", "Pending", "5 PM"]],
  finance: [["Rent - June", "Aarav Mehta", "₹12,000", "Unpaid"], ["Mess", "Kabir Singh", "₹4,500", "Partial"], ["Deposit", "Isha Rao", "₹20,000", "Paid"]],
  complaints: [["Water leakage", "A-101", "Assigned", "High"], ["Food quality", "Mess", "Open", "Medium"], ["Noise", "C-305", "Closed", "Low"]],
  announcements: [["Water shutdown", "All residents", "Published", "92 reads"], ["Fee reminder", "Tenant", "Draft", "Finance"], ["Mess change", "All floors", "Published", "118 reads"]],
  mess: [["Monday lunch", "Paneer rice", "Published", "82%"], ["Tuesday dinner", "Dal tadka", "Draft", "Pending"], ["Friday snacks", "Poha", "Published", "76%"]],
  documents: [["Aadhaar", "Aarav Mehta", "Pending", "Uploaded"], ["PAN", "Isha Rao", "Verified", "Warden"], ["Passport", "Kabir Singh", "Rejected", "Blurred"]],
  staff: [["Ramesh", "Guard", "Emergency", "Night"], ["Anita", "Warden", "Primary", "Day"], ["Joseph", "Electrician", "On call", "Vendor"]],
  parents: [["Meena Mehta", "Aarav", "Linked", "Dues visible"], ["Ravi Nair", "Maya", "Linked", "Pass visible"], ["Sana Rao", "Isha", "Invited", "Pending"]],
  notifications: [["Gate pass approved", "Maya Nair", "Unread", "Gate"], ["Payment received", "Isha Rao", "Read", "Finance"], ["Visitor waiting", "Priya Shah", "Unread", "Gate"]],
  platform: [["City Complex", "Growth", "Active", "All core modules"], ["North Campus", "Pro", "Trialing", "15 days"], ["Urban Nest", "Starter", "Paused", "Billing hold"]],
};

function normalizeRole(role: string): Role {
  if (role === "security") return "guard";
  return role as Role;
}

function roleLabel(role: string) {
  if (role === "security") return "Security";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function WorkspaceApp({ workspace, role }: { workspace: string; role: string }) {
  const normalizedRole = normalizeRole(role);
  const [login, setLogin] = useState<LoginState | null>(null);
  const [activeId, setActiveId] = useState<SectionId>(normalizedRole === "platform" ? "platform" : "overview");
  const [message, setMessage] = useState("Login to open this private workspace.");
  const [busy, setBusy] = useState(false);
  const propertyName = titleFromSlug(workspace);

  const allowedModules = useMemo(
    () => modules.filter((module) => module.roles.includes(normalizedRole) || module.id === "notifications"),
    [normalizedRole]
  );
  const activeModule = allowedModules.find((module) => module.id === activeId) ?? allowedModules[0] ?? modules[0];

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Checking workspace access...");
    const form = new FormData(event.currentTarget);

    try {
      const isPlatform = normalizedRole === "platform";
      const response = await fetch(`${apiBase}${isPlatform ? "/platform/auth/login" : "/auth/login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          email: form.get("username"),
          password: form.get("password"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      const accessToken = data.accessToken ?? data.token;

      if (!response.ok || !accessToken) {
        setMessage("Login failed. Check email, password, and backend seed data.");
        return;
      }

      if (!isPlatform) {
        const hasWorkspaceRole = Array.isArray(data.roles)
          ? data.roles.some((item: { orgSlug: string; role: string }) => item.orgSlug === workspace && item.role === normalizedRole)
          : false;

        if (!hasWorkspaceRole) {
          setMessage(`This account does not have ${roleLabel(role)} access for ${propertyName}.`);
          return;
        }
      }

      setLogin({
        accessToken,
        userName: data.user?.fullName ?? data.platformUser?.fullName ?? roleLabel(role),
        email: data.user?.email ?? form.get("username")?.toString() ?? "",
      });
      setMessage("Workspace opened.");
    } catch {
      setMessage("Backend is offline. Start the server to login and view this workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function syncModule() {
    if (!login) return;
    setMessage(`Syncing ${activeModule.title}...`);
    try {
      const response = await fetch(`${apiBase}${activeModule.endpoint}`, {
        method: activeModule.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.accessToken}`,
        },
        body: activeModule.method === "GET" ? undefined : JSON.stringify({ orgSlug: workspace, source: "workspace-ui" }),
      });
      setMessage(response.ok ? `${activeModule.title} synced.` : `${activeModule.title} needs valid fields or permissions.`);
    } catch {
      setMessage("Server is not reachable right now.");
    }
  }

  if (!login) {
    return (
      <main>
        <header className="topbar">
          <a className="brand" href="/">
            <span>host</span>in<span>.</span>
          </a>
          <nav className="topnav" aria-label="Workspace">
            <a href="/">Home</a>
            <a href={`/${workspace}/owner`}>Owner</a>
            <a href={`/${workspace}/tenant`}>Tenant</a>
          </nav>
          <a className="outlineButton" href="/">Switch workspace</a>
        </header>

        <section className="portalLogin">
          <div>
            <p className="pill">{propertyName}</p>
            <h1>{roleLabel(role)} portal</h1>
            <p>
              This workspace is private. Sign in with an account that belongs to
              <strong> {propertyName}</strong> and has <strong>{roleLabel(role)}</strong> access.
            </p>
          </div>

          <form className="panel loginPortalCard" onSubmit={handleLogin}>
            <div className="panelTitle">
              <h2>Sign in</h2>
              <span>/{workspace}/{role}</span>
            </div>
            <label>
              <span>Email or phone</span>
              <input name="username" placeholder={`${normalizedRole}@${workspace}.hostin.local`} required />
            </label>
            <label>
              <span>Password</span>
              <input name="password" placeholder="Password" required type="password" />
            </label>
            <button className="gradientButton fullButton" disabled={busy} type="submit">
              {busy ? "Checking..." : `Open ${roleLabel(role)} workspace`}
            </button>
            <p className="formMessage">{message}</p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="topbar appTopbar">
        <button className="brand" onClick={() => setActiveId("overview")} type="button">
          <span>host</span>in<span>.</span>
        </button>
        <nav className="topnav" aria-label="Workspace navigation">
          {allowedModules.slice(0, 6).map((module) => (
            <button key={module.id} onClick={() => setActiveId(module.id)} type="button">
              {module.title}
            </button>
          ))}
        </nav>
        <button className="gradientButton" onClick={syncModule} type="button">
          Sync
        </button>
      </header>

      <section className="workspace appWorkspace">
        <aside className="sidebar appSidebar">
          <div className="workspaceBadge">
            <span>{propertyName}</span>
            <strong>{roleLabel(role)}</strong>
            <small>{login.userName}</small>
          </div>
          <div className="moduleGroup">
            <p>Allowed modules</p>
            {allowedModules.map((module) => (
              <button
                className={module.id === activeModule.id ? "active navItem" : "navItem"}
                key={module.id}
                onClick={() => setActiveId(module.id)}
                type="button"
              >
                {module.title}
              </button>
            ))}
          </div>
          <button className="outlineButton fullButton" onClick={() => setLogin(null)} type="button">Logout</button>
        </aside>

        <section className="content">
          <div className="pageHeader">
            <div>
              <p className="crumb">{propertyName} / {roleLabel(role)}</p>
              <h2>{activeModule.title}</h2>
              <p>{activeModule.description}</p>
            </div>
            <button className="gradientButton" onClick={syncModule} type="button">{activeModule.action}</button>
          </div>

          <div className="syncBanner">
            <span>Workspace</span>
            <p>{message}</p>
          </div>

          <div className="productGrid">
            <section className="panel statGridPanel">
              <div className="statGrid">
                {allowedModules.slice(0, 6).map((module) => (
                  <button className="metricCard" key={module.id} onClick={() => setActiveId(module.id)} type="button">
                    <span>{module.title}</span>
                    <strong>{module.stat}</strong>
                    <small>{module.meta}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel largePanel">
              <PanelTitle title={`${activeModule.title} records`} meta={`${dataRows[activeModule.id].length} items`} />
              <RecordList rows={dataRows[activeModule.id]} />
            </section>

            <section className="panel">
              <PanelTitle title={activeModule.action} meta="Action" />
              <SmartForm module={activeModule} onSubmit={syncModule} />
            </section>

            <section className="panel">
              <PanelTitle title="Workflow" meta="Role access" />
              <div className="timeline">
                {workflowFor(activeModule.id).map((item, index) => (
                  <div key={item}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

function PanelTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="panelTitle">
      <h3>{title}</h3>
      <span>{meta}</span>
    </div>
  );
}

function RecordList({ rows }: { rows: string[][] }) {
  return (
    <div className="recordList">
      {rows.map((row) => (
        <button key={row.join("-")} type="button">
          <div>
            <strong>{row[0]}</strong>
            <small>{row[1]}</small>
          </div>
          <div>
            <span>{row[2]}</span>
            <small>{row[3]}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function SmartForm({ module, onSubmit }: { module: Module; onSubmit: () => void }) {
  return (
    <form
      className="smartForm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {fieldsFor(module.id).map((field) => (
        <label key={field}>
          <span>{field}</span>
          <input placeholder={field} />
        </label>
      ))}
      <button className="gradientButton fullButton" type="submit">{module.action}</button>
    </form>
  );
}

function fieldsFor(id: SectionId) {
  const map: Record<SectionId, string[]> = {
    overview: ["Search", "Date"],
    rooms: ["Room number", "Floor", "Capacity", "Room type"],
    tenants: ["Full name", "Email", "Room", "Role"],
    gate: ["Reason", "Destination", "Expected return", "Emergency contact"],
    visitors: ["Visitor name", "Phone", "Tenant", "Purpose"],
    finance: ["Tenant", "Due type", "Amount", "Due date"],
    complaints: ["Category", "Priority", "Description", "Assign to"],
    announcements: ["Title", "Message", "Target type", "Target"],
    mess: ["Week start", "Meal", "Dish", "Notes"],
    documents: ["Tenant", "Document type", "Document number", "File URL"],
    staff: ["Name", "Role", "Phone", "Emergency flag"],
    parents: ["Parent email", "Tenant", "Relationship", "Privacy"],
    notifications: ["Notification ID", "Status"],
    platform: ["Organization", "Plan", "Feature key", "Status"],
  };

  return map[id];
}

function workflowFor(id: SectionId) {
  const map: Record<SectionId, string[]> = {
    overview: ["Review metrics", "Open priority queue", "Assign owners"],
    rooms: ["Create floor", "Create room", "Assign tenant", "Track history"],
    tenants: ["Invite tenant", "Assign room", "Link parent", "Collect documents"],
    gate: ["Tenant requests", "Warden approves", "Guard scans out", "Guard scans in"],
    visitors: ["Create visitor", "Approve visit", "Check in", "Check out"],
    finance: ["Raise due", "Send reminder", "Record payment", "Close balance"],
    complaints: ["Tenant reports", "Assign staff", "Update status", "Resolve issue"],
    announcements: ["Write notice", "Choose target", "Publish", "Track reads"],
    mess: ["Create menu", "Publish week", "Collect feedback", "Review summary"],
    documents: ["Upload document", "Review details", "Verify", "Keep audit trail"],
    staff: ["Add contact", "Set role", "Mark emergency", "Publish directory"],
    parents: ["Link parent", "Set privacy", "Show ward", "Review dues"],
    notifications: ["List alerts", "Open detail", "Mark read", "Follow up"],
    platform: ["Create plan", "Add organization", "Toggle features", "Monitor usage"],
  };

  return map[id];
}
