const BRAND_NAME = 'De-ID Studio';
const BRAND_SUBTITLE = 'De-ID and Synthesis';
const MAGIC_LINK_VALIDITY = '15';

interface MagicLinkTemplateInput {
  verifyUrl: string;
}

export function renderMagicLinkTemplate({ verifyUrl }: MagicLinkTemplateInput): string {
  const brandName = BRAND_NAME;
  const brandSubtitle = BRAND_SUBTITLE;
  const magicLinkValidity = MAGIC_LINK_VALIDITY;
  const ctaText = `Sign In to ${brandName}`;

  return `
    <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#061a44;padding:22px 28px;color:#ffffff;">
            <div style="font-size:32px;line-height:1;">${brandName}</div>
            <div style="margin-top:4px;font-size:16px;opacity:0.9;">${brandSubtitle}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:34px 32px 28px;text-align:center;">
            <h1 style="margin:0 0 16px;font-size:38px;line-height:1.2;color:#111827;">Sign in to ${brandName}</h1>
            <p style="margin:0 0 8px;font-size:18px;color:#6b7280;">Hi there,</p>
            <p style="margin:0 0 24px;font-size:18px;line-height:1.6;color:#6b7280;">
              Click the button below to sign in to your account.<br />
              This link is valid for ${magicLinkValidity} minutes.
            </p>

            <a
              href="${verifyUrl}"
              style="display:inline-block;background:#25437a;color:#ffffff;text-decoration:none;font-size:20px;font-weight:600;padding:16px 28px;border-radius:10px;"
            >
              ${ctaText}
            </a>

            <div style="margin:28px 0 18px;font-size:26px;color:#9ca3af;">or</div>

            <p style="margin:0 0 10px;font-size:18px;color:#6b7280;">Or copy this link into your browser:</p>
            <p style="margin:0;word-break:break-all;">
              <a href="${verifyUrl}" style="color:#2563eb;font-size:18px;text-decoration:none;">${verifyUrl}</a>
            </p>

            <p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:#9ca3af;">
              If you did not request this email, you can safely ignore it.<br />
              Your account will remain secure.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
