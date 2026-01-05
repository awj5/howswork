export function adminInviteEmail(companyName: string, inviteUrl: string) {
  return `
    <p>Hi there,</p>

    <p><strong>${companyName}</strong> has invited you to access <strong>HowsWork</strong> as an administrator.</p>

    <p><strong>HowsWork</strong> is used to receive anonymous employee input and monitor psychosocial risks as part of workplace health and safety obligations.</p>

    <p>To accept the invitation and set up your access, use the secure link below:</p>

    <p>
      <a
        href="${inviteUrl}"
        target="_blank"
        style="
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 4px 0;
        "
        rel="noopener noreferrer"
        >Accept the invitation</a
      >
    </p>

    <p style="color: #666666">If you were not expecting this invitation, you can safely ignore this email.</p>

    <div style="border-top: 2px solid #4f46e5; max-width: 360px; margin: 16px 0"></div>

    <p style="color: #4f46e5">
      <strong>HowsWork</strong><br />
      A safe, anonymous way for employees to speak up
    </p>
  `;
}
