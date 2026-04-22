interface ContactReceiptTemplateInput {
  firstName: string;
  message: string;
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

export function renderContactReceiptTemplate({
  firstName,
  message,
}: ContactReceiptTemplateInput): string {
  const safeFirstName = escapeHtml(firstName.trim() || 'there');
  const safeMessage = escapeHtml(message);

  return `
    <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Inter,Arial,Helvetica,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#01132f;padding:24px;text-align:center;color:#ffffff;">
            <div style="font-size:18px;line-height:26px;font-weight:600;">De-ID Studio</div>
            <div style="font-size:12px;line-height:16px;font-weight:400;">De-ID &amp; Synthesis</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 48px 40px;background:#ffffff;">
            <h1 style="margin:0 0 12px;text-align:center;font-size:24px;line-height:28px;color:#111827;font-weight:600;">We received your message!</h1>
            <p style="margin:0 0 8px;text-align:center;font-size:14px;line-height:20px;color:#374151;">Hi ${safeFirstName},</p>
            <p style="margin:0 0 24px;text-align:center;font-size:14px;line-height:20px;color:#6b7280;">Thanks for reaching out to De-ID Studio. We received your message and will get back to you within 24 hours.</p>

            <div style="position:relative;background:#e8eff7;border-radius:8px;padding:16px 20px 16px 24px;">
              <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:#00bfa5;border-radius:8px 0 0 8px;"></div>
              <div style="font-size:12px;line-height:16px;color:#9ca3af;font-weight:500;margin-bottom:8px;">Your message:</div>
              <div style="font-size:14px;line-height:20px;color:#374151;word-break:break-word;">${safeMessage}</div>
            </div>

            <p style="margin:24px 0 0;padding-top:8px;border-top:1px solid #f3f4f6;text-align:center;font-size:12px;line-height:16px;color:#9ca3af;">In the meantime, feel free to explore our Help Center or check our FAQ.</p>

            <div style="margin-top:16px;padding:16px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;line-height:16px;color:#9ca3af;">&copy; 2026 De-ID Studio. All rights reserved</p>
              <p style="margin:0;font-size:12px;line-height:16px;color:#6b7280;">Privacy Policy &nbsp;&nbsp; Terms of Service</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}
