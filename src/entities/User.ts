import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne, 
  JoinColumn, 
  OneToMany 
} from 'typeorm';
import { Member } from './Member';
import { PrayerRequest } from './PrayerRequest';
import { Schedule } from './Schedule';
import { ScheduleAttendance } from './ScheduleAttendance';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'member' | 'guest';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'guest'
  })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Member, member => member.user, { cascade: true })
  member: Member;

  @OneToMany(() => PrayerRequest, prayerRequest => prayerRequest.user)
  prayerRequests: PrayerRequest[];

  @OneToMany(() => Schedule, schedule => schedule.createdBy)
  schedules: Schedule[];

  @OneToMany(() => ScheduleAttendance, attendance => attendance.user)
  attendances: ScheduleAttendance[];

  // Methods
  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Hooks
  async beforeInsert() {
    await this.hashPassword();
  }

  async beforeUpdate() {
    if (this.password) {
      await this.hashPassword();
    }
  }
}
