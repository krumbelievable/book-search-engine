const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
	// qlogic for ueries from the typedefs
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				const userData = await User.findOne({ _id: context.user._id }).select(
					'-__v -password'
				);
				return userData;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
	},

	// logic for the mutations from the typedefs
	Mutation: {
		addUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(user);
			return { token, user };
		},
		// login logic
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError('No valid user with this email found!');
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError('Password incorrect!');
			}

			const token = signToken(user);
			return { token, user };
		},

		// Third argument allows context to be read
		saveBook: async (parent, { bookData }, context) => {
			// IF context has a user property this means they are authorized
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{
						$push: { savedBooks: bookData },
					},
					{
						new: true,
					}
				);
				return updatedUser;
			}
			// IF authorization fails an error is thrown
			throw new AuthenticationError('You must be logged in to save a book!');
		},
		// context is used the same here as well
		removeBook: async (parent, { bookId }, context) => {
			if (context.user) {
				const updatedUser = User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { bookId } } },
					{ new: true }
				);
				return updatedUser;
			}
			throw new AuthenticationError(
				'You need to be logged in to remove a book!'
			);
		},
	},
};

module.exports = resolvers;
