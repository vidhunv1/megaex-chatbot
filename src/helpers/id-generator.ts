import User from '../models/user'
const ShortId = require('shortid32');
export default class IdGenerator {
  idLength: number
  constructor() {
    this.idLength = 7;
    ShortId.seed(19223123);
  }

  // This id generation might not always yield unique values. Check uniqueness manually
  async generateId(): Promise<string> {
    let sid, start, id, user = null;
      sid = ShortId.generate();
      start = Math.floor(Math.random() * (sid.length - this.idLength)) + 0
      id = sid.substr(start, this.idLength)
    return id;
  }
}