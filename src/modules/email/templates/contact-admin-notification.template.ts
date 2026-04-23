interface ContactAdminNotificationTemplateInput {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
}

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] ?? c,
  );
}

export function renderContactAdminNotificationTemplate({
  firstName,
  lastName,
  email,
  message,
  company,
}: ContactAdminNotificationTemplateInput): string {
  const safeFirstName = escapeHtml(firstName);
  const safeLastName = escapeHtml(lastName);
  const safeEmail = escapeHtml(email);
  const safeCompany = company?.trim() ? escapeHtml(company) : 'N/A';
  const safeMessage = escapeHtml(message);

  return `
    <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Inter,Arial,Helvetica,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#01132f;padding:24px;text-align:center;color:#ffffff;">
            <div style="font-size:18px;line-height:26px;font-weight:600;">De-ID Studio</div>
            <div style="font-size:12px;line-height:16px;font-weight:400;opacity:0.9;">New Contact Form Submission</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 24px 12px;background:#ffffff;">
            <h1 style="margin:0;font-size:22px;line-height:28px;color:#111827;font-weight:600;">New inquiry received</h1>
            <p style="margin:8px 0 0;font-size:14px;line-height:20px;color:#6b7280;">A user submitted the Contact Us form.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 24px;background:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:12px 14px;font-size:12px;line-height:16px;color:#9ca3af;width:160px;border-bottom:1px solid #e5e7eb;">First name</td>
                <td style="padding:12px 14px;font-size:14px;line-height:20px;color:#374151;border-bottom:1px solid #e5e7eb;">${safeFirstName}</td>
              </tr>
              <tr>
                <td style="padding:12px 14px;font-size:12px;line-height:16px;color:#9ca3af;width:160px;border-bottom:1px solid #e5e7eb;">Last name</td>
                <td style="padding:12px 14px;font-size:14px;line-height:20px;color:#374151;border-bottom:1px solid #e5e7eb;">${safeLastName}</td>
              </tr>
              <tr>
                <td style="padding:12px 14px;font-size:12px;line-height:16px;color:#9ca3af;width:160px;border-bottom:1px solid #e5e7eb;">Email</td>
                <td style="padding:12px 14px;font-size:14px;line-height:20px;color:#374151;border-bottom:1px solid #e5e7eb;word-break:break-word;">
                  <a href="mailto:${safeEmail}" style="color:#1d4ed8;text-decoration:none;">${safeEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 14px;font-size:12px;line-height:16px;color:#9ca3af;width:160px;">Company</td>
                <td style="padding:12px 14px;font-size:14px;line-height:20px;color:#374151;">${safeCompany}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 24px;background:#ffffff;">
            <div style="position:relative;background:#e8eff7;border-radius:8px;padding:16px 20px 16px 24px;">
              <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:#00bfa5;border-radius:8px 0 0 8px;"></div>
              <div style="font-size:12px;line-height:16px;color:#9ca3af;font-weight:500;margin-bottom:8px;">Message</div>
              <div style="font-size:14px;line-height:20px;color:#374151;white-space:pre-wrap;word-break:break-word;">${safeMessage}</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}