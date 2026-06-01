import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const transporter = getTransporter();
  const subject = 'Welcome to BuildrX! 🚀';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
      <h2 style="color: #6366f1;">Welcome to BuildrX, ${name}!</h2>
      <p>We are excited to help you transform your web assets into high-performance Android applications and publish your APIs on our global marketplace.</p>
      <p>From your dashboard, you can now:</p>
      <ul>
        <li>Convert any web URL into an APK in under 3 minutes.</li>
        <li>Publish and monetize your services on the API Marketplace.</li>
        <li>Generate client API keys and track real-time analytics.</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our developer support team.</p>
      <br />
      <p>Best regards,<br/><strong>The BuildrX Team</strong></p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BuildrX" <noreply@buildrx.com>',
      to: email,
      subject,
      html,
    });
  } else {
    console.log(`[Email welcome] To: ${email} | Subject: ${subject}`);
  }
};

export const sendApiKeyNotification = async (email: string, apiKeyLabel: string, apiName: string) => {
  const transporter = getTransporter();
  const subject = `API Key Generated: ${apiKeyLabel} 🔑`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
      <h2 style="color: #6366f1;">New API Key Generated</h2>
      <p>Hello,</p>
      <p>A new API access token has been generated for your subscription to <strong>${apiName}</strong>.</p>
      <p><strong>Key Label:</strong> ${apiKeyLabel}</p>
      <p style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #6366f1; font-family: monospace;">
        bx_live_************************
      </p>
      <p style="color: #ef4444; font-weight: bold;">For security, keep this key private. Do not commit it to public repositories or front-end client codes.</p>
      <br />
      <p>Best regards,<br/><strong>The BuildrX Gateway Service</strong></p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BuildrX Gateway" <gateway@buildrx.com>',
      to: email,
      subject,
      html,
    });
  } else {
    console.log(`[Email Key] To: ${email} | Subject: ${subject}`);
  }
};

export const sendInvoiceEmail = async (email: string, invoiceId: string, amount: number, currency: string) => {
  const transporter = getTransporter();
  const subject = `Your BuildrX Invoice is Ready: ${invoiceId} 🧾`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
      <h2 style="color: #10b981;">Invoice Paid Successfully</h2>
      <p>Hi there,</p>
      <p>Thank you for your payment. Your invoice has been processed successfully.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 8px 0;">Invoice ID</th>
          <td style="text-align: right; padding: 8px 0;">${invoiceId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 8px 0;">Amount Paid</th>
          <td style="text-align: right; padding: 8px 0; font-weight: bold; color: #10b981;">
            ${currency} ${amount.toLocaleString()}
          </td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px 0;">Payment Status</th>
          <td style="text-align: right; padding: 8px 0; color: #10b981; font-weight: bold;">PAID</td>
        </tr>
      </table>
      <p>A full copy of your transaction log is stored in your billing dashboard.</p>
      <br />
      <p>Best regards,<br/><strong>BuildrX Billing</strong></p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BuildrX Billing" <billing@buildrx.com>',
      to: email,
      subject,
      html,
    });
  } else {
    console.log(`[Email Invoice] To: ${email} | Subject: ${subject}`);
  }
};
