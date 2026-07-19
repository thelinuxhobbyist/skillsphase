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

export function employerApprovalEmailHtml(companyName: string) {
  return `
    <p>Your organisation <strong>${companyName}</strong> has been approved on Project Horizon.</p>
    <p>You can now sign in and start posting jobs for career returners.</p>
  `;
}

export function applicationConfirmationEmailHtml(input: {
  jobTitle: string;
  companyName: string;
}) {
  return `
    <p>Thanks for applying to <strong>${input.jobTitle}</strong> at <strong>${input.companyName}</strong>.</p>
    <p>Your application has been received. You can track its status in your Horizon applications dashboard.</p>
  `;
}
