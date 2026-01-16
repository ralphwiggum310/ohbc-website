/**
 * Email Service
 * 
 * In a production environment, you would want to use a proper email service
 * like SendGrid, Mailgun, or AWS SES.
 * 
 * This implementation provides a simple interface that can be easily
 * replaced with a real email service when needed.
 */

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

/**
 * Sends an email using the configured email service
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, text, from } = options;
  
  // In test environment, log but don't send
  if (process.env.NODE_ENV === 'test') {
    console.log('[Email] Test environment - email not sent:', { to, subject });
    return { messageId: 'test-message-id' };
  }

  // In development without email config, log but don't send
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
    console.log('[Email] Development mode - email not sent (no email service configured):', { 
      to, 
      subject,
      // Don't log full HTML in console
      html: html ? '[HTML content]' : undefined,
      text: text ? '[Text content]' : undefined
    });
    return { messageId: 'dev-message-id' };
  }

  // In production or development with email service configured
  try {
    // This is where you would integrate with your email service
    // For now, we'll just log the email
    console.log('[Email] Sending email:', { 
      to, 
      subject,
      // Don't log full content in production
      html: process.env.NODE_ENV === 'development' ? html : '[Content hidden]',
      text: process.env.NODE_ENV === 'development' ? text : undefined
    });

    // In a real implementation, you would call your email service here
    // For example, with SendGrid, Mailgun, or a custom API
    
    return { messageId: `mock-${Date.now()}` };
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  accountLocked: (data: {
    name: string;
    email: string;
    ipAddress: string;
    userAgent?: string;
    unlockLink?: string;
  }) => ({
    subject: 'Account Locked',
    html: `
      <h2>Account Locked</h2>
      <p>Hello ${data.name},</p>
      <p>Your account has been temporarily locked due to too many failed login attempts.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li><strong>IP Address:</strong> ${data.ipAddress}</li>
        <li><strong>User Agent:</strong> ${data.userAgent || 'Unknown'}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      ${data.unlockLink ? `<p><a href="${data.unlockLink}">Click here to unlock your account</a></p>` : ''}
      <p>If you didn't attempt to log in, please secure your account immediately.</p>
      <p>Best regards,<br>Security Team</p>
    `,
  }),
  
  suspiciousActivity: (data: {
    name: string;
    email: string;
    activity: string;
    location?: string;
    ipAddress: string;
    userAgent?: string;
  }) => ({
    subject: 'Suspicious Activity Detected',
    html: `
      <h2>Suspicious Activity Detected</h2>
      <p>Hello ${data.name},</p>
      <p>We've detected suspicious activity on your account:</p>
      <p><strong>${data.activity}</strong></p>
      
      <p><strong>Details:</strong></p>
      <ul>
        <li><strong>Location:</strong> ${data.location || 'Unknown'}</li>
        <li><strong>IP Address:</strong> ${data.ipAddress}</li>
        <li><strong>Device:</strong> ${data.userAgent || 'Unknown'}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      
      <p>If this wasn't you, please secure your account immediately by changing your password and enabling two-factor authentication.</p>
      <p>Best regards,<br>Security Team</p>
    `,
  }),
  
  passwordResetRequested: (data: {
    name: string;
    email: string;
    resetLink: string;
    ipAddress: string;
    expiresIn?: string;
  }) => ({
    subject: 'Password Reset Requested',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${data.name},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <p><a href="${data.resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p><small>${data.resetLink}</small></p>
      ${data.expiresIn ? `<p>This link will expire in ${data.expiresIn}.</p>` : ''}
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>Security Team</p>
    `,
  }),
  
  passwordChanged: (data: { name: string; email: string; ipAddress: string }) => ({
    subject: 'Password Changed Successfully',
    html: `
      <h2>Password Updated</h2>
      <p>Hello ${data.name},</p>
      <p>Your password was successfully changed.</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>IP Address:</strong> ${data.ipAddress}</p>
      <p>If you didn't make this change, please secure your account immediately.</p>
      <p>Best regards,<br>Security Team</p>
    `,
  }),
};

export async function sendSecurityEmail(
  template: keyof typeof emailTemplates,
  data: any
) {
  const { subject, html } = emailTemplates[template](data);
  return sendEmail({
    to: data.email,
    subject,
    html,
  });
}
