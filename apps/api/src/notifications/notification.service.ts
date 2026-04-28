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
}
