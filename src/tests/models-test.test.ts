// import { expect } from 'chai'
// import 'mocha'
// import { initDB, closeDB, createUser } from './test-db-helper'

// import Wallets from '../models/Wallet'
// import User from '../models/User'
// import Transaction from '../models/transaction'
// import Transfer, { TransferError } from '../models/transfer'
// import Wallet from '../models/Wallet'
// import Market from '../models/market'

// describe('Models Test', function() {
//   let createdUser: User
//   this.timeout(8000)
//   before(async () => {
//     createdUser = await initDB()
//   })

//   after(async () => {
//     await closeDB()
//   })

//   describe('[User]', function() {
//     it('should generate random account id', () => {
//       expect(createdUser.accountId).to.have.lengthOf(7)
//     })
//   })

//   describe('[TelegramUser]', function() {
//     it('should create new account', () => {
//       expect(createdUser).to.not.be.null
//       expect(createdUser.id).to.not.be.null
//       expect(createdUser.telegramUser.id).to.not.be.null
//     })
//   })

//   describe('[Wallet]', function() {
//     it('should create all cryptocurrency coins address', () => {
//       const allCoins = Market.getCryptoCurrencies()
//       expect(createdUser.wallets).have.length(allCoins.length)
//       for (let i = 0; i < createdUser.wallets.length; i++) {
//         expect(allCoins).to.deep.include(createdUser.wallets[0].currencyCode)
//         expect(createdUser.wallets[0].address).to.not.be.null
//       }
//     })
//   })

//   describe('[Transactions]', function() {
//     let firstCoin: string,
//       secondCoin: string,
//       oldWalletFirst: Wallets | null,
//       oldWalletSecond: Wallets | null
//     before(async function() {
//       firstCoin = Market.getCryptoCurrencies()[0].code
//       secondCoin = Market.getCryptoCurrencies()[1].code

//       oldWalletFirst = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       oldWalletSecond = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       expect(oldWalletFirst).to.not.be.null
//       expect(oldWalletSecond).to.not.be.null
//     })

//     it('should increase available balance on deposit confirmed transaction', async function() {
//       const createDepositFirst: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 1.84,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositFirst_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.1,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 4.4,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.2,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const newWalletFirst: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       const newWalletSecond: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       expect(createDepositFirst).to.not.be.null
//       expect(createDepositFirst_1).to.not.be.null
//       expect(createDepositSecond).to.not.be.null
//       expect(createDepositSecond_1).to.not.be.null

//       if (
//         newWalletFirst &&
//         newWalletSecond &&
//         oldWalletFirst &&
//         oldWalletSecond
//       ) {
//         // as long as only the inserted values are available in db
//         expect(newWalletFirst.availableBalance).to.equal(1.94)
//         expect(newWalletSecond.availableBalance).to.equal(4.6)

//         // all other balance should remain same
//         expect(newWalletFirst.unconfirmedBalance).to.equal(0)
//         expect(newWalletFirst.blockedBalance).to.equal(0)
//         expect(newWalletSecond.unconfirmedBalance).to.equal(0)
//         expect(newWalletSecond.blockedBalance).to.equal(0)

//         await createDepositFirst.destroy()
//         await createDepositSecond.destroy()
//         await createDepositSecond_1.destroy()
//         await createDepositFirst_1.destroy()
//       }
//     })

//     it('should increase unconfirmed balance on deposit unconfirmed transaction', async function() {
//       const createDepositFirst: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 1.84,
//         confirmations: 0,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositFirst_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.1,
//         confirmations: 0,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 4.4,
//         confirmations: 0,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.2,
//         confirmations: 0,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const newWalletFirst: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       const newWalletSecond: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       expect(createDepositFirst).to.not.be.null
//       expect(createDepositFirst_1).to.not.be.null
//       expect(createDepositSecond).to.not.be.null
//       expect(createDepositSecond_1).to.not.be.null

//       if (
//         newWalletFirst &&
//         newWalletSecond &&
//         oldWalletFirst &&
//         oldWalletSecond
//       ) {
//         expect(newWalletFirst.unconfirmedBalance).to.equal(1.94)
//         expect(newWalletSecond.unconfirmedBalance).to.equal(4.6)

//         // all other balance should remain same
//         expect(newWalletFirst.availableBalance).to.equal(0)
//         expect(newWalletFirst.blockedBalance).to.equal(0)
//         expect(newWalletSecond.availableBalance).to.equal(0)
//         expect(newWalletSecond.blockedBalance).to.equal(0)

//         await createDepositFirst.destroy()
//         await createDepositFirst_1.destroy()
//         await createDepositSecond.destroy()
//         await createDepositSecond_1.destroy()
//       }
//     })

//     it('should update balance accordingly when some balance is blocked', async function() {
//       oldWalletFirst =
//         oldWalletFirst &&
//         (await oldWalletFirst.updateAttributes({ blockedBalance: 0.43 }))
//       oldWalletSecond =
//         oldWalletSecond &&
//         (await oldWalletSecond.updateAttributes({ blockedBalance: 0.343 }))

//       const createDepositFirst: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 1.84,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositFirst_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.1,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 4.4,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const createDepositSecond_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.2,
//         confirmations: 1,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const newWalletFirst: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       const newWalletSecond: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       expect(createDepositFirst).to.not.be.null
//       expect(createDepositFirst_1).to.not.be.null
//       expect(createDepositSecond).to.not.be.null
//       expect(createDepositSecond_1).to.not.be.null

//       if (
//         newWalletFirst &&
//         newWalletSecond &&
//         oldWalletFirst &&
//         oldWalletSecond
//       ) {
//         expect(newWalletFirst.availableBalance).to.equal(1.94 - 0.43)
//         expect(newWalletSecond.availableBalance).to.equal(4.6 - 0.343)

//         // all other balance should remain same
//         expect(newWalletFirst.blockedBalance).to.equal(0.43)
//         expect(newWalletFirst.unconfirmedBalance).to.equal(0)
//         expect(newWalletSecond.blockedBalance).to.equal(0.343)
//         expect(newWalletSecond.unconfirmedBalance).to.equal(0)

//         oldWalletFirst =
//           oldWalletFirst &&
//           (await oldWalletFirst.updateAttributes({ blockedBalance: 0.0 }))
//         oldWalletSecond =
//           oldWalletSecond &&
//           (await oldWalletSecond.updateAttributes({ blockedBalance: 0.0 }))
//         await createDepositFirst.destroy()
//         await createDepositFirst_1.destroy()
//         await createDepositSecond.destroy()
//         await createDepositSecond_1.destroy()
//       }
//     })

//     it('should decrease available balance on withdraw', async function() {
//       const createWithdrawFirst: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 1.84,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createWithdrawFirst_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'send',
//         amount: -0.1,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const createWithdrawSecond: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 4.4,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const createWithdrawSecond_1: Transaction | null = await Transaction.create<
//         Transaction
//       >({
//         userId: createdUser.id,
//         transactionType: 'send',
//         amount: -0.2,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: secondCoin,
//         receivedTime: new Date()
//       })
//       const newWalletFirst: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       const newWalletSecond: Wallets | null = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       expect(createWithdrawFirst).to.not.be.null
//       expect(createWithdrawFirst_1).to.not.be.null
//       expect(createWithdrawSecond).to.not.be.null
//       expect(createWithdrawSecond_1).to.not.be.null

//       if (
//         newWalletFirst &&
//         newWalletSecond &&
//         oldWalletFirst &&
//         oldWalletSecond
//       ) {
//         // as long as only the inserted values are available in db
//         console.log(JSON.stringify(newWalletFirst))
//         console.log(JSON.stringify(newWalletSecond))
//         expect(newWalletFirst.availableBalance).to.equal(1.74)
//         expect(newWalletSecond.availableBalance).to.equal(4.2)

//         // all other balance should remain same
//         expect(newWalletFirst.unconfirmedBalance).to.equal(0)
//         expect(newWalletFirst.blockedBalance).to.equal(0)
//         expect(newWalletSecond.unconfirmedBalance).to.equal(0)
//         expect(newWalletSecond.blockedBalance).to.equal(0)

//         await createWithdrawFirst.destroy()
//         await createWithdrawSecond.destroy()
//         await createWithdrawSecond_1.destroy()
//         await createWithdrawFirst_1.destroy()
//       }
//     })
//   })

//   describe('[Payments]', function() {
//     let firstCoin: string,
//       secondCoin: string,
//       oldWalletFirst: Wallets | null,
//       oldWalletSecond: Wallets | null
//     before(async function() {
//       firstCoin = Market.getCryptoCurrencies()[0].code
//       secondCoin = Market.getCryptoCurrencies()[1].code

//       oldWalletFirst = await Wallets.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       oldWalletSecond = await Wallets.findOne({
//         where: { currencyCode: secondCoin, userId: createdUser.id }
//       })
//       oldWalletFirst &&
//         oldWalletFirst.updateAttributes({
//           availableBalance: 0,
//           blockedBalance: 0
//         })
//       oldWalletSecond &&
//         oldWalletSecond.updateAttributes({
//           availableBalance: 0,
//           blockedBalance: 0
//         })

//       expect(oldWalletFirst).to.not.be.null
//       expect(oldWalletSecond).to.not.be.null
//     })

//     it('should throw insufficient balance on payment create', async function() {
//       let error = null
//       try {
//         await Transfer.newPayment(
//           createdUser.id,
//           Market.getCryptoCurrencies()[0].code,
//           1
//         )
//         expect.fail(
//           200,
//           TransferError.INSUFFICIENT_BALANCE,
//           'Payment did not throw insufficient balance'
//         )
//       } catch (e) {
//         error = e
//       }
//       expect(error instanceof TransferError)
//       error && expect(error.status === TransferError.INSUFFICIENT_BALANCE)
//     })

//     it('should update blocked balance on successful create payment', async function() {
//       const tx = await Transaction.create<Transaction>({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.32,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })

//       const p = await Transfer.newPayment(
//         createdUser.id,
//         Market.getCryptoCurrencies()[1].code,
//         0.1
//       )
//       const wallet =
//         oldWalletFirst && (await Wallets.findById(oldWalletFirst.id))
//       wallet && expect(wallet.blockedBalance).to.equal(0.1)
//       wallet && expect(wallet.availableBalance).to.equal(0.22)
//       if (p.paymentCode) {
//         const payment = await Transfer.getBySecret(p.paymentCode)
//         payment && (await payment.destroy())
//       }
//       wallet && (await wallet.updateAttributes({ blockedBalance: 0 }))
//       await tx.destroy()
//     })

//     it('should update balance on successful claim', async function() {
//       await Transaction.create<Transaction>({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.32,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })

//       const p = await Transfer.newPayment(createdUser.id, firstCoin, 0.1)
//       const claimantUser = await createUser()
//       p &&
//         p.paymentCode &&
//         (await Transfer.claimPayment(p.paymentCode, claimantUser.id))
//       const wallet1 = await Wallet.findOne({
//         where: { currencyCode: firstCoin, userId: createdUser.id }
//       })
//       const wallet2 = await Wallet.findOne({
//         where: { currencyCode: firstCoin, userId: claimantUser.id }
//       })

//       wallet1 && expect(wallet1.availableBalance).to.equal(0.22)
//       wallet1 && expect(wallet1.blockedBalance).to.equal(0)
//       wallet2 && expect(wallet2.availableBalance).to.equal(0.1)

//       const payment = await Transfer.findOne({
//         where: { userId: createdUser.id }
//       })

//       await Transaction.destroy({
//         where: { userId: [claimantUser.id, createdUser.id] }
//       })
//       payment && (await payment.destroy())
//       for (let i = 0; i < claimantUser.wallets.length; i++) {
//         await claimantUser.wallets[i].destroy()
//       }
//       await claimantUser.telegramUser.destroy()
//       await claimantUser.destroy()
//     })

//     it('should show invalid on already claimed payment', async function() {
//       const claimantUser = await createUser()
//       let error = null
//       try {
//         await Transaction.create<Transaction>({
//           userId: createdUser.id,
//           transactionType: 'receive',
//           amount: 0.32,
//           confirmations: 2,
//           transactionId: Math.floor(Math.random() * 10000000) + '',
//           transactionSource: 'test',
//           currencyCode: firstCoin,
//           receivedTime: new Date()
//         })
//         const p = await Transfer.newPayment(createdUser.id, firstCoin, 0.1)

//         p &&
//           p.paymentCode &&
//           (await Transfer.claimPayment(p.paymentCode, claimantUser.id))
//         p &&
//           p.paymentCode &&
//           (await Transfer.claimPayment(p.paymentCode, claimantUser.id))
//       } catch (e) {
//         error = e
//       }
//       expect(error instanceof TransferError)
//       error && expect(error.status).equal(TransferError.CLAIMED)

//       await Transaction.destroy({
//         where: { userId: [claimantUser.id, createdUser.id] }
//       })
//       await Transfer.destroy({ where: { userId: createdUser.id } })
//       for (let i = 0; i < claimantUser.wallets.length; i++) {
//         await claimantUser.wallets[i].destroy()
//       }
//       await claimantUser.telegramUser.destroy()
//       await claimantUser.destroy()
//     })

//     it('should return self payment on self payment claim', async function() {
//       let error = null
//       try {
//         await Transaction.create<Transaction>({
//           userId: createdUser.id,
//           transactionType: 'receive',
//           amount: 0.32,
//           confirmations: 2,
//           transactionId: Math.floor(Math.random() * 10000000) + '',
//           transactionSource: 'test',
//           currencyCode: firstCoin,
//           receivedTime: new Date()
//         })
//         const p = await Transfer.newPayment(createdUser.id, firstCoin, 0.1)
//         p.paymentCode &&
//           (await Transfer.claimPayment(p.paymentCode, createdUser.id))
//       } catch (e) {
//         error = e
//       }
//       expect(error instanceof TransferError)
//       error && expect(error.status).equal(TransferError.SELF_CLAIM)

//       const payment = await Transfer.findOne({
//         where: { userId: createdUser.id }
//       })
//       payment && (await payment.destroy())
//       oldWalletFirst &&
//         Wallet.update(
//           { blockedBalance: 0 },
//           { where: { id: oldWalletFirst.id } }
//         )
//       await Transaction.destroy({ where: { userId: [createdUser.id] } })
//     })

//     it('should unblock payment on expiry', async function() {
//       const timeout = function(ms: number) {
//         return new Promise((resolve) => setTimeout(resolve, ms))
//       }

//       const tx = await Transaction.create<Transaction>({
//         userId: createdUser.id,
//         transactionType: 'receive',
//         amount: 0.32,
//         confirmations: 2,
//         transactionId: Math.floor(Math.random() * 10000000) + '',
//         transactionSource: 'test',
//         currencyCode: firstCoin,
//         receivedTime: new Date()
//       })
//       const p = await Transfer.newPayment(createdUser.id, firstCoin, 0.1)
//       await timeout(6000)
//       if (p.paymentCode) {
//         const payment = await Transfer.getBySecret(p.paymentCode)
//         console.log('EXPIRED... ' + JSON.stringify(payment))
//         expect(payment).to.be.null
//         const wallet =
//           oldWalletFirst &&
//           (await Wallet.findOne({ where: { id: oldWalletFirst.id } }))
//         expect(wallet).to.not.be.null
//         console.log('WB: ----' + JSON.stringify(wallet))
//         wallet && expect(wallet.blockedBalance).equal(0)
//       }
//       await Transfer.destroy({ where: { userId: createdUser.id } })
//       await tx.destroy()
//     })

//     it('should throw exceeded invalid tries for claim', async function() {
//       expect.fail(null, null, 'TODO: Incomplete test case')
//     })
//   })
// })
