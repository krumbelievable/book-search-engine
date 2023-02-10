const jwt = require('jsonwebtoken');

// gives the user a token and a session experation time
const secret = 'superdupersecret';
const expiration = '3h';

// funciton that govers authentication
module.exports = {
	// lets tokens be sent via headers
	authMiddleware: function ({ req }) {
		let token = req.query.token || req.headers.authorization;

		if (req.headers.authorization) {
			token = token.split(' ').pop().trim();
		}

		if (!token) {
			return req;
		}

		// verfies the token and parsers user data
		try {
			const { data } = jwt.verify(token, secret, { maxAge: expiration });
			req.user = data;
		} catch {
			console.log('Token Invalid');
		}

		//after authorizing will allow movement ot next end point
		return req;
	},
	signToken: function ({ username, email, _id }) {
		const payload = { username, email, _id };

		return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
	},
};
