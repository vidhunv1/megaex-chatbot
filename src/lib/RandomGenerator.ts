const random = require('crypto').randomBytes
export default class RandomGenerator {
  constructor() {}

  // This id generation might not always yield unique values. Check uniqueness manually
  async generateId(): Promise<string> {
    return this.generateRandom(7, '23456789abcdefghjklmnpqrstuvwxyz')
  }

  async generatePaymentCode(): Promise<string> {
    return this.generateRandom(
      10,
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    )
  }

  async generateTransactionId(): Promise<string> {
    return this.generateRandom(
      32,
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    )
  }

  generateRandom(size: number, alphabet: string) {
    const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
    const step = Math.ceil((1.6 * mask * size) / alphabet.length)

    let id = ''
    while (true) {
      const bytes = random(step)
      for (let i = 0; i < step; i++) {
        const byte = bytes[i] & mask
        if (alphabet[byte]) {
          id += alphabet[byte]
          if (id.length === size) return id
        }
      }
    }
  }
}
