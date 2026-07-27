"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ApiRequestError,
  createCandidateList,
  createContact,
  listCandidateLists,
  saveCandidate,
  unsaveCandidate,
  type CandidateList,
} from "@/lib/api";

export function CandidateDetailActions({
  candidateId,
  initiallySaved,
}: {
  candidateId: string;
  initiallySaved: boolean;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [savePending, setSavePending] = useState(false);
  const [lists, setLists] = useState<CandidateList[] | null>(null);
  const [showListPicker, setShowListPicker] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState(
    "Hi — I came across your Skill Profile and would like to talk about an opportunity.",
  );
  const [contactPending, setContactPending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showListPicker || lists) return;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        setLists(await listCandidateLists(token));
      } catch {
        setLists([]);
      }
    })();
  }, [showListPicker, lists, getToken]);

  async function withToken() {
    const token = await getToken();
    if (!token) throw new Error("Missing session token");
    return token;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={savePending}
          className={`rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
            saved
              ? "border-brand bg-brand text-white"
              : "border-[color:var(--line)] bg-white text-primary"
          }`}
          onClick={() => {
            void (async () => {
              setSavePending(true);
              setError(null);
              try {
                const token = await withToken();
                if (saved) {
                  await unsaveCandidate(token, candidateId);
                  setSaved(false);
                } else {
                  setShowListPicker(true);
                }
              } catch (err) {
                setError(messageFrom(err));
              } finally {
                setSavePending(false);
              }
            })();
          }}
        >
          {saved ? "Saved ✓" : "Save candidate"}
        </button>
        <button
          type="button"
          className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setShowContact((v) => !v)}
        >
          Contact candidate
        </button>
      </div>

      {showListPicker && !saved ? (
        <div className="rounded-md border border-[color:var(--line)] bg-white p-4">
          <p className="text-sm font-semibold text-primary">Save to a list (optional)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-[color:var(--line)] px-3 py-1.5 text-sm text-primary"
              onClick={() => void doSave(null)}
            >
              No list
            </button>
            {(lists ?? []).map((list) => (
              <button
                key={list.id}
                type="button"
                className="rounded-md border border-[color:var(--line)] px-3 py-1.5 text-sm text-primary"
                onClick={() => void doSave(list.id)}
              >
                {list.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name"
              className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-primary"
              onClick={() => {
                void (async () => {
                  if (!newListName.trim()) return;
                  try {
                    const token = await withToken();
                    const list = await createCandidateList(token, newListName.trim());
                    setLists((rows) => [...(rows ?? []), list]);
                    setNewListName("");
                    await doSave(list.id);
                  } catch (err) {
                    setError(messageFrom(err));
                  }
                })();
              }}
            >
              Create & save
            </button>
          </div>
        </div>
      ) : null}

      {showContact ? (
        <form
          className="space-y-3 rounded-md border border-[color:var(--line)] bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              setContactPending(true);
              setError(null);
              try {
                const token = await withToken();
                await createContact(token, candidateId, message);
                setContactSent(true);
                router.refresh();
              } catch (err) {
                setError(messageFrom(err));
              } finally {
                setContactPending(false);
              }
            })();
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-primary">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
            />
          </label>
          {contactSent ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Message sent — you can continue the conversation from Contacts.
            </p>
          ) : (
            <button
              type="submit"
              disabled={contactPending || !message.trim()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {contactPending ? "Sending…" : "Send message"}
            </button>
          )}
        </form>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );

  async function doSave(listId: string | null) {
    try {
      const token = await withToken();
      await saveCandidate(token, candidateId, listId);
      setSaved(true);
      setShowListPicker(false);
    } catch (err) {
      setError(messageFrom(err));
    }
  }
}

function messageFrom(err: unknown) {
  return err instanceof ApiRequestError || err instanceof Error
    ? err.message
    : "Something went wrong.";
}
