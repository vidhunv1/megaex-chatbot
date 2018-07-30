import {Table, Column, Model, PrimaryKey, AllowNull, AutoIncrement, Default} from 'sequelize-typescript';
import User from './user';

@Table({timestamps: true, tableName: 'PaymentDetails'})
export default class PaymentDetail extends Model<PaymentDetail> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @Column
  name!: string

  @AllowNull(false)
  @Default(1)
  @Column
  totalFields!: number

  @AllowNull(false)
  @Column
  currencyCode!: string

  @AllowNull(false)
  @Default(99)
  @Column
  priority!: number

  static async isPaymethodNameExists(user:User, paymethodName:string):Promise<boolean> {
    let totalPaymethods:number =  await PaymentDetail.count();
    for(let i=1; i<=totalPaymethods; i++) {
      console.log(paymethodName+" === "+user.__('paymethod'+i+'_name'))
      if(paymethodName === user.__('paymethod'+i+'_name')) {
        return true;
      }
    }
    return false;
  }

  static async getPaymethodNames(user:User, getOnlyUsers:boolean = false): Promise<string[]> {
    let pd:PaymentDetail[], list = [];
    if(!getOnlyUsers)
      pd = await PaymentDetail.findAll({where: {currencyCode: user.currencyCode}, order: [['priority']]})
    else {
      pd = (await PaymentDetail.sequelize.query('SELECT id from "PaymentDetails" where id in (SELECT "paymentId" from "PaymentMethods" where "deletedAt" IS NULL AND "userId" = ?);', 
        { replacements: [user.id], type: PaymentDetail.sequelize.QueryTypes.SELECT }))
    }
    for(let i=0; i<pd.length; i++) {
      list.push(user.__('paymethod'+(pd[i].id)+'_name'));
    }
    return list;
  }

  static async getPaymethodID(user:User, paymethodName:string): Promise<number> {
    let totalPaymethods:number =  await PaymentDetail.count();
    for(let i=1; i<=totalPaymethods; i++) {
      if(paymethodName === user.__('paymethod'+i+'_name')) {
        return i;
      }
    }
    return -1;
  }

  static async getLocaleFields(user:User, paymethodName:string):Promise<string[]|null> {
    let totalPaymethods:number =  await PaymentDetail.count(), fields = [];
    for(let i=1; i<=totalPaymethods; i++) {
      if(paymethodName === user.__('paymethod'+i+'_name')) {
        let pD = await PaymentDetail.findOne({where: {id: i}});
        if(!pD)
          return null;
        for(let j=1; j<=pD.totalFields; j++) {
          fields.push(user.__('paymethod'+i+'_field'+j));
        }
        return fields;
      }
    }
    return null;
  }
}