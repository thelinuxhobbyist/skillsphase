"use client";

import { useAdminToken } from "@/lib/use-admin-token";
import {
  HOMEPAGE_OPTIONAL_SECTION_TYPES,
  HOMEPAGE_SECTION_LABELS,
  HOMEPAGE_SECTION_TYPES,
  type HomepageSectionType,
} from "@horizon/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  createAdminHomepageSection,
  deleteAdminHomepageSection,
  reorderAdminHomepageSections,
  resetAdminHomepageSections,
  updateAdminHomepageSection,
  type HomepageSectionDto,
} from "@/lib/api";

export function AdminHomepagePanel({
  initialSections,
  databaseConfigured,
  errorMessage,
}: {
  initialSections: HomepageSectionDto[];
  databaseConfigured: boolean;
  errorMessage?: string | null;
}) {
  const { getToken } = useAdminToken();
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [addType, setAddType] = useState<HomepageSectionType>("differentiators");
  const [error, setError] = useState<string | null>(errorMessage ?? null);
  const [pending, setPending] = useState(false);

  async function withToken<T>(fn: (token: string) => Promise<T>) {
    const token = await getToken();
    if (!token) throw new Error("Missing session token");
    return fn(token);
  }

  if (!databaseConfigured) {
    return (
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <h2 className="font-semibold text-primary">Database required</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Connect Neon and run migrations (`pnpm db:migrate`) to edit the homepage
          template from admin. Until then the public site uses the built-in default
          template.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-primary underline">
          View public homepage
        </Link>
      </div>
    );
  }

  function startEdit(section: HomepageSectionDto) {
    setEditingId(section.id);
    setDraftLabel(section.label);
    setDraftContent(JSON.stringify(section.content, null, 2));
    setError(null);
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as HomepageSectionType)}
          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        >
          {HOMEPAGE_SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {HOMEPAGE_SECTION_LABELS[type]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setPending(true);
              setError(null);
              try {
                const created = await withToken((token) =>
                  createAdminHomepageSection(token, { type: addType }),
                );
                setSections((prev) => [...prev, created]);
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof ApiRequestError || err instanceof Error
                    ? err.message
                    : "Unable to add section.",
                );
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          Add section
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
          onClick={() => {
            if (
              !window.confirm(
                "Reset homepage to the default template? This replaces all current sections.",
              )
            ) {
              return;
            }
            void (async () => {
              setPending(true);
              setError(null);
              try {
                const result = await withToken((token) =>
                  resetAdminHomepageSections(token),
                );
                setSections(result.sections);
                setEditingId(null);
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof ApiRequestError || err instanceof Error
                    ? err.message
                    : "Reset failed.",
                );
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          Reset to defaults
        </button>
        <Link href="/" className="text-sm font-semibold text-primary underline">
          Preview site
        </Link>
      </div>

      <ul className="space-y-3">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-primary-accent">
                  {section.type}
                </p>
                <h2 className="font-semibold text-primary">{section.label}</h2>
                <p className="text-sm text-[color:var(--foreground)]/65">
                  {section.enabled ? "Visible on homepage" : "Hidden"}
                  {section.type === "footer" ? " · Site-wide footer" : null}
                  {(
                    HOMEPAGE_OPTIONAL_SECTION_TYPES as readonly HomepageSectionType[]
                  ).includes(section.type)
                    ? " · Optional marketing section"
                    : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending || index === 0}
                  className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-40"
                  onClick={() => {
                    void (async () => {
                      const next = [...sections];
                      const [item] = next.splice(index, 1);
                      next.splice(index - 1, 0, item!);
                      setSections(next);
                      setPending(true);
                      try {
                        const result = await withToken((token) =>
                          reorderAdminHomepageSections(
                            token,
                            next.map((s) => s.id),
                          ),
                        );
                        setSections(result.sections);
                        router.refresh();
                      } catch (err) {
                        setError(
                          err instanceof ApiRequestError || err instanceof Error
                            ? err.message
                            : "Reorder failed.",
                        );
                        router.refresh();
                      } finally {
                        setPending(false);
                      }
                    })();
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={pending || index === sections.length - 1}
                  className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-40"
                  onClick={() => {
                    void (async () => {
                      const next = [...sections];
                      const [item] = next.splice(index, 1);
                      next.splice(index + 1, 0, item!);
                      setSections(next);
                      setPending(true);
                      try {
                        const result = await withToken((token) =>
                          reorderAdminHomepageSections(
                            token,
                            next.map((s) => s.id),
                          ),
                        );
                        setSections(result.sections);
                        router.refresh();
                      } catch (err) {
                        setError(
                          err instanceof ApiRequestError || err instanceof Error
                            ? err.message
                            : "Reorder failed.",
                        );
                        router.refresh();
                      } finally {
                        setPending(false);
                      }
                    })();
                  }}
                >
                  Down
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-60"
                  onClick={() => {
                    void (async () => {
                      setPending(true);
                      setError(null);
                      try {
                        const updated = await withToken((token) =>
                          updateAdminHomepageSection(token, section.id, {
                            enabled: !section.enabled,
                          }),
                        );
                        setSections((prev) =>
                          prev.map((s) => (s.id === updated.id ? updated : s)),
                        );
                        router.refresh();
                      } catch (err) {
                        setError(
                          err instanceof ApiRequestError || err instanceof Error
                            ? err.message
                            : "Update failed.",
                        );
                      } finally {
                        setPending(false);
                      }
                    })();
                  }}
                >
                  {section.enabled ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-60"
                  onClick={() => startEdit(section)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={pending || section.type === "footer"}
                  className="rounded-md bg-red-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                  title={
                    section.type === "footer"
                      ? "The footer section cannot be deleted"
                      : undefined
                  }
                  onClick={() => {
                    if (!window.confirm(`Delete “${section.label}”?`)) return;
                    void (async () => {
                      setPending(true);
                      setError(null);
                      try {
                        await withToken((token) =>
                          deleteAdminHomepageSection(token, section.id),
                        );
                        setSections((prev) =>
                          prev.filter((s) => s.id !== section.id),
                        );
                        if (editingId === section.id) setEditingId(null);
                        router.refresh();
                      } catch (err) {
                        setError(
                          err instanceof ApiRequestError || err instanceof Error
                            ? err.message
                            : "Delete failed.",
                        );
                      } finally {
                        setPending(false);
                      }
                    })();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingId === section.id ? (
              <form
                className="mt-4 space-y-3 border-t border-[color:var(--line)] pt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void (async () => {
                    setPending(true);
                    setError(null);
                    try {
                      let content: Record<string, unknown>;
                      try {
                        content = JSON.parse(draftContent) as Record<
                          string,
                          unknown
                        >;
                      } catch {
                        throw new Error("Content must be valid JSON.");
                      }
                      const updated = await withToken((token) =>
                        updateAdminHomepageSection(token, section.id, {
                          label: draftLabel,
                          content,
                        }),
                      );
                      setSections((prev) =>
                        prev.map((s) => (s.id === updated.id ? updated : s)),
                      );
                      setEditingId(null);
                      router.refresh();
                    } catch (err) {
                      setError(
                        err instanceof ApiRequestError || err instanceof Error
                          ? err.message
                          : "Save failed.",
                      );
                    } finally {
                      setPending(false);
                    }
                  })();
                }}
              >
                <label className="block text-sm">
                  <span className="font-medium text-primary">Label</span>
                  <input
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-primary">
                    Content (JSON)
                  </span>
                  <textarea
                    rows={14}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 font-mono text-xs"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-primary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
