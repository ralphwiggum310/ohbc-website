import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, AfterInsert, AfterUpdate, AfterRemove } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { logSecurityEvent, SecurityEventType } from '@/lib/security-events';
// Helper to get client IP from request headers
const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return (forwardedFor ? forwardedFor.split(',')[0] : realIp || 'unknown').trim();
};

// Using string literal type for roles
const USER_ROLES = ['admin', 'member', 'guest'] as const;
export type UserRole = typeof USER_ROLES[number];

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'guest'
  })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null = null;

  @Column({ name: 'failed_login_attempts', type: 'integer', default: 0 })
  failedLoginAttempts: number = 0;

  @Column({ name: 'account_locked_until', type: 'datetime', nullable: true })
  accountLockedUntil: Date | null = null;

  @Column({ name: 'last_failed_login', type: 'datetime', nullable: true })
  lastFailedLogin: Date | null = null;

  @Column({ name: 'password_changed_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  passwordChangedAt: Date = new Date();

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean = false;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean = false;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean = false;

  @Column({ name: 'two_factor_secret', type: 'varchar', nullable: true })
  twoFactorSecret: string | null = null;

  @Column({ name: 'recovery_codes', type: 'simple-array', nullable: true })
  recoveryCodes: string[] = [];

  @Column({ name: 'security_questions', type: 'simple-json', nullable: true })
  securityQuestions: Array<{ question: string; answerHash: string }> = [];

  @Column({ name: 'trusted_devices', type: 'simple-json', nullable: true })
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    userAgent: string;
    ipAddress: string;
  }> = [];

  // Virtual field for password (not stored in DB)
  private tempPassword: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;

  /**
   * Sets a new password after validation
   */
  setPassword(newPassword: string) {
    // Simple password validation
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    this.password = hashedPassword;
  }

  /**
   * Checks if the account is currently locked
   */
  isAccountLocked(): boolean {
    if (!this.accountLockedUntil) return false;
    return new Date() < this.accountLockedUntil;
  }

  /**
   * Records a failed login attempt and locks the account if needed
   */
  recordFailedLoginAttempt() {
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;

    this.failedLoginAttempts += 1;
    this.lastFailedLogin = new Date();

    if (this.failedLoginAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + LOCKOUT_MINUTES);
      this.accountLockedUntil = lockoutTime;
    }
  }

  /**
   * Resets the failed login counter when login is successful
   */
  resetFailedLoginAttempts() {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    this.lastLogin = new Date();
  }

  /**
   * Compares a candidate password with the hashed password
   */


  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash the password if it has been modified (or is new)
    if (this.tempPassword) {
      const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
      this.password = await bcrypt.hash(this.tempPassword, salt);
      this.passwordChangedAt = new Date();
      this.tempPassword = null;
      this.mustChangePassword = false; // Reset flag if password is changed
      this.resetFailedLoginAttempts();
    }
  }

  async comparePassword(candidatePassword: string, request?: Request): Promise<boolean> {
    if (!this.password) return false;
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (!isMatch) {
      this.recordFailedLoginAttempt();
      
      // Log failed login attempt
      if (request) {
        const ip = getClientIp(request as any) || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        await logSecurityEvent('LOGIN_FAILURE', ip, {
          userId: this.id,
          userAgent,
          metadata: {
            email: this.email,
            failedAttempts: this.failedLoginAttempts,
            isLocked: this.isAccountLocked(),
          },
        });
      }
      
      return false;
    }
    
    // If password is correct, reset failed attempts
    this.resetFailedLoginAttempts();
    
    // Log successful login
    if (request) {
      const ip = getClientIp(request as any) || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logSecurityEvent('LOGIN_SUCCESS', ip, {
        userId: this.id,
        userAgent,
      });
    }
    
    return true;
  }
  
  /**
   * Marks the user's email as verified
   */
  async markEmailAsVerified() {
    this.emailVerified = true;
    await logSecurityEvent('EMAIL_VERIFIED' as SecurityEventType, 'system', {
      userId: this.id,
      metadata: { email: this.email }
    });
  }
  
  /**
   * Adds a trusted device
   */
  addTrustedDevice(deviceInfo: {
    id: string;
    name: string;
    userAgent: string;
    ipAddress: string;
  }) {
    this.trustedDevices = this.trustedDevices || [];
    
    // Remove if already exists
    this.trustedDevices = this.trustedDevices.filter(d => d.id !== deviceInfo.id);
    
    // Add new device
    this.trustedDevices.push({
      ...deviceInfo,
      lastUsed: new Date().toISOString(),
    });
    
    // Keep only the 10 most recent devices
    if (this.trustedDevices.length > 10) {
      this.trustedDevices = this.trustedDevices
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 10);
    }
  }
  
  /**
   * Checks if a device is trusted
   */
  isDeviceTrusted(deviceId: string): boolean {
    if (!this.trustedDevices) return false;
    return this.trustedDevices.some(device => device.id === deviceId);
  }
  
  /**
   * Generates recovery codes
   */
  generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(
        Array.from(
          { length: 8 },
          () => Math.floor(Math.random() * 16).toString(16)
        ).join('').toUpperCase()
      );
    }
    
    // Hash the recovery codes before storing
    this.recoveryCodes = codes.map(code => 
      bcrypt.hashSync(code, bcrypt.genSaltSync(10))
    );
    
    return codes;
  }
  
  /**
   * Verifies a recovery code
   */
  verifyRecoveryCode(code: string): boolean {
    if (!this.recoveryCodes || this.recoveryCodes.length === 0) return false;
    
    const index = this.recoveryCodes.findIndex(hashedCode => 
      bcrypt.compareSync(code, hashedCode)
    );
    
    if (index !== -1) {
      // Remove the used code
      this.recoveryCodes.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * Security event hooks
   */
  @AfterInsert()
  async afterInsert() {
    await logSecurityEvent('USER_CREATED' as SecurityEventType, 'system', {
      userId: this.id,
      userAgent: 'system',
      metadata: { email: this.email }
    });
  }
  
  @AfterUpdate()
  async afterUpdate() {
    await logSecurityEvent('USER_UPDATED' as SecurityEventType, 'system', {
      userId: this.id,
      userAgent: 'system',
      metadata: { email: this.email }
    });
  }
  
  @AfterRemove()
  async afterRemove() {
    await logSecurityEvent('USER_DELETED' as SecurityEventType, 'system', {
      userId: this.id,
      userAgent: 'system',
      metadata: { email: this.email }
    });
  }
}
