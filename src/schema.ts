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
    name(id: String): String
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    hello: String
  }

  type Mutation {
    register(username: String, password: String): User
    login(username: String, password: String): User
  }
`);

export default schema;
