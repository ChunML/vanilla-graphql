import argon2 from "argon2";
import { MyContext, User, UserInput } from "./types";

// eslint-disable-next-line import/prefer-default-export
export const rootValue = {
  getUser: async (_args: null, context: MyContext): Promise<User | null> => {
    if (!context.req.session.userId) {
      return null;
    }

    const result = await context.db.findOne("users", {
      id: context.req.session.userId,
    });
    if (result.rowCount === 0) {
      return null;
    }
    const user = new User({
      id: result.rows[0].id,
      username: result.rows[0].username,
      password: result.rows[0].password,
      createdAt: result.rows[0].created_at,
      lastLogin: result.rows[0].last_login,
    });
    return user;
  },
  getUsers: async (_args: null, context: MyContext): Promise<User[] | null> => {
    if (!context.req.session.userId) {
      return null;
    }

    const result = await context.db.findAll("users");

    const isAdmin = result.rows.filter(
      (row) => row.id === context.req.session.userId
    )[0].is_admin;

    if (isAdmin) {
      return result.rows.map(
        (row) =>
          new User({
            id: row.id,
            username: row.username,
            password: row.password,
            createdAt: row.created_at,
            lastLogin: row.last_login,
          })
      );
    }

    return null;
  },
  login: async (input: UserInput, context: MyContext): Promise<User | null> => {
    const { username, password } = input;
    const usersWithThatUsername = await context.db.findOne("users", {
      username,
    });
    if (usersWithThatUsername.rowCount === 0) {
      return null;
    }
    const row = usersWithThatUsername.rows[0];
    const user = new User({
      id: row.id,
      username: row.username,
      password: row.password,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    });

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    user.lastLogin = new Date();

    await context.db.update(
      "users",
      { last_login: user.lastLogin },
      { username }
    );

    context.req.session.userId = user.id;

    return user;
  },
  register: async (
    input: UserInput,
    context: MyContext
  ): Promise<User | null> => {
    const { username, password } = input;
    const usersWithThatUsername = await context.db.findOne("users", {
      username,
    });
    if (usersWithThatUsername.rowCount > 0) {
      return null;
    }

    const hashedPassword = await argon2.hash(password);
    const result = await context.db.insert("users", {
      username,
      password: hashedPassword,
      created_at: new Date(),
      last_login: new Date(),
    });

    const row = result.rows[0];
    const user = new User({
      id: row.id,
      username: row.username,
      password: row.password,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    });

    context.req.session.userId = user.id;

    return user;
  },
  changeRole: async (
    args: { username: string; isAdmin: boolean },
    context: MyContext
  ): Promise<boolean> => {
    if (!context.req.session.userId) {
      return false;
    }

    const result = await context.db.findOne("users", {
      id: context.req.session.userId,
    });

    if (result.rowCount === 0 || !result.rows[0].is_admin) {
      return false;
    }

    await context.db.update(
      "users",
      { is_admin: args.isAdmin },
      { username: args.username }
    );

    return true;
  },
};
