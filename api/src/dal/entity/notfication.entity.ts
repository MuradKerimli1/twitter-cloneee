import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./user.entity";

export enum NotificationType {
  follow = "follow",
  like = "like",
  comment = "comment",
  bookmark = "bookmark",
  profileView = "profileView",
}

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentNotifications, {
    onDelete: "CASCADE",
  })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.receivedNotifications, {
    onDelete: "CASCADE",
  })
  toUser: User;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
