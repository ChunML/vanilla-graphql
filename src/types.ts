import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import DB from "./db";

// eslint-disable-next-line import/prefer-default-export
export class User {
  id: string;

  username: string;

  password: string;

  createdAt: Date;

  lastLogin: Date;

  constructor({ id, username, password, createdAt, lastLogin }: User) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
  }
}

export interface MyContext {
  db: DB;
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: string };
  };
  res: Response;
}

export interface UserInput {
  username: string;
  password: string;
}

export interface DBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}
