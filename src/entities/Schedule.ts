import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { ScheduleAttendance } from './ScheduleAttendance';

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum ScheduleCategory {
  SERVICE = 'service',
  MEETING = 'meeting',
  EVENT = 'event',
  OTHER = 'other'
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column('text', { nullable: true })
  private _recurrencePattern: string | null = null;

  get recurrencePattern(): { frequency: ScheduleFrequency; interval: number; endDate?: Date } | null {
    if (!this._recurrencePattern) return null;
    try {
      return JSON.parse(this._recurrencePattern);
    } catch (e) {
      console.error('Error parsing recurrencePattern:', e);
      return null;
    }
  }

  set recurrencePattern(value: { frequency: ScheduleFrequency; interval: number; endDate?: Date } | null) {
    this._recurrencePattern = value ? JSON.stringify(value) : null;
  }

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({
    type: 'text',
    default: 'other'
  })
  category: ScheduleCategory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', type: 'varchar', length: 36 })
  createdById: string;

  @OneToMany(() => ScheduleAttendance, attendance => attendance.schedule, { cascade: true })
  attendees: ScheduleAttendance[];
}
