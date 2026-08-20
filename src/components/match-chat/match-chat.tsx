"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { useChatIdentity } from "@/hooks/use-chat-identity";
import { useMatchChat } from "@/hooks/use-match-chat";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import type { ChatMessage } from "@/types/socket";

const MAX_MESSAGE_LENGTH = 500;
const MAX_USERNAME_LENGTH = 24;
const MIN_USERNAME_LENGTH = 2;

export function MatchChat({ matchId }: { matchId: string }) {
  const panel = useRef<HTMLElement | null>(null);
  const { identity, saveUsername } = useChatIdentity();
  const chat = useMatchChat({ matchId, identity });
  const [draft, setDraft] = useState("");
  const [usernameDraft, setUsernameDraft] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      gsap.fromTo(panel.current, { y: 8, scale: 0.985 }, {
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: "power2.out",
      });

      if (!isCollapsed) {
        gsap.fromTo(".chat-panel-body", { autoAlpha: 0, y: 8 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.32,
          ease: "power2.out",
        });
      }
    }, panel);

    return () => context.revert();
  }, [isCollapsed]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chat.messages.length]);

  function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = usernameDraft.trim();

    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
      setIdentityError(`Use between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`);
      return;
    }

    saveUsername(username);
    setUsernameDraft("");
    setIdentityError(null);
    setIsEditingIdentity(false);
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (chat.sendMessage(draft)) setDraft("");
  }

  function beginIdentityEdit() {
    setUsernameDraft(identity?.username ?? "");
    setIdentityError(null);
    setIsEditingIdentity(true);
  }

  function toggleChat() {
    if (!isCollapsed) chat.stopTyping();
    setIsCollapsed((currentValue) => !currentValue);
  }

  const isConnected = chat.connectionStatus === "connected";

  return (
    <section
      className={`detail-panel chat-panel${isCollapsed ? " chat-panel--collapsed" : ""}`}
      aria-labelledby="chat-heading"
      ref={panel}
    >
      <div className="panel-heading chat-heading">
        <div>
          <p className="section-kicker">In the stands</p>
          <h2 id="chat-heading">Match chat</h2>
        </div>
        <div className="chat-heading-actions">
          <span className={`chat-connection chat-connection--${chat.connectionStatus}`}>
            {isConnected ? "Online" : chat.connectionStatus}
          </span>
          <button
            className="chat-toggle"
            type="button"
            onClick={toggleChat}
            aria-expanded={!isCollapsed}
            aria-controls="match-chat-body"
            aria-label={isCollapsed ? "Expand match chat" : "Collapse match chat"}
          >
            <span aria-hidden="true">{isCollapsed ? "↗" : "—"}</span>
          </button>
        </div>
      </div>

      <div className="chat-panel-body" id="match-chat-body" hidden={isCollapsed}>
        {!identity || isEditingIdentity ? (
          <form className="identity-form" onSubmit={handleIdentitySubmit}>
            <span className="identity-symbol" aria-hidden="true">#</span>
            <h3>{identity ? "Change your display name" : "Join the conversation"}</h3>
            <p>Choose a name stored only in this browser.</p>
            <label htmlFor="chat-username">Display name</label>
            <input
              id="chat-username"
              value={usernameDraft}
              onChange={(event) => setUsernameDraft(event.target.value)}
              maxLength={MAX_USERNAME_LENGTH}
              autoComplete="nickname"
              placeholder="e.g. MatchdayMike"
            />
            {identityError && <span className="chat-form-error" role="alert">{identityError}</span>}
            <div className="identity-actions">
              <button type="submit">Enter chat</button>
              {identity && <button type="button" onClick={() => setIsEditingIdentity(false)}>Cancel</button>}
            </div>
          </form>
        ) : (
          <>
            <div className="chat-userbar">
              <span>Chatting as <strong>@{identity.username}</strong></span>
              <button type="button" onClick={beginIdentityEdit}>Change</button>
            </div>

            <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
              {chat.messages.length === 0 ? (
                <div className="chat-empty">
                  <span aria-hidden="true">“</span>
                  <p>Start the matchday conversation.</p>
                </div>
              ) : chat.messages.map((message) => (
                <MessageBubble
                  key={`${message.userId}-${message.timestamp}-${message.message}`}
                  message={message}
                  isOwn={message.userId === identity.userId}
                />
              ))}
              <div ref={messagesEnd} />
            </div>

            <div className="typing-line" aria-live="polite">
              {formatTypingUsers(chat.typingUsers.map(({ username }) => username))}
            </div>

            {chat.error && <div className="chat-server-error" role="alert">{chat.error}</div>}

            <form className="message-form" onSubmit={handleMessageSubmit}>
              <label className="sr-only" htmlFor="chat-message">Message</label>
              <textarea
                id="chat-message"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  chat.startTyping();
                }}
                onBlur={chat.stopTyping}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={2}
                placeholder={isConnected ? "Say something about the match…" : "Waiting for the live connection…"}
                disabled={!isConnected}
              />
              <div className="message-actions">
                <span className={draft.length >= 450 ? "character-count character-count--near" : "character-count"}>
                  {draft.length}/{MAX_MESSAGE_LENGTH}
                </span>
                <button type="submit" disabled={!isConnected || !draft.trim()}>Send <span aria-hidden="true">↗</span></button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const date = new Date(message.timestamp);
  const time = Number.isNaN(date.getTime())
    ? "Now"
    : new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);

  return (
    <article className={`chat-message${isOwn ? " chat-message--own" : ""}`}>
      <div>
        <strong>{isOwn ? "You" : message.username}</strong>
        <time dateTime={message.timestamp}>{time}</time>
      </div>
      <p>{message.message}</p>
    </article>
  );
}

function formatTypingUsers(usernames: string[]) {
  if (usernames.length === 0) return "";
  if (usernames.length === 1) return `${usernames[0]} is typing…`;
  if (usernames.length === 2) return `${usernames[0]} and ${usernames[1]} are typing…`;
  return `${usernames[0]}, ${usernames[1]}, and others are typing…`;
}
