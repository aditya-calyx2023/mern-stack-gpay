import mockDb from '../db/mockDb.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this._id = userData._id;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }

  static async findOne(query) {
    const user = await mockDb.findUser(query);
    return user ? new User(user) : null;
  }

  static async findById(id) {
    const user = await mockDb.findUser({ _id: id });
    return user ? new User(user) : null;
  }

  async save() {
    // Hash password before saving
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const savedUser = await mockDb.createUser({
      name: this.name,
      email: this.email,
      password: this.password
    });

    // Update this instance with the saved data
    Object.assign(this, savedUser);
    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  static async updateOne(query, updateData) {
    const user = await this.findOne(query);
    if (!user) return null;
    
    const updatedUser = await mockDb.updateUser(user._id, updateData);
    return new User(updatedUser);
  }
}

export default User;