import { MyContext, User, UserInput } from "./types";

// eslint-disable-next-line import/prefer-default-export
export const rootValue = {
  getUser: ({ id }: { id: string }, context: MyContext): User | null =>
    context.db.findOne(id),
  getUsers: (_args: null, context: MyContext): User[] => context.db.findAll(),
  login: async (input: UserInput, context: MyContext): Promise<User | null> =>
    context.db.update(input),
  register: async (
    input: UserInput,
    context: MyContext
  ): Promise<User | null> => context.db.insert(input),
};
