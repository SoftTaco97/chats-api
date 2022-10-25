import {
  Table,
  Model,
  Column,
  HasMany,
  Index,
  Unique
} from 'sequelize-typescript'
import { Chat } from './Chat';

@Table
export class User extends Model {
  @Index
  @Unique
  @Column
  username!: string

  @HasMany(() => Chat)
  Chats!: Chat[]
}
