const mongoose = require('mongoose');

// allows calling of google books api
mongoose.connect(
	process.env.MONGODB_URI || 'mongodb://localhost:27017/googlebooks',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

module.exports = mongoose.connection;
