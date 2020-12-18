import express from "express";
import { graphqlHTTP } from "express-graphql";
import DB from "./db";
import schema from "./schema";
import { rootValue } from "./resolvers";

const main = (): void => {
  const app = express();

  const db = new DB({});

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
