import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  ForeignKey,
  DataType
} from 'sequelize-typescript'
import User from './User'

@Table({ timestamps: true, tableName: 'Messages', paranoid: true })
export class Message extends Model<Message> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  fromUserId!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  toUserId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  message!: string

  static async createMessage(
    fromUserId: number,
    toUserId: number,
    message: string
  ): Promise<Message> {
    return await Message.create<Message>({
      fromUserId,
      toUserId,
      message
    })
  }

  static async getMessages(
    fromUserId: number,
    toUserId: number
  ): Promise<Message[]> {
    return await Message.findAll({
      where: {
        fromUserId,
        toUserId
      }
    })
  }
}

export default Message
