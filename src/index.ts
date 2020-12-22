import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import path from "path";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import DB from "./db";
import schema from "./schema";
import { rootValue } from "./resolvers";

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const main = async (): Promise<void> => {
  const db = new DB({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "test",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
  });

  await db.runQuery(
    `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    last_login TIMESTAMP NOT NULL
  )`,
    []
  );

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: "localhost",
    port: 6380,
  });
  redisClient.on("connect", () => {
    console.log("Redis server is listening at localhost:6380");
  });

  const app = express();

  app.use(
    session({
      name: "userId",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 3600 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      secret: "hahahaha",
      saveUninitialized: false,
      resave: false,
    })
  );

  app.use(
    "/graphql",
    graphqlHTTP((req, res) => ({
      schema,
      rootValue,
      graphiql: true,
      context: { db, req, res },
    }))
  );

  app.get("/", (_, res) => {
    res.json({ status: "success" });
  });

  app.listen(8000, () => {
    console.log(
      "server is listening at http://localhost:8000. Check it outtttttt!"
    );
  });
};

main();
