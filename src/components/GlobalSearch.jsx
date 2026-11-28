import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, Command, CornerDownLeft, Loader2 } from "lucide-react";

import { getClients } from "../lib/clientApi";
import { getContacts } from "../lib/contactApi";
import { getProjects } from "../lib/projectApi";
import { getInvoices } from "../lib/invoiceApi";
import { getVendors } from "../lib/vendorApi";
import { getProjectManagers } from "../lib/projectManagerApi";
import { getUsers } from "../lib/userApi";
import { getLanguages } from "../lib/languageApi";
import { getMotherTongues } from "../lib/motherTongueApi";
import { getServices } from "../lib/serviceApi";
import { getTools } from "../lib/toolApi";
import { getCurrencies } from "../lib/currencyApi";
import { getSpecializations } from "../lib/specializationApi";
import { getCountries } from "../lib/countryApi";

// One search box for the whole admin: it finds menu pages instantly and, once the
// user focuses it, loads the records behind the main screens (clients, contacts,
// projects, invoices, vendors, project managers, users and the master lists) and
// matches the query against every text/number field of each record.

const MAX_PER_GROUP = 5;
const MAX_TOTAL = 40;
const CACHE_MS = 60_000;

const flattenPages = (navItems) =>
  navItems.flatMap((item) => {
    const rows = [];
    if (item.to) rows.push({ title: item.label, subtitle: "Page", to: item.to });
    (item.sub || []).forEach((sub) =>
      rows.push({ title: sub.label, subtitle: `${item.label} › page`, to: sub.to })
    );
    return rows;
  });

// Every primitive (string / number) value of a record, lower-cased. Nested objects
// that were populated server-side (e.g. a project's client) contribute their
// primitives too, so "Acme" finds the projects of client Acme.
const haystackOf = (record) => {
  const parts = [];
  const walk = (value, depth) => {
    if (value == null) return;
    if (typeof value === "string" || typeof value === "number") parts.push(String(value));
    else if (depth < 1 && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([key, v]) => {
        if (key !== "_id" && key !== "__v") walk(v, depth + 1);
      });
    }
  };
  Object.entries(record || {}).forEach(([key, v]) => {
    if (key !== "_id" && key !== "__v" && key !== "password") walk(v, 0);
  });
  return parts.join(" ").toLowerCase();
};

const fullName = (r) => [r.firstName, r.lastName].filter(Boolean).join(" ").trim();

// Each source says how to fetch, how to label a record and where it should open.
const SOURCES = [
  {
    group: "Clients",
    load: getClients,
    title: (r) => r.name || r.companyName || "Client",
    subtitle: (r) => [r.membershipCode || r.code, r.email].filter(Boolean).join(" · "),
    to: (r) => `/clients/view-client/${r._id}`,
  },
  {
    group: "Contacts",
    load: getContacts,
    title: (r) => fullName(r) || r.email || "Contact",
    subtitle: (r) => [r.company, r.email].filter(Boolean).join(" · "),
    to: (r) => `/contacts/view-contact/${r._id}`,
  },
  {
    group: "Projects",
    load: getProjects,
    title: (r) => r.projectName || r.projectCode || r.projectId || "Project",
    subtitle: (r) => [r.projectId, r.projectCode, r.client?.name].filter(Boolean).join(" · "),
    to: (r) => `/projects/view-project/${r._id}`,
  },
  {
    group: "Invoices",
    load: getInvoices,
    title: (r) => r.invoiceNumber || "Invoice",
    subtitle: (r) => [r.billToCompany || r.client?.name, r.status].filter(Boolean).join(" · "),
    to: (r) => `/invoice/view-invoice/${r._id}`,
  },
  {
    group: "Vendors",
    load: getVendors,
    title: (r) => r.name || fullName(r) || r.code || "Vendor",
    subtitle: (r) => [r.code, r.email].filter(Boolean).join(" · "),
    to: () => "/vendors/vendor-users",
  },
  {
    group: "Project Managers",
    load: getProjectManagers,
    title: (r) => r.name || r.email || "Project Manager",
    subtitle: (r) => r.email || "",
    to: () => "/project-managers",
  },
  {
    group: "Users",
    load: getUsers,
    title: (r) => r.name || r.email || "User",
    subtitle: (r) => [r.email, r.role].filter(Boolean).join(" · "),
    to: () => "/users",
  },
  { group: "Languages", load: getLanguages, title: (r) => r.name, subtitle: (r) => r.localeCode || "", to: () => "/master/language" },
  { group: "Mother Tongues", load: getMotherTongues, title: (r) => r.name, subtitle: () => "", to: () => "/master/mother-tongue" },
  { group: "Services", load: getServices, title: (r) => r.name, subtitle: () => "", to: () => "/master/services" },
  { group: "Tools", load: getTools, title: (r) => r.name, subtitle: () => "", to: () => "/master/tool" },
  { group: "Currencies", load: getCurrencies, title: (r) => r.name || r.code, subtitle: (r) => r.code || "", to: () => "/master/currency" },
  { group: "Specializations", load: getSpecializations, title: (r) => r.name, subtitle: () => "", to: () => "/master/specialization" },
  { group: "Countries", load: getCountries, title: (r) => r.name, subtitle: () => "", to: () => "/master/country" },
];

export default function GlobalSearch({ navItems = [], collapsed = false, onExpand }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const panelRef = useRef(null);
  const cache = useRef({ at: 0, records: [] });

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState(null);

  const pages = useMemo(() => flattenPages(navItems), [navItems]);

  // Debounce typing so every keystroke does not re-scan every record.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [query]);

  const loadRecords = useCallback(async () => {
    if (Date.now() - cache.current.at < CACHE_MS && cache.current.records.length) {
      setRecords(cache.current.records);
      return;
    }
    setLoading(true);
    const settled = await Promise.allSettled(SOURCES.map((s) => s.load()));
    const rows = [];
    settled.forEach((result, i) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
      const src = SOURCES[i];
      result.value.forEach((record) => {
        const title = src.title(record);
        if (!title) return;
        rows.push({
          group: src.group,
          title,
          subtitle: src.subtitle(record),
          to: src.to(record),
          haystack: haystackOf(record),
        });
      });
    });
    cache.current = { at: Date.now(), records: rows };
    setRecords(rows);
    setLoading(false);
  }, []);

  const results = useMemo(() => {
    if (!debounced) return [];
    const matches = (text) => text.toLowerCase().includes(debounced);
    const out = [];

    const pageHits = pages.filter((p) => matches(p.title)).slice(0, 6);
    pageHits.forEach((p) => out.push({ ...p, group: "Pages" }));

    const perGroup = {};
    for (const row of records) {
      if (out.length >= MAX_TOTAL) break;
      if (!row.haystack.includes(debounced)) continue;
      perGroup[row.group] = (perGroup[row.group] || 0) + 1;
      if (perGroup[row.group] <= MAX_PER_GROUP) out.push(row);
    }
    return out;
  }, [debounced, pages, records]);

  useEffect(() => setActive(0), [debounced]);

  const place = useCallback(() => {
    if (boxRef.current) setRect(boxRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Close when clicking anywhere outside the box and the results panel.
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Ctrl/⌘ + K focuses the search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (collapsed && onExpand) onExpand();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed, onExpand]);

  const go = (row) => {
    if (!row) return;
    setOpen(false);
    setQuery("");
    navigate(row.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  const onFocus = () => {
    setOpen(true);
    loadRecords();
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onExpand && onExpand()}
        title="Search (Ctrl/⌘ + K)"
        className="w-full h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-300"
      >
        <Search size={16} />
      </button>
    );
  }

  const showPanel = open && debounced.length > 0 && rect;

  // Keep result order grouped under headings.
  let lastGroup = null;

  return (
    <>
      <div ref={boxRef} className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search anything…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="w-full h-10 pl-10 pr-4 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.07] focus:border-indigo-500/30 transition-all duration-300"
        />
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
          <Command size={10} className="text-slate-600" />
          <span className="text-[8px] font-bold text-slate-600">K</span>
        </div>
      </div>

      {showPanel &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: rect.bottom + 8,
              left: rect.left,
              width: Math.max(rect.width, 380),
              maxHeight: Math.max(window.innerHeight - rect.bottom - 24, 200),
            }}
            className="z-[400] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]"
          >
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Searching…
                  </span>
                ) : (
                  <>
                    No results for <span className="font-semibold text-slate-700">“{query.trim()}”</span>
                  </>
                )}
              </div>
            ) : (
              <ul className="py-1.5">
                {results.map((row, i) => {
                  const heading = row.group !== lastGroup ? row.group : null;
                  lastGroup = row.group;
                  return (
                    <React.Fragment key={`${row.group}-${row.to}-${i}`}>
                      {heading && (
                        <li className="px-4 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {heading}
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(row)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left transition-colors ${
                            i === active ? "bg-indigo-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold text-slate-800">{row.title}</span>
                            {row.subtitle && (
                              <span className="block truncate text-[11px] text-slate-500">{row.subtitle}</span>
                            )}
                          </span>
                          {i === active && <CornerDownLeft size={13} className="shrink-0 text-indigo-500" />}
                        </button>
                      </li>
                    </React.Fragment>
                  );
                })}
                {loading && (
                  <li className="px-4 py-2 text-[11px] text-slate-400 inline-flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Still loading more records…
                  </li>
                )}
              </ul>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
