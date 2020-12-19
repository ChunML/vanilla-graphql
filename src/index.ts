import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import path from "path";
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
    created_at TIMESTAMP NOT NULL,
    last_login TIMESTAMP NOT NULL
  )`,
    []
  );

  const app = express();

  app.use(
    "/graphql",
    graphqlHTTP({
      schema,
      rootValue,
      graphiql: true,
      context: { db },
    })
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
