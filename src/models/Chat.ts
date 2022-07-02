import { Table, Model, Column, ForeignKey, BelongsTo, Index, Default } from 'sequelize-typescript'
import { User } from './User';

@Table
export class Chat extends Model {
    @Index
    @Column
    uuid!: string

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