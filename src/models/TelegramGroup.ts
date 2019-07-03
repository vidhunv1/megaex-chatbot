import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
  AutoIncrement
} from 'sequelize-typescript'

@Table({ timestamps: true, tableName: 'TelegramGroups', paranoid: true })
export class TelegramGroup extends Model<TelegramGroup> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.BIGINT)
  telegramGroupId!: number // corresponds to group id field of telegram

  @AllowNull(false)
  @Column(DataType.BIGINT)
  telegramId!: number

  @AllowNull(false)
  @ForeignKey(() => TelegramGroup)
  @Default(6)
  @Column(DataType.INTEGER)
  dailyAlertLimit!: number

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  messageCount!: number

  static async getGroup(groupId: number): Promise<TelegramGroup | null> {
    return TelegramGroup.findOne({
      where: {
        telegramGroupId: groupId
      }
    })
  }

  static async updateMessageCount(groupId: number) {
    return TelegramGroup.update(
      { messageCount: TelegramGroup.sequelize.literal('"messageCount" + 1') },
      { where: { telegramGroupId: groupId } }
    )
  }

  static async createGroup(
    groupId: number,
    telegramUserId: number
  ): Promise<TelegramGroup> {
    return TelegramGroup.create<TelegramGroup>({
      telegramGroupId: groupId,
      telegramId: telegramUserId
    })
  }
}

export default TelegramGroup
