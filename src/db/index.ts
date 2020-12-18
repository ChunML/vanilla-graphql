import argon2 from "argon2";
import { User } from "../types";

export default class DB {
  database: { [id: string]: User };

  constructor(database: { [id: string]: User }) {
    this.database = database;
  }

  findOne(id: string): User | null {
    const userIds = Object.keys(this.database).filter((_id) => _id === id);
    if (userIds.length === 0) {
      return null;
    }
    const userId = userIds[0];
    return this.database[userId];
  }

  findAll(): User[] {
    return Object.keys(this.database).map((id) => this.database[id]);
  }

  async insert(input: {
    username: string;
    password: string;
  }): Promise<User | null> {
    const { username, password } = input;
    const isValid =
      Object.values(this.database).filter((user) => user.username === username)
        .length === 0;
    if (!isValid) {
      return null;
    }
    const newId = (Object.keys(this.database).length + 1).toString();
    const hashedPassword = await argon2.hash(password);
    const user = new User({
      id: newId,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
    });
    this.database[newId] = user;

    return user;
  }

  async update(input: {
    username: string;
    password: string;
  }): Promise<User | null> {
    const { username, password } = input;
    const userIds = Object.keys(this.database).filter(
      (id) => this.database[id].username === username
    );
    if (userIds.length === 0) {
      return null;
    }
    const user = this.database[userIds[0]];

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    user.lastLogin = new Date();
    return user;
  }
}
