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
    <div style="margin:0;padding:40px 10px;background-color:#ffffff;font-family:'Inter',Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;border-collapse:separate;">
        <tr>
          <td style="background-color:#01132f;padding:20px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                    <td style="vertical-align: middle; padding-right: 12px;">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                          <!-- Lock body -->
                          <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" stroke-width="1.5" fill="none"/>
                          <!-- Lock shackle -->
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                          <!-- Keyhole circle -->
                          <circle cx="12" cy="16" r="1.5" fill="white"/>
                          <!-- Cylinder/database lines below lock - decorative base -->
                          <line x1="7" y1="22" x2="17" y2="22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </td>
                    <td style="text-align:left; color:#ffffff;">
                        <div style="font-size:20px;line-height:1.2;font-weight:700;letter-spacing:0.5px;">De-ID Studio</div>
                        <div style="font-size:12px;line-height:1.2;font-weight:400;opacity:0.8;">De-ID &amp; Synthesis</div>
                    </td>
                </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td style="padding:40px 50px;background:#ffffff;text-align:center;">
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#111827;font-weight:700;">We received your message!</h1>
            <p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:#374151;">Hi ${safeFirstName},</p>
            <p style="margin:0 0 32px;font-size:15px;line-height:1.5;color:#6b7280;">Thanks for reaching out to De-ID Studio.<br/>We received your message and will get back to you within 24 hours.</p>

            <div style="text-align:left; background-color:#eff4f9; border-left:4px solid #2cc9b3; border-radius:4px; padding:20px 24px;">
              <div style="font-size:13px;line-height:1;color:#9ca3af;font-weight:500;margin-bottom:12px;">Your message:</div>
              <div style="font-size:15px;line-height:1.6;color:#374151;word-break:break-word;">${safeMessage}</div>
            </div>

            <p style="margin:32px 0 0;font-size:13px;line-height:1.5;color:#9ca3af;">In the meantime, feel free to explore our Help Center or check our FAQ.</p>

            <div style="margin-top:40px;border-top:1px solid #f3f4f6;padding-top:24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">&copy; 2026 De-ID Studio. All rights reserved</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                <a href="#" style="color:#6b7280;text-decoration:none;">Privacy Policy</a> &nbsp;&nbsp; 
                <a href="#" style="color:#6b7280;text-decoration:none;">Terms of Service</a>
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}