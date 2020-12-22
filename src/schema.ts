import { buildSchema } from "graphql";

const schema = buildSchema(`
  type User {
    id: ID!
    username: String
    password: String
    createdAt: String
    lastLogin: String
    name(id: String): String
  }

  type Query {
    getUser: User
    getUsers: [User]
    hello: String
  }

  type Mutation {
    register(username: String, password: String): User
    login(username: String, password: String): User
    changeRole(username: String, isAdmin: Boolean): Boolean
  }
`);

export default schema;
