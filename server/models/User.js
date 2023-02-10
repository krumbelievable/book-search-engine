const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// grabs the book schema to be used for the userschema
const bookSchema = require('./Book');

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: [/.+@.+\..+/, 'Must use a valid email address'],
		},
		password: {
			type: String,
			required: true,
		},
		// all saved book are saved as an array using the bookshcema
		savedBooks: [bookSchema],
	},
	// vitruals need to be set to true for the above to work
	{
		toJSON: {
			virtuals: true,
		},
	}
);

// hashes the user password
userSchema.pre('save', async function (next) {
	if (this.isNew || this.isModified('password')) {
		const saltRounds = 10;
		this.password = await bcrypt.hash(this.password, saltRounds);
	}

	next();
});

// custom method that checks for user password and our hased version to be the same
userSchema.methods.isCorrectPassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

// shows number of saved books on user query
userSchema.virtual('bookCount').get(function () {
	return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
