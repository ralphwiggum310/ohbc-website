import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Schedule } from './Schedule';

export type AttendanceStatus = 'pending' | 'accepted' | 'declined';

@Entity('schedule_attendance')
export class ScheduleAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    default: 'pending'
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => Schedule, schedule => schedule.attendees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @Column({ name: 'schedule_id', type: 'varchar', length: 36 })
  scheduleId: string;
}
