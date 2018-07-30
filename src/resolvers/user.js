import 'dotenv/config';
import bcrypt from 'bcrypt';
import generateToken from '../lib/generateToken';

export default {
  Query: {
    async me(_, args, { models, user }) {
      if (!user) {
        throw new Error('You are not authenticated');
      }

      return models.User.findById(user.id);
    },
  },
  Mutation: {
    async signup(_, { username, email, password }, { models }) {
      const user = await models.User.create({
        username,
        email,
        password: await bcrypt.hash(password, 10),
      });

      return generateToken(user);
    },
    async login(_, { email, password }, { models }) {
      const user = await models.User.findOne({ where: { email } });

      if (!user) {
        throw new Error('No user with that email');
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error('Incorrect password');
      }

      return generateToken(user);
    },
  },
};
