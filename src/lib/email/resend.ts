import { Resend } from "resend";
import type { EmailProvider } from "./types";
import { formatPrice } from "@/lib/format";
import { BRAND } from "@/content/napfleet";

// ─── Brand tokens (mirror tailwind.config.ts) ─────────────
const CHARCOAL = "#181B17";
const SIGNAL_ORANGE = "#D95F36";
const WARM_WHITE = "#FFFDF7";
const CREAM = "#F4F0E6";
const DEEP_OLIVE = "#535C45";

const DISPLAY_FONT =
  "'Barlow Condensed','Arial Narrow',Helvetica,Arial,sans-serif";
const BODY_FONT =
  "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/**
 * FROM address for all outbound email.
 * Configurable via EMAIL_FROM; defaults to the NapFleet order address.
 */
function getFrom(): string {
  return process.env.EMAIL_FROM || "NapFleet <orders@napfleet.com>";
}

/**
 * First address from ADMIN_EMAILS (comma-separated). Falls back to
 * OWNER_EMAILS, then empty (contact notifications are skipped if unset).
 */
function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    process.env.OWNER_EMAILS?.split(",")[0]?.trim() ||
    ""
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Shared email shell — square corners, thin charcoal borders,
 * uppercase display headings, brand colors throughout.
 */
function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:${CREAM};font-family:${BODY_FONT};color:${CHARCOAL};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${WARM_WHITE};border:1px solid ${CHARCOAL};">
            <tr>
              <td style="padding:24px 32px;background:${CHARCOAL};border-bottom:1px solid ${CHARCOAL};">
                <p style="margin:0;font-family:${DISPLAY_FONT};font-size:26px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${WARM_WHITE};">${BRAND.name}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${CREAM};border-top:1px solid ${CHARCOAL};">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${DEEP_OLIVE};text-align:center;letter-spacing:0.05em;">
                  ${escapeHtml(BRAND.formalName)} &middot; ${escapeHtml(BRAND.tagline)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  /**
   * Order confirmation with a full order summary, shipped to the
   * customer at checkout. Never throws — returns { success: false, error }.
   */
  async sendOrderConfirmation(params: {
    to: string;
    orderNumber: string;
    items: Array<{ title: string; variant: string; quantity: number; price: number }>;
    totalCents: number;
    shippingAddress: string;
    preorderEstimate: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const itemRows = params.items
        .map(
          (item) => `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid ${CHARCOAL};font-size:14px;line-height:1.5;">
                ${escapeHtml(item.title)}
                <br />
                <span style="color:${DEEP_OLIVE};font-size:12px;">${escapeHtml(item.variant)} &times; ${item.quantity}</span>
              </td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid ${CHARCOAL};font-size:14px;white-space:nowrap;">
                ${formatPrice(item.price * item.quantity)}
              </td>
            </tr>`
        )
        .join("");

      const bodyHtml = `
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Thank you for reserving your ride with ${BRAND.name}. Your preorder is confirmed:</p>
        <p style="margin:0 0 24px;font-family:${DISPLAY_FONT};font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SIGNAL_ORANGE};">Order ${escapeHtml(params.orderNumber)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
          <tr>
            <td style="padding:0 0 8px;font-family:${DISPLAY_FONT};font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${DEEP_OLIVE};">Items</td>
            <td></td>
          </tr>
          ${itemRows}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
          <tr>
            <td style="padding:8px 0;font-size:14px;">Total</td>
            <td align="right" style="padding:8px 0;font-size:14px;font-weight:700;">${formatPrice(params.totalCents)}</td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${CREAM};border:1px solid ${CHARCOAL};">
          <tr>
            <td style="padding:16px;font-size:13px;line-height:1.6;color:${DEEP_OLIVE};">
              <strong style="color:${CHARCOAL};font-family:${DISPLAY_FONT};letter-spacing:0.1em;text-transform:uppercase;">Preorder estimate:</strong><br />
              ${escapeHtml(params.preorderEstimate)}
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-family:${DISPLAY_FONT};font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${DEEP_OLIVE};">Shipping to</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">${escapeHtml(params.shippingAddress)}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:${DEEP_OLIVE};">We&apos;ll send tracking to this address&apos;s email as soon as your order ships.</p>`;

      const { data, error } = await this.resend.emails.send({
        from: getFrom(),
        to: params.to,
        subject: `Order Confirmed — ${params.orderNumber}`,
        html: emailShell(bodyHtml),
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (!data?.id) {
        return { success: false, error: "Resend accepted the request but returned no email id" };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Email send failed",
      };
    }
  }

  /**
   * Simple refund notice to the customer. Never throws.
   */
  async sendRefundConfirmation(params: {
    to: string;
    orderNumber: string;
    amountCents: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const bodyHtml = `
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">A refund has been processed for your ${BRAND.name} order.</p>
        <p style="margin:0 0 8px;font-family:${DISPLAY_FONT};font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SIGNAL_ORANGE};">${formatPrice(params.amountCents)}</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">Order <strong>${escapeHtml(params.orderNumber)}</strong></p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:${DEEP_OLIVE};">The refund should appear on your original payment method within 5&ndash;10 business days, depending on your bank.</p>`;

      const { data, error } = await this.resend.emails.send({
        from: getFrom(),
        to: params.to,
        subject: `Refund Processed — ${params.orderNumber}`,
        html: emailShell(bodyHtml),
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (!data?.id) {
        return { success: false, error: "Resend accepted the request but returned no email id" };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Email send failed",
      };
    }
  }

  /**
   * Contact form submission forwarded to the first ADMIN_EMAILS address.
   * Never throws.
   */
  async sendContactNotification(params: {
    fromEmail: string;
    fromName: string;
    topic: string;
    message: string;
    orderNumber?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      return { success: false, error: "No admin email configured (ADMIN_EMAILS)" };
    }

    try {
      const bodyHtml = `
        <p style="margin:0 0 20px;font-family:${DISPLAY_FONT};font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">New contact form submission</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;line-height:1.6;">
          <tr>
            <td style="padding:8px 0;color:${DEEP_OLIVE};font-family:${DISPLAY_FONT};letter-spacing:0.1em;text-transform:uppercase;font-size:12px;font-weight:700;width:120px;">Name</td>
            <td style="padding:8px 0;">${escapeHtml(params.fromName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${DEEP_OLIVE};font-family:${DISPLAY_FONT};letter-spacing:0.1em;text-transform:uppercase;font-size:12px;font-weight:700;width:120px;">Email</td>
            <td style="padding:8px 0;">${escapeHtml(params.fromEmail)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${DEEP_OLIVE};font-family:${DISPLAY_FONT};letter-spacing:0.1em;text-transform:uppercase;font-size:12px;font-weight:700;width:120px;">Topic</td>
            <td style="padding:8px 0;">${escapeHtml(params.topic)}</td>
          </tr>
          ${params.orderNumber ? `<tr>
            <td style="padding:8px 0;color:${DEEP_OLIVE};font-family:${DISPLAY_FONT};letter-spacing:0.1em;text-transform:uppercase;font-size:12px;font-weight:700;width:120px;">Order</td>
            <td style="padding:8px 0;">${escapeHtml(params.orderNumber)}</td>
          </tr>` : ""}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border:1px solid ${CHARCOAL};">
          <tr>
            <td style="padding:16px;font-size:14px;line-height:1.7;">${escapeHtml(params.message).replace(/\n/g, "<br />")}</td>
          </tr>
        </table>`;

      const { data, error } = await this.resend.emails.send({
        from: getFrom(),
        to: adminEmail,
        replyTo: params.fromEmail,
        subject: `[NapFleet Contact] ${params.topic} — from ${params.fromName}`,
        html: emailShell(bodyHtml),
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (!data?.id) {
        return { success: false, error: "Resend accepted the request but returned no email id" };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Email send failed",
      };
    }
  }
}
