const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')


loginRouter.post('/', async (req, res, next) => {
	const { username, password } = req.body

	try{
		const user = await User.findOne({ username })

		const passwordIsCorrect = user === null ? false 
			: await bcrypt.compare(password, user.passwordHash) 

		if(!(user && passwordIsCorrect)){
			return res.status(401).json({ error: 'invalid user or password' })
		}

		const userForToken = {
			username: user.username,
			id: user._id
		}

		const token = jwt.sign(userForToken, process.env.SECRET)

		res.status(200).send({token, username: user.username, name: user.name})
	}catch(error){
		next(error)
	}
})

module.exports = loginRouter