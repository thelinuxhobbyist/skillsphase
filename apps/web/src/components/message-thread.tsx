"use client";

import { useAuth } from "@clerk/nextjs";
import { useRef, useState } from "react";
import {
  ApiRequestError,
  sendMessage,
  type Message,
} from "@/lib/api";

export function MessageThread({
  contactId,
  currentUserId,
  initialMessages,
}: {
  contactId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <li className="text-sm text-[color:var(--foreground)]/60">
            No messages yet — say hello.
          </li>
        ) : (
          messages.map((message) => {
            const mine = message.senderUserId === currentUserId;
            return (
              <li
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    mine
                      ? "bg-brand text-white"
                      : "border border-[color:var(--line)] bg-white text-[color:var(--foreground)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <p
                    className={`mt-1 text-xs ${
                      mine ? "text-white/70" : "text-[color:var(--foreground)]/50"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>
              </li>
            );
          })
        )}
        <div ref={bottomRef} />
      </ul>

      {error ? (
        <p className="mb-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="flex gap-2 border-t border-[color:var(--line)] pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          void (async () => {
            setPending(true);
            setError(null);
            try {
              const token = await getToken();
              if (!token) throw new Error("Missing session token");
              const message = await sendMessage(token, contactId, draft.trim());
              setMessages((rows) => [...rows, message]);
              setDraft("");
              window.setTimeout(
                () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
                50,
              );
            } catch (err) {
              setError(
                err instanceof ApiRequestError || err instanceof Error
                  ? err.message
                  : "Unable to send message.",
              );
            } finally {
              setPending(false);
            }
          })();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
