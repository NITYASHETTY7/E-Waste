import { Injectable, Logger } from '@nestjs/common';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Send email notification via AWS SES.
   * Falls back to logging when SES is not configured.
   */
  async sendEmail(payload: EmailPayload): Promise<void> {
    const fromEmail = process.env.AWS_SES_FROM_EMAIL;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    // If AWS credentials are not configured, log instead of sending
    if (!fromEmail || !accessKeyId || accessKeyId === 'your_aws_access_key') {
      this.logger.warn(`[EMAIL SKIPPED — SES NOT CONFIGURED] To: ${payload.to} | Subject: ${payload.subject}`);
      this.logger.debug(`Body: ${payload.body}`);
      return;
    }

    try {
      // Dynamic import to avoid breaking if @aws-sdk/client-ses is not installed
      const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
      const ses = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey: secretAccessKey! },
      });

      await ses.send(
        new SendEmailCommand({
          Source: fromEmail,
          Destination: { ToAddresses: [payload.to] },
          Message: {
            Subject: { Data: payload.subject },
            Body: { Html: { Data: payload.body } },
          },
        }),
      );

      this.logger.log(`✉️ Email sent to ${payload.to}: ${payload.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.to}`, error);
    }
  }

  // ─── Pre-built notification templates ────────────────────

  async notifyAuditInvitation(vendorEmail: string, vendorName: string, requirementTitle: string) {
    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] You've been invited to conduct a site audit`,
      body: `
        <h2>Audit Invitation</h2>
        <p>Hello ${vendorName},</p>
        <p>You have been invited to conduct a site audit for: <strong>${requirementTitle}</strong></p>
        <p>Please log in to the WeConnect portal to review details and respond.</p>
        <p><a href="${process.env.WEB_URL || 'http://localhost:3000'}/vendor/audits">View Audit Details →</a></p>
        <br/><p>— WeConnect Platform</p>
      `,
    });
  }

  async notifyBidClosingSoon(vendorEmail: string, vendorName: string, auctionTitle: string, minutesLeft: number) {
    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] Auction closing in ${minutesLeft} minutes — ${auctionTitle}`,
      body: `
        <h2>Auction Closing Soon</h2>
        <p>Hello ${vendorName},</p>
        <p>The auction for <strong>${auctionTitle}</strong> closes in <strong>${minutesLeft} minutes</strong>.</p>
        <p>Place your final bid now.</p>
        <p><a href="${process.env.WEB_URL || 'http://localhost:3000'}/vendor/live-auction">Go to Auction →</a></p>
        <br/><p>— WeConnect Platform</p>
      `,
    });
  }

  async notifyPaymentPending(vendorEmail: string, vendorName: string, auctionTitle: string, amount: number) {
    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] Payment required — ${auctionTitle}`,
      body: `
        <h2>Payment Required</h2>
        <p>Hello ${vendorName},</p>
        <p>Your bid for <strong>${auctionTitle}</strong> has been accepted. Please submit payment of <strong>₹${amount.toLocaleString()}</strong>.</p>
        <p><a href="${process.env.WEB_URL || 'http://localhost:3000'}/vendor/payments">Submit Payment →</a></p>
        <br/><p>— WeConnect Platform</p>
      `,
    });
  }

  async notifyCompliancePending(vendorEmail: string, vendorName: string, auctionTitle: string) {
    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] Compliance documents required — ${auctionTitle}`,
      body: `
        <h2>Upload Compliance Documents</h2>
        <p>Hello ${vendorName},</p>
        <p>Payment has been confirmed for <strong>${auctionTitle}</strong>. Please upload your compliance documents (Form 6, Weight Slips, Certificates).</p>
        <p><a href="${process.env.WEB_URL || 'http://localhost:3000'}/vendor/pickups">Upload Documents →</a></p>
        <br/><p>— WeConnect Platform</p>
      `,
    });
  }

  async notifyAccountApproved(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      subject: `[WeConnect] Your account has been approved!`,
      body: `
        <h2>Account Approved</h2>
        <p>Hello ${userName},</p>
        <p>Your WeConnect account has been approved. You can now access the full platform.</p>
        <p><a href="${process.env.WEB_URL || 'http://localhost:3000'}">Go to Dashboard →</a></p>
        <br/><p>— WeConnect Platform</p>
      `,
    });
  }

  /**
   * Sent to every vendor selected by the client once the admin approves the listing.
   */
  async notifySealedBidInvitation(
    vendorEmail: string,
    vendorName: string,
    requirementTitle: string,
    auctionId: string,
    sealedBidDeadline: string,
  ) {
    const portalUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/vendor/bids`;
    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] You are invited to place a sealed bid — ${requirementTitle}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
          <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px">WeConnect Platform</h1>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;padding:28px;border-radius:0 0 8px 8px">
            <h2 style="color:#1e40af;margin:0 0 16px">&#128737; Sealed Bid Invitation</h2>
            <p>Dear <strong>${vendorName}</strong>,</p>
            <p>You have been selected to participate in a <strong>sealed bid auction</strong>:</p>
            <div style="background:#f1f5f9;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:4px;margin:16px 0">
              <p style="margin:0;font-weight:700;font-size:15px">${requirementTitle}</p>
              <p style="margin:6px 0 0;color:#64748b;font-size:13px">Auction ID: ${auctionId}</p>
            </div>
            <p><strong>Sealed Bid Deadline:</strong> ${sealedBidDeadline}</p>
            <p style="color:#64748b;font-size:13px">Submit your best price with a price sheet before the deadline. All bids are confidential.</p>
            <div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:6px;margin:20px 0">
              <p style="margin:0;font-size:13px;color:#92400e">&#9888;&#65039; <strong>Important:</strong> Late bids will not be accepted.</p>
            </div>
            <a href="${portalUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700">Place Sealed Bid &rarr;</a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0"/>
            <h3 style="margin:0 0 12px">&#128203; What Happens Next</h3>
            <ol style="color:#475569;font-size:13px;padding-left:20px;line-height:2">
              <li>Submit sealed bid (price + Excel sheet) before deadline</li>
              <li>WeConnect reviews and shortlists vendors</li>
              <li>Shortlisted vendors join the <strong>Live Open Auction</strong></li>
              <li>Highest bidder wins &rarr; Final quote &rarr; Payment &rarr; Pickup</li>
            </ol>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">— WeConnect Platform</p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Sent to the winning vendor after the admin selects them as auction winner.
   */
  async notifyAuctionWinner(
    vendorEmail: string,
    vendorName: string,
    requirementTitle: string,
    winningAmount: number,
    clientName: string,
    auctionId: string,
  ) {
    const commissionAmount = Math.round(winningAmount * 0.05);
    const clientAmount = winningAmount - commissionAmount;
    const portalUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/vendor/final-quote`;

    const steps = [
      ['Upload Final Quote', `Log in and upload your <strong>product-wise quotation</strong> (PDF) and <strong>company letterhead quotation</strong>.`, '/vendor/final-quote'],
      ['Await Client Approval', 'Client reviews your quote. You will be notified by email.', null],
      ['Make Payment', `Pay <strong>&#8377;${clientAmount.toLocaleString('en-IN')}</strong> to client + <strong>&#8377;${commissionAmount.toLocaleString('en-IN')}</strong> (5%) to WeConnect. Bank details on payments page.`, '/vendor/payments'],
      ['Upload Payment Proof', 'Upload screenshot + UTR number for both transfers.', '/vendor/payments'],
      ['Schedule Pickup', 'Schedule pickup date. SPOC contact details provided on portal.', '/vendor/pickups'],
      ['Upload Compliance Docs', 'On pickup day: Form 6, Weight Slip (Empty), Weight Slip (Loaded), Recycling Certificate, Disposal Certificate.', '/vendor/pickups'],
    ];

    return this.sendEmail({
      to: vendorEmail,
      subject: `[WeConnect] &#127942; You won the auction — ${requirementTitle}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
          <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px">WeConnect Platform</h1>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;padding:28px;border-radius:0 0 8px 8px">
            <div style="background:#f0fdf4;border:1px solid #86efac;padding:16px 20px;border-radius:8px;margin-bottom:24px">
              <h2 style="color:#166534;margin:0 0 4px">&#127942; Congratulations! You Won!</h2>
            </div>
            <p>Dear <strong>${vendorName}</strong>,</p>
            <p>You have won the auction for <strong>${requirementTitle}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden">
              <tr style="background:#f8fafc">
                <td style="padding:10px 14px;color:#64748b;font-weight:600">Winning Bid</td>
                <td style="padding:10px 14px;font-weight:700">&#8377;${winningAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;color:#64748b;font-weight:600">Pay to Client (${clientName})</td>
                <td style="padding:10px 14px;font-weight:700;color:#166534">&#8377;${clientAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="background:#f8fafc">
                <td style="padding:10px 14px;color:#64748b;font-weight:600">WeConnect Commission (5%)</td>
                <td style="padding:10px 14px;font-weight:700;color:#1e40af">&#8377;${commissionAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
            <h3 style="border-top:1px solid #e2e8f0;padding-top:20px;margin:0 0 16px">&#128203; Your Next Steps</h3>
            ${steps.map(([title, desc, url], i) => `
              <div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">
                <div style="min-width:28px;height:28px;background:#1e40af;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;text-align:center;line-height:28px">${i + 1}</div>
                <div>
                  <p style="margin:0;font-weight:700">${title}</p>
                  <p style="margin:4px 0 0;color:#475569;font-size:13px">${desc}</p>
                  ${url ? `<a href="${process.env.WEB_URL || 'http://localhost:3000'}${url}" style="font-size:12px;color:#3b82f6">Go to portal &rarr;</a>` : ''}
                </div>
              </div>
            `).join('')}
            <div style="background:#fff7ed;border:1px solid #fdba74;padding:14px 18px;border-radius:6px;margin:24px 0">
              <p style="margin:0;font-size:13px;color:#9a3412">&#9888;&#65039; Failure to upload the final quote within 48 hours or make payment within 5 business days may result in disqualification.</p>
            </div>
            <a href="${portalUrl}" style="display:inline-block;background:#166534;color:#fff;padding:13px 30px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px">Upload Final Quote Now &rarr;</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:28px">— WeConnect Platform</p>
          </div>
        </div>
      `,
    });
  }
}
