// importing Thought/User models
const { User, Thought } = require('../models');
// import authentication
const { AuthenticationError } = require('apollo-server-express');
// importing signToken() function
const { signToken } = require('../utils/auth');

const resolvers = {
	Query: {
		// query thoughts, perform a find() method on Thought model, returning thought data in descending order
		thoughts: async (parent, { username }) => {
			const params = username ? { username } : {};
			return Thought.find(params).sort({ createdAt: -1 });
		},
		// finding a single thought
		thought: async (parent, { _id }) => {
			return Thought.findOne({ _id });
		},
		// get all users
		users: async () => {
			return User.find()
				.select('-__v -password')
				.populate('friends')
				.populate('thoughts');
		},
		// get a user by username
		user: async (parent, { username }) => {
			return User.findOne({ username })
				.select('-__v -password')
				.populate('friends')
				.populate('thoughts');
		},
		// me method
		me: async (parent, args, context) => {
			// if no context.user prop exists, then user isn't auth and throw authError
			if (context.user) {
				const userData = await User.findOne({})
					.select('-__v -password')
					.populate('thoughts')
					.populate('friends');

				return userData;
			}
			throw new AuthenticationError('Not logged in');
		}
	},
	// new mutation property
	Mutation: {
		addUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(user);

			return { token, user };
		},
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError('Incorrect credentials');
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError('Incorrect credentials');
			}

			const token = signToken(user);

			return { token, user };
		},
		// only logged in users should be able to use this mutation
		addThought: async (parent, args, context) => {
			if (context.user) {
				const thought = await Thought.create({ ...args, username: context.user.username });

				await User.findByIdAndUpdate(
					{ _id: context.user._id },
					{ $push: { thoughts: thought._id } },
					{ new: true }
				);

				return thought;
			}

			throw new AuthenticationError('You need to be logged in!');
		},
		addReaction: async (parent, { thoughtId, reactionBody }, context) => {
			if (context.user) {
				const updatedThought = await Thought.findOneAndUpdate(
					{ _id: thoughtId },
					{ $push: { reactions: { reactionBody, username: context.user.username } } },
					{ new: true, runValidators: true }
				);

				return updatedThought;
			}

			throw new AuthenticationError('You need to be logged in to see reactions!');
		},
		addFriend: async (parent, { friendId }, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					// this is to prevent duplicate entries bc user can't be friends with same person twice
					{ $addToSet: { friends: friendId } },
					{ new: true }
				).populate('friends');

				return updatedUser;
			}

			throw new AuthenticationError('You need to be logged in to add a friend!');
		}
	}
};

module.exports = resolvers;