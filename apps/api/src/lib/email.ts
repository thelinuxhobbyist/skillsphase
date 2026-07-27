type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  apiKey?: string;
  from?: string;
};

/**
 * MVP transactional email via Resend when configured.
 * Without credentials, logs intent and succeeds so local flows are not blocked.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean }> {
  if (!input.apiKey || !input.from) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "email_skipped_not_configured",
        to: input.to,
        subject: input.subject,
      }),
    );
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "email_send_failed",
        status: response.status,
      }),
    );
    return { sent: false };
  }

  return { sent: true };
}

export function businessActivationEmailHtml(input: {
  companyName: string;
  activateUrl: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1a2e35;">
      <p>Your registration for <strong>${input.companyName}</strong> on SkillsPhase is ready for the final step.</p>
      <p><a href="${input.activateUrl}" style="display:inline-block;background:#1a2e35;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Activate your business account</a></p>
      <p style="font-size:14px;color:#555;">Or open this link:<br/><a href="${input.activateUrl}">${input.activateUrl}</a></p>
      <p style="font-size:14px;color:#555;">This link expires in 7 days. If you didn't register on SkillsPhase, you can ignore this email.</p>
    </div>
  `;
}

export function contactNotificationEmailHtml(input: {
  companyName: string;
  message: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1a2e35;">
      <p><strong>${input.companyName}</strong> is interested in your Skill Profile on SkillsPhase.</p>
      <p>Their message:</p>
      <blockquote style="margin:12px 0;padding:12px 16px;border-left:3px solid #e07a3a;background:#f7f4ef;">${input.message}</blockquote>
      <p><a href="https://skillsphase.com/contacts">Sign in to SkillsPhase to reply</a>.</p>
    </div>
  `;
}
