import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Gender } from "../enums/genderEnum";
import { UserRole } from "../enums/userRole";
import { Tweet } from "./tweet.entity";
import { Notification } from "./notfication.entity";
import { UserPremiumHistory } from "./UserPremiumHistory.entity";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({ type: "enum", enum: Gender })
  gender: Gender;

  @Column({ default: "" })
  profil_picture: string;

  @Column({ default: "" })
  cover_picture: string;

  @Column({ default: "" })
  bio: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  forgot_password_code: number;

  @Column({ type: "date", nullable: true })
  forgot_password_expiredAt: Date;

  @Column({ default: 0 })
  attemptCount: number;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: true })
  isvisible: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ type: "timestamp", nullable: true })
  premiumExpiredAt: Date;

  @OneToMany(() => UserPremiumHistory, (uph) => uph.user, {
    cascade: true,
  })
  premiumHistories: UserPremiumHistory[];

  @ManyToMany(() => User, { onDelete: "CASCADE" })
  @JoinTable()
  viewers: User[];

  @ManyToMany(() => User, (user) => user.followers, { onDelete: "CASCADE" })
  @JoinTable()
  following: User[];

  @ManyToMany(() => User, (user) => user.following, { onDelete: "CASCADE" })
  followers: User[];

  @OneToMany(() => Tweet, (tweet) => tweet.user, { onDelete: "CASCADE" })
  tweets: Tweet[];

  @ManyToMany(() => Tweet, (t) => t.bookmarks)
  @JoinTable()
  bookmarks: Tweet[];

  @OneToMany(() => Notification, (notification) => notification.fromUser, {
    onDelete: "CASCADE",
  })
  sentNotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.toUser, {
    onDelete: "CASCADE",
  })
  receivedNotifications: Notification[];

  @ManyToMany(() => Tweet, (t) => t.likes, { onDelete: "CASCADE" })
  likedTweet: Tweet[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
