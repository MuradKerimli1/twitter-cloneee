import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";

@Entity()
export class Tweet extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tweets, { onDelete: "CASCADE" })
  user: User;

  @Column()
  text: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  video: string;

  @ManyToMany(() => User, (u) => u.likedTweet)
  @JoinTable()
  likes: User[];

  @ManyToMany(() => User, (user) => user.bookmarks, { onDelete: "CASCADE" })
  bookmarks: User[];

  @OneToMany(() => Comment, (c) => c.tweet)
  comments: Comment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
