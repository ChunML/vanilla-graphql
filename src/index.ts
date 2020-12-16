import express from "express";
import argon2 from "argon2";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const schema = buildSchema(`
  input UsernamePasswordInput {
    username: String
    password: String
  }

  type User {
    id: ID!
    username: String
    password: String
    createdAt: String
    lastLogin: String
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }

  type Mutation {
    register(username: String, password: String): User
    login(username: String, password: String): User
  }
`);

class User {
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

const database: { [id: string]: User } = {};
// database["1"] = new User({
//   id: "1",
//   username: "chun",
//   password: "chun",
//   createdAt: new Date(),
//   lastLogin: new Date(),
// });
// database["2"] = new User({
//   id: "2",
//   username: "trung",
//   password: "trung",
//   createdAt: new Date(),
//   lastLogin: new Date(),
// });

const main = (): void => {
  const app = express();

  app.use(
    "/graphql",
    graphqlHTTP({
      schema,
      rootValue: {
        getUser: ({ id }: { id: string }): User | null => {
          const userIds = Object.keys(database).filter((_id) => _id === id);
          if (userIds.length === 0) {
            return null;
          }
          const userId = userIds[0];
          return database[userId];
        },
        getUsers: (): User[] => Object.keys(database).map((id) => database[id]),
        login: async ({
          username,
          password,
        }: {
          username: string;
          password: string;
        }): Promise<User | null> => {
          const userIds = Object.keys(database).filter(
            (id) => database[id].username === username
          );
          if (userIds.length === 0) {
            return null;
          }
          const user = database[userIds[0]];

          const isPasswordValid = await argon2.verify(user.password, password);
          if (!isPasswordValid) {
            return null;
          }

          user.lastLogin = new Date();
          return user;
        },
        async register({
          username,
          password,
        }: {
          username: string;
          password: string;
        }): Promise<User | null> {
          const isValid =
            Object.values(database).filter((user) => user.username === username)
              .length === 0;
          if (!isValid) {
            return null;
          }
          const newId = (Object.keys(database).length + 1).toString();
          const hashedPassword = await argon2.hash(password);
          const user = new User({
            id: newId,
            username,
            password: hashedPassword,
            createdAt: new Date(),
            lastLogin: new Date(),
          });
          database[newId] = user;

          return user;
        },
      },
      graphiql: true,
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
