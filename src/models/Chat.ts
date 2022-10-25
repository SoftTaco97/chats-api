import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  Default,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript'
import { User } from './User';

@Table
export class Chat extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id!: string;

  @Column
  text!: string

  @ForeignKey(() => User)
  @Column
  user_id!: number

  @BelongsTo(() => User)
  User!: User

  @Column
  expiration_date!: Date
}
