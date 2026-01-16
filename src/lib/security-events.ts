import { getRepository } from './db/database';
import { User } from '@/models/User';
import { sendEmail } from './email';

export type SecurityEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'SUSPICIOUS_ACTIVITY';

export interface SecurityEvent {
  id?: string;
  userId?: string;
  type: SecurityEventType;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

class SecurityEventsService {
  private static instance: SecurityEventsService;
  
  private constructor() {}
  
  public static getInstance(): SecurityEventsService {
    if (!SecurityEventsService.instance) {
      SecurityEventsService.instance = new SecurityEventsService();
    }
    return SecurityEventsService.instance;
  }

  async logEvent(event: Omit<SecurityEvent, 'createdAt'>): Promise<void> {
    try {
      // In a production environment, you would save this to a database
      console.log('[SECURITY EVENT]', {
        ...event,
        timestamp: new Date().toISOString(),
      });

      // Trigger appropriate actions based on event type
      await this.handleEventActions(event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async handleEventActions(event: SecurityEvent): Promise<void> {
    const { type, userId, ipAddress, userAgent, metadata } = event;
    
    switch (type) {
      case 'ACCOUNT_LOCKED':
        if (userId) {
          await this.notifyUser(userId, {
            subject: 'Account Locked',
            template: 'account-locked',
            data: { ipAddress, userAgent, ...metadata },
          });
        }
        break;
        
      case 'SUSPICIOUS_ACTIVITY':
        if (userId) {
          await this.notifyUser(userId, {
            subject: 'Suspicious Activity Detected',
            template: 'suspicious-activity',
            data: { ipAddress, userAgent, ...metadata },
          });
        }
        break;
        
      case 'PASSWORD_RESET_REQUEST':
        if (userId) {
          await this.notifyUser(userId, {
            subject: 'Password Reset Requested',
            template: 'password-reset-requested',
            data: { ipAddress, userAgent, ...metadata },
          });
        }
        break;
        
      case 'PASSWORD_CHANGED':
        if (userId) {
          await this.notifyUser(userId, {
            subject: 'Password Changed',
            template: 'password-changed',
            data: { ipAddress, userAgent, ...metadata },
          });
        }
        break;
    }
  }

  private async notifyUser(
    userId: string,
    options: {
      subject: string;
      template: string;
      data: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const userRepository = await getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user?.email) return;
      
      // In a real app, you would use a proper email template
      const emailContent = this.renderEmailTemplate(options.template, {
        ...options.data,
        user: {
          name: user.name,
          email: user.email,
        },
      });
      
      await sendEmail({
        to: user.email,
        subject: options.subject,
        html: emailContent,
      });
    } catch (error) {
      console.error('Failed to send security notification:', error);
    }
  }

  private renderEmailTemplate(templateName: string, data: any): string {
    // In a real app, use a proper templating engine
    const templates: Record<string, (data: any) => string> = {
      'account-locked': (data) => `
        <h2>Account Locked</h2>
        <p>Your account was locked due to too many failed login attempts.</p>
        <p><strong>IP Address:</strong> ${data.ipAddress}</p>
        <p><strong>User Agent:</strong> ${data.userAgent || 'Unknown'}</p>
        <p>If this wasn't you, please secure your account immediately.</p>
      `,
      'suspicious-activity': (data) => `
        <h2>Suspicious Activity Detected</h2>
        <p>We've detected suspicious activity on your account.</p>
        <p><strong>Activity:</strong> ${data.activity || 'Unknown'}</p>
        <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
        <p><strong>IP Address:</strong> ${data.ipAddress}</p>
        <p>If this wasn't you, please secure your account immediately.</p>
      `,
      'password-reset-requested': (data) => `
        <h2>Password Reset Requested</h2>
        <p>A password reset was requested for your account.</p>
        <p>If you didn't request this, please secure your account immediately.</p>
        <p>Otherwise, you can ignore this email.</p>
      `,
      'password-changed': (data) => `
        <h2>Password Changed</h2>
        <p>Your password was successfully changed.</p>
        <p>If you didn't make this change, please secure your account immediately.</p>
      `,
    };

    const template = templates[templateName] || (() => '');
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            ${template(data)}
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const securityEvents = SecurityEventsService.getInstance();

// Helper function to log security events
export async function logSecurityEvent(
  type: SecurityEventType,
  ipAddress: string,
  options: {
    userId?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<void> {
  const { userId, userAgent, metadata } = options;
  await securityEvents.logEvent({
    type,
    userId,
    ipAddress,
    userAgent,
    metadata,
  });
}
