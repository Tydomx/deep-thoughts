// importing Thought/User models
const { User, Thought } = require('../models');

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
		}
	}
};

module.exports = resolvers;