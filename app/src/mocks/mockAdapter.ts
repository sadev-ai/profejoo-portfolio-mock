import type { AxiosAdapter, AxiosResponse } from "axios";

type Json = Record<string, any>;

const STORAGE = {
  profile: "profejoo-demo-profile",
  resumes: "profejoo-demo-resumes",
  notifications: "profejoo-demo-notifications",
  sessions: "profejoo-demo-chat-sessions",
  history: "profejoo-demo-chat-history",
} as const;

const demoUser = {
  id: 101,
  user_id: 101,
  email: "demo@profejoo.dev",
  username: "Portfolio Demo",
  role: "user",
  verified: true,
};

const demoToken =
  "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMDEiLCJlbWFpbCI6ImRlbW9AcHJvZmVqb28uZGV2IiwiZXhwIjo0MTAyNDQ0ODAwfQ.demo-signature";

const demoProfile = {
  profile_id: 1,
  completeness: 88,
  updated_at: new Date().toISOString(),
  data: {
    basics: {
      first_name: "Alex",
      last_name: "Morgan",
      full_name: "Alex Morgan",
      email: "demo@profejoo.dev",
      phone: "+1 555 010 2040",
      city: "Berlin",
      country: "Germany",
      location: "Berlin, Germany",
      website: "https://example.dev",
      linkedin: "https://linkedin.com/in/example",
      summary:
        "Computer engineering graduate focused on applied machine learning, distributed systems, and research-oriented software engineering.",
      tags: ["Machine Learning", "Distributed Systems", "Research"],
    },
    academics: [
      {
        title: "M.Sc. Computer Science",
        institution: "Northbridge University",
        location: "Berlin, Germany",
        start: "2024-09",
        end: "2026-07",
        gpa: "1.4",
        gpa_format: "German scale",
        description: "Research track in intelligent systems and scalable data platforms.",
      },
    ],
    experience: [
      {
        type: "ra",
        title: "Research Assistant",
        organization: "Intelligent Systems Lab",
        location: "Berlin, Germany",
        start: "2025-02",
        current: true,
        professor: "Dr. Sara Mitchell",
        description: "Built evaluation tooling and data pipelines for research prototypes.",
        bullets: [
          "Designed reusable experiment dashboards for model evaluation.",
          "Collaborated with researchers to turn papers into reproducible prototypes.",
        ],
        tags: ["Python", "React", "ML"],
      },
      {
        type: "work",
        title: "Frontend Engineer Intern",
        organization: "Orbit Labs",
        location: "Remote",
        start: "2024-06",
        end: "2024-12",
        employment_type: "Internship",
        work_arrangement: "Remote",
        bullets: [
          "Implemented responsive product flows in React and TypeScript.",
          "Integrated REST APIs with loading, error, and empty states.",
        ],
        tags: ["React", "TypeScript", "REST"],
      },
    ],
    output: [
      {
        title: "Research Match Explorer",
        type: "project",
        venue: "Portfolio Project",
        year: "2026",
        link: "https://example.dev/projects/research-match",
        summary: "Search and filtering prototype for discovering research supervisors.",
        tags: ["Search UX", "React", "TypeScript"],
      },
      {
        title: "Efficient Retrieval for Academic Profiles",
        type: "publication",
        venue: "Demo Workshop",
        year: "2025",
        summary: "Synthetic demo publication used only in this public portfolio build.",
        tags: ["Information Retrieval", "NLP"],
      },
    ],
    credentials: [
      {
        title: "Cloud Fundamentals",
        issuer: "Demo Academy",
        year: "2025",
        link: "https://example.dev/certificate",
        description: "Portfolio-only sample credential.",
      },
    ],
    skill_groups: [
      { name: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Vite"] },
      { name: "Data & APIs", items: ["REST", "PostgreSQL", "Python"] },
    ],
    links: [
      { title: "GitHub", url: "https://github.com/example" },
      { title: "Portfolio", url: "https://example.dev" },
    ],
    languages: ["English — C1", "German — B1"],
    interests: ["Machine Learning", "Human-computer interaction", "Open-source software"],
    extras: [
      {
        title: "Student Tech Community Volunteer",
        organization: "Northbridge Computing Society",
        start: "2024-01",
        current: true,
        bullets: ["Organized peer-learning sessions and project showcases."],
        tags: ["Community", "Mentoring"],
      },
    ],
  },
};

const demoResumes = [
  {
    id: 1,
    title: "Research Internship CV",
    template: "modern",
    style: "Modern",
    source: "manual",
    status: "published",
    pages: 1,
    tags: ["research", "completeness:88"],
    completeness: 88,
    created_at: "2026-08-10T09:00:00.000Z",
    updated_at: "2026-09-20T15:30:00.000Z",
    data: { template: "modern", sections: demoProfile.data },
  },
  {
    id: 2,
    title: "Frontend Engineer CV",
    template: "minimal",
    style: "Minimal",
    source: "manual",
    status: "draft",
    pages: 1,
    tags: ["frontend", "completeness:74"],
    completeness: 74,
    created_at: "2026-09-01T09:00:00.000Z",
    updated_at: "2026-10-01T12:10:00.000Z",
    data: { template: "minimal", sections: demoProfile.data },
  },
];

const demoNotifications = [
  {
    id: 1,
    body: "Your research-focused resume is ready for review.",
    data_json: JSON.stringify({ action: "open_resume", resumeId: 1 }),
    is_read: false,
    title: "Resume updated",
    type: "resume",
    user_id: 101,
  },
  {
    id: 2,
    body: "Three professor profiles match your saved research interests.",
    data_json: JSON.stringify({ action: "open_search" }),
    is_read: false,
    title: "New research matches",
    type: "search",
    user_id: 101,
  },
  {
    id: 3,
    body: "Complete your links section to improve profile completeness.",
    data_json: JSON.stringify({ action: "open_profile" }),
    is_read: true,
    title: "Profile tip",
    type: "reminder",
    user_id: 101,
  },
];

const professors = [
  {
    id: "p-101",
    display_name: "Dr. Sara Mitchell",
    department: "Computer Science",
    university: "Northbridge University",
    country: "Germany",
    subject: "Machine Learning",
    tags: ["Deep Learning", "NLP", "Representation Learning"],
    bio: "Leads a research group working on robust and efficient learning systems.",
    highlights: ["120+ publications", "Leads the Intelligent Systems Lab"],
    h_index: 47,
    cited_by_count: 12600,
    works_count: 148,
    years_active: 16,
  },
  {
    id: "p-102",
    display_name: "Dr. Daniel Cho",
    department: "Electrical and Computer Engineering",
    university: "Westlake Institute of Technology",
    country: "Canada",
    subject: "Computer Vision",
    tags: ["Robotics", "Computer Vision", "Edge AI"],
    bio: "Studies visual perception and embedded intelligence for autonomous systems.",
    highlights: ["Open robotics datasets", "Industry research collaborations"],
    h_index: 39,
    cited_by_count: 8900,
    works_count: 112,
    years_active: 13,
  },
  {
    id: "p-103",
    display_name: "Dr. Leila Haddad",
    department: "Informatics",
    university: "Riverton Technical University",
    country: "Netherlands",
    subject: "Distributed Systems",
    tags: ["Cloud Computing", "Distributed Systems", "Reliability"],
    bio: "Researches resilient distributed platforms and developer tooling.",
    highlights: ["Cloud reliability research", "Open-source systems tooling"],
    h_index: 35,
    cited_by_count: 7200,
    works_count: 96,
    years_active: 14,
  },
  {
    id: "p-104",
    display_name: "Dr. Kenji Watanabe",
    department: "Computing",
    university: "Eastport Science University",
    country: "Japan",
    subject: "Human-Computer Interaction",
    tags: ["HCI", "Accessibility", "Interactive Systems"],
    bio: "Explores accessible interaction patterns for intelligent products.",
    highlights: ["Accessibility lab director", "Design systems research"],
    h_index: 31,
    cited_by_count: 5400,
    works_count: 83,
    years_active: 12,
  },
];

const universities = [
  {
    id: "u-1",
    name: "Northbridge University",
    country: "Germany",
    city: "Berlin",
    qsRanking: 81,
    professors: 186,
    subject: "Computer Science",
    qsRankingSubject: 54,
    international_students: 8200,
  },
  {
    id: "u-2",
    name: "Westlake Institute of Technology",
    country: "Canada",
    city: "Vancouver",
    qsRanking: 104,
    professors: 142,
    subject: "Engineering & Technology",
    qsRankingSubject: 66,
    international_students: 6100,
  },
  {
    id: "u-3",
    name: "Riverton Technical University",
    country: "Netherlands",
    city: "Rotterdam",
    qsRanking: 132,
    professors: 121,
    subject: "Computer Science",
    qsRankingSubject: 72,
    international_students: 5400,
  },
  {
    id: "u-4",
    name: "Eastport Science University",
    country: "Japan",
    city: "Yokohama",
    qsRanking: 149,
    professors: 138,
    subject: "Information Systems",
    qsRankingSubject: 83,
    international_students: 3900,
  },
];

function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return structuredClone(fallback);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return structuredClone(fallback);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function storageSet<T>(key: string, value: T): T {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function parseData(data: unknown): any {
  if (typeof data !== "string") return data ?? {};
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function response(config: any, data: any, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    headers: { "x-profejoo-demo": "true" },
    config,
  } as AxiosResponse;
}

function routePath(url?: string): string {
  const raw = url || "/";
  try {
    return new URL(raw, "http://demo.local").pathname;
  } catch {
    return raw.split("?")[0] || "/";
  }
}

function profileCompleteness(data: Json): number {
  const groups = [
    data.basics?.first_name && data.basics?.email,
    data.academics?.length,
    data.experience?.length,
    data.output?.length,
    data.skill_groups?.length,
    data.links?.length,
    data.languages?.length,
    data.interests?.length,
  ];
  return Math.round((groups.filter(Boolean).length / groups.length) * 100);
}

function filterRows<T extends Json>(rows: T[], payload: Json): T[] {
  const query = String(payload.query || "").toLowerCase();
  const countries = Array.isArray(payload.countries) ? payload.countries : [];
  const subjects = Array.isArray(payload.subjects) ? payload.subjects : [];
  const universityNames = Array.isArray(payload.universities) ? payload.universities : [];

  return rows.filter((row) => {
    const haystack = JSON.stringify(row).toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (countries.length && !countries.includes(row.country)) return false;
    if (subjects.length && !subjects.some((s: string) => haystack.includes(String(s).toLowerCase()))) return false;
    if (universityNames.length) {
      const name = row.university ?? row.name;
      if (!universityNames.includes(name)) return false;
    }
    return true;
  });
}

function makeSearchResponse(rows: Json[], payload: Json) {
  const limit = Number(payload.limit || 24);
  const offset = Number(payload.offset || 0);
  const filtered = filterRows(rows, payload);
  return {
    numberOfPages: Math.max(1, Math.ceil(filtered.length / limit)),
    pageNumber: Math.floor(offset / limit) + 1,
    pageLength: limit,
    totalResults: filtered.length,
    orderBy: payload.orderBy || "alphabet",
    orderDir: payload.orderDir || "asc",
    pageResults: filtered.slice(offset, offset + limit),
  };
}

function resumeDetail(item: any) {
  return {
    ...item,
    data: item.data ?? { template: item.template, sections: demoProfile.data },
  };
}

function listItem(item: any) {
  const { data: _data, ...rest } = item;
  return rest;
}

function chatReply(content: string): string {
  const q = content.toLowerCase();
  if (q.includes("professor") || q.includes("supervisor")) {
    return "For a stronger supervisor shortlist, combine research-topic fit, recent publications, lab activity, and whether the professor is currently taking students. The Search page in this demo shows how those filters are handled.";
  }
  if (q.includes("resume") || q.includes("cv")) {
    return "Start with a targeted one-page CV, quantify project outcomes, and move the most relevant research or engineering work above less relevant experience. You can edit the demo profile and generate a resume from it.";
  }
  if (q.includes("email") || q.includes("sop")) {
    return "Keep outreach concise: one specific reason for contacting the professor, one or two relevant experiences, and a clear ask. The Email & SOP workspace in this portfolio build stores drafts locally.";
  }
  return "This is the portfolio demo assistant. Try asking about finding professors, improving a CV, or writing academic outreach. Responses are deterministic mock data and do not call a private AI service.";
}

export const demoAxiosAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const method = (config.method || "get").toLowerCase();
  const path = routePath(config.url);
  const body = parseData(config.data) || {};

  // Authentication
  if (method === "post" && ["/api/v1/auth/login", "/api/v1/auth/google", "/api/v1/auth/signup/verify", "/api/v1/auth/refresh", "/auth/refresh"].includes(path)) {
    return response(config, {
      access_token: demoToken,
      refresh_token: "demo-refresh-token",
      expires_at: 4102444800,
      user: { ...demoUser, email: body.email || demoUser.email },
    });
  }
  if (method === "post" && path === "/api/v1/auth/signup") {
    return response(config, { ok: true, message: "Demo OTP sent", cooldown: 30 });
  }
  if (method === "post" && path === "/api/v1/auth/forgot-password") {
    return response(config, { ok: true, cooldown: 30 });
  }
  if (method === "post" && path === "/api/v1/auth/reset-password") return response(config, { ok: true });
  if (method === "post" && path === "/api/v1/auth/logout") return response(config, { ok: true });
  if (method === "get" && path === "/api/v1/me") return response(config, demoUser);

  // Profile
  if (path === "/api/v1/profile" && method === "get") {
    return response(config, storageGet(STORAGE.profile, demoProfile));
  }
  if (path === "/api/v1/profile" && ["patch", "put"].includes(method)) {
    const current = storageGet<any>(STORAGE.profile, demoProfile);
    const nextData = method === "put" ? body : { ...current.data, ...body };
    const next = {
      ...current,
      data: nextData,
      completeness: profileCompleteness(nextData),
      updated_at: new Date().toISOString(),
    };
    storageSet(STORAGE.profile, next);
    return response(config, next);
  }

  // Resume CRUD
  if (path === "/api/v1/resumes" && method === "get") {
    const items = storageGet<any[]>(STORAGE.resumes, demoResumes);
    return response(config, { data: items.map(listItem), total: items.length, limit: 50, offset: 0 });
  }
  if (path === "/api/v1/resumes/from-profile" && method === "post") {
    const items = storageGet<any[]>(STORAGE.resumes, demoResumes);
    const profile = storageGet<any>(STORAGE.profile, demoProfile);
    const id = Math.max(0, ...items.map((x) => Number(x.id) || 0)) + 1;
    const now = new Date().toISOString();
    const item = {
      id,
      title: body.title || "Resume from Profile",
      template: body.template || "modern",
      style: "Modern",
      source: "profile",
      status: "draft",
      pages: 1,
      tags: [`completeness:${profile.completeness}`],
      completeness: profile.completeness,
      created_at: now,
      updated_at: now,
      data: { template: body.template || "modern", sections: profile.data },
    };
    storageSet(STORAGE.resumes, [item, ...items]);
    return response(config, item, 201);
  }
  if (path === "/api/v1/resumes/import" && method === "post") {
    const items = storageGet<any[]>(STORAGE.resumes, demoResumes);
    const id = Math.max(0, ...items.map((x) => Number(x.id) || 0)) + 1;
    const now = new Date().toISOString();
    const item = {
      id,
      title: "Imported Resume (Demo)",
      template: "minimal",
      style: "Minimal",
      source: "import",
      status: "draft",
      pages: 1,
      tags: ["imported", "completeness:68"],
      completeness: 68,
      created_at: now,
      updated_at: now,
      data: { template: "minimal", sections: demoProfile.data, imported_summary: ["Demo import — no file leaves your browser."] },
    };
    storageSet(STORAGE.resumes, [item, ...items]);
    return response(config, item, 201);
  }
  if (path === "/api/v1/resumes" && method === "post") {
    const items = storageGet<any[]>(STORAGE.resumes, demoResumes);
    const id = Math.max(0, ...items.map((x) => Number(x.id) || 0)) + 1;
    const now = new Date().toISOString();
    const item = {
      id,
      title: body.title || `Resume ${id}`,
      template: body.template || "modern",
      style: body.style || "Modern",
      source: body.source || "manual",
      status: body.status || "draft",
      pages: body.pages || 1,
      tags: body.tags || [],
      completeness: body.completeness || 0,
      created_at: now,
      updated_at: now,
      data: { notes: body.notes, section_order: body.order, template: body.template || "modern", sections: body.sections || {} },
    };
    storageSet(STORAGE.resumes, [item, ...items]);
    return response(config, item, 201);
  }

  const resumeMatch = path.match(/^\/api\/v1\/resumes\/(\d+)$/);
  if (resumeMatch) {
    const id = Number(resumeMatch[1]);
    const items = storageGet<any[]>(STORAGE.resumes, demoResumes);
    const index = items.findIndex((x) => Number(x.id) === id);
    const current = index >= 0 ? items[index] : null;
    if (!current) return response(config, { message: "Resume not found" }, 404);
    if (method === "get") return response(config, resumeDetail(current));
    if (["patch", "put"].includes(method)) {
      const next = {
        ...current,
        ...body,
        updated_at: new Date().toISOString(),
        data: {
          ...(current.data || {}),
          ...(body.data || {}),
          sections: body.sections ?? current.data?.sections ?? {},
          template: body.template ?? current.data?.template ?? current.template,
        },
      };
      items[index] = next;
      storageSet(STORAGE.resumes, items);
      return response(config, resumeDetail(next));
    }
    if (method === "delete") {
      storageSet(STORAGE.resumes, items.filter((x) => Number(x.id) !== id));
      return response(config, null, 204);
    }
  }

  // Search + metadata
  if (method === "get" && path === "/api/v1/search/filters/metadata") {
    return response(config, {
      countries: ["Canada", "Germany", "Japan", "Netherlands"],
      subjects: ["Computer Science", "Computer Vision", "Distributed Systems", "Human-Computer Interaction", "Machine Learning"],
      universities: universities.map((u, index) => ({ id: index + 1, name: u.name })),
      sortOptions: {
        professors: [
          { value: "alphabet", label: "Alphabetical", defaultDir: "asc" },
          { value: "h_index", label: "H-Index", defaultDir: "desc" },
          { value: "citation", label: "Citation", defaultDir: "desc" },
        ],
        universities: [
          { value: "alphabet", label: "Alphabetical", defaultDir: "asc" },
          { value: "qs_ranking", label: "QS Ranking", defaultDir: "asc" },
          { value: "professors_count", label: "Professors Count", defaultDir: "desc" },
        ],
      },
    });
  }
  if (method === "post" && path === "/api/v1/search/professors/advanced") return response(config, makeSearchResponse(professors, body));
  if (method === "post" && path === "/api/v1/search/universities/advanced") return response(config, makeSearchResponse(universities, body));

  const professorMatch = path.match(/^\/api\/v1\/professor-metadata\/(.+)$/);
  if (method === "get" && professorMatch) {
    const id = decodeURIComponent(professorMatch[1]);
    const prof = professors.find((p) => p.id === id) || professors[0];
    return response(config, {
      id: prof.id,
      display_name: prof.display_name,
      department: prof.department,
      subject: prof.subject,
      tags: prof.tags,
      bio: prof.bio,
      highlights: prof.highlights,
      h_index: prof.h_index,
      cited_by_count: prof.cited_by_count,
      works_count: prof.works_count,
      years_active: prof.years_active,
      scholar_link: "https://scholar.google.com/",
      openalex_id: "https://openalex.org/",
      orcid: "https://orcid.org/",
      primary_university: {
        name: prof.university,
        country: prof.country,
        city: prof.country === "Germany" ? "Berlin" : "Demo City",
        website: "https://example.edu",
      },
    });
  }

  // Notifications
  if (path === "/api/v1/notifications" && method === "get") {
    return response(config, storageGet(STORAGE.notifications, demoNotifications));
  }
  if (path === "/api/v1/notifications" && method === "post") {
    const items = storageGet<any[]>(STORAGE.notifications, demoNotifications);
    const id = Math.max(0, ...items.map((x) => Number(x.id) || 0)) + 1;
    const item = {
      id,
      body: body.body || "Demo notification",
      data_json: JSON.stringify(body.data || {}),
      is_read: false,
      title: body.title || "Notification",
      type: body.type || "general",
      user_id: body.user_id || 101,
    };
    storageSet(STORAGE.notifications, [item, ...items]);
    return response(config, item, 201);
  }
  const notificationReadMatch = path.match(/^\/api\/v1\/notifications\/(\d+)\/read$/);
  if (notificationReadMatch && ["patch", "post"].includes(method)) {
    const id = Number(notificationReadMatch[1]);
    const items = storageGet<any[]>(STORAGE.notifications, demoNotifications).map((x) => Number(x.id) === id ? { ...x, is_read: true } : x);
    storageSet(STORAGE.notifications, items);
    return response(config, { ok: true });
  }

  // Chatbot — deterministic portfolio stub
  if (method === "get" && path === "/api/v1/chat/session") {
    const session = { session_id: "demo-session", title: "Portfolio demo chat", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    storageSet(STORAGE.sessions, [session]);
    return response(config, session);
  }
  if (method === "get" && path === "/api/v1/chat/sessions") {
    const sessions = storageGet<any[]>(STORAGE.sessions, [{ session_id: "demo-session", title: "Portfolio demo chat", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
    return response(config, { limit: 20, offset: 0, total: sessions.length, sessions });
  }
  if (method === "get" && path.startsWith("/api/v1/chat/history/")) {
    const history = storageGet<any[]>(STORAGE.history, []);
    return response(config, { session_id: path.split("/").pop(), messages: history, total: history.length });
  }
  if (method === "post" && ["/api/v1/chat/message", "/api/v1/mdchat/message"].includes(path)) {
    const content = String(body.content || "");
    const assistant = { content: chatReply(content), role: "assistant", timestamp: new Date().toISOString(), ...(path.includes("mdchat") ? { isFile: false } : {}) };
    if (body.session_id) {
      const history = storageGet<any[]>(STORAGE.history, []);
      history.push({ content, role: "user", timestamp: new Date().toISOString() }, assistant);
      storageSet(STORAGE.history, history);
    }
    return response(config, { assistant_message: assistant });
  }

  return response(config, {
    message: `Portfolio mock has no handler for ${method.toUpperCase()} ${path}`,
    code: "DEMO_ROUTE_NOT_IMPLEMENTED",
  }, 404);
};
