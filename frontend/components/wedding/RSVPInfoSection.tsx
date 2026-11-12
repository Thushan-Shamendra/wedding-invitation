"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RSVPInfoSectionProps {
  rsvpEnabled?: boolean;
  contactCoordinator?: string;
}

export function RSVPInfoSection({ rsvpEnabled = true, contactCoordinator }: RSVPInfoSectionProps) {
  const router = useRouter();
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");
  const Icon = rsvpEnabled ? Mail : Lock;

  function openInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = tokenInput.trim();
    if (!token) {
      setTokenError("Please enter your invitation code.");
      return;
    }
    router.push(`/invite/${encodeURIComponent(token)}`);
  }

  return (
    <section id="rsvp" className="wedding-rsvp">
      <div className="wedding-container">
        <div className="wedding-card wedding-rsvp-card">
          <Icon className="wedding-rsvp-icon" aria-hidden="true" />
          <p className="wedding-eyebrow">Celebration Attendance</p>
          <h2>RSVP Information</h2>
          {rsvpEnabled ? (
            <>
              <p>Use the personal invitation you received by WhatsApp or message to confirm your attendance, guest count, and meal preferences.</p>
              {showTokenInput ? (
                <form className="wedding-rsvp-form" onSubmit={openInvitation}>
                  <label htmlFor="invitationTokenInput">Invitation code</label>
                  <div>
                    <input
                      id="invitationTokenInput"
                      value={tokenInput}
                      onChange={(event) => { setTokenInput(event.target.value); setTokenError(""); }}
                      aria-invalid={!!tokenError}
                      aria-describedby={tokenError ? "invitationTokenError" : undefined}
                    />
                    <button className="wedding-button wedding-button-gold" type="submit">View Invitation</button>
                  </div>
                  {tokenError && <p id="invitationTokenError" role="alert">{tokenError}</p>}
                </form>
              ) : (
                <button
                  className="wedding-button wedding-button-gold"
                  type="button"
                  onClick={() => setShowTokenInput(true)}
                >
                  Open My Invitation <ArrowRight aria-hidden="true" />
                </button>
              )}
            </>
          ) : (
            <p>RSVP is currently closed. Please reach out to the couple or wedding coordinator to update your attendance.</p>
          )}
          {contactCoordinator?.trim() && (
            <a className="wedding-rsvp-contact" href={`tel:${contactCoordinator.replace(/[^0-9+]/g, "")}`}>
              <MessageCircle aria-hidden="true" /> Contact the Wedding Coordinator
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
