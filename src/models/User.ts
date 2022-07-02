import {
  Table,
  Model,
  Column,
  HasMany,
  Index
} from 'sequelize-typescript'
import { Chat } from './Chat';

@Table
export class User extends Model {
  @Index
  @Column
  username!: string

  @HasMany(() => Chat)
  Chats!: Chat[]
}
