const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (request, response) => {
	try{
		const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
		response.json(blogs)
	}catch (error){
		next(error)
	}
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const blog = new Blog(request.body)

	if(!blog.likes){
		blog.likes = 0
	}

	if(!request.token){
		return response.status(401).json({ error: 'no token provided' })
	}

	try{
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if(!decodedToken.id) {
			return response.status(401).json({ error: 'invalid token' })
		}

		const user = request.user
		blog.user = user.id

		const savedBlog = await blog.save()

		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		response.status(201).json(savedBlog)
	}catch(error){
		next(error)
	}

})

blogsRouter.get('/:id', async (request, response, next) => {
	try{
		const blog = await Blog.findById(request.params.id)
		if(blog){
			response.json(blog)
		}else{
			response.status(404).end()
		}	
	}catch(error){
		next(error)
	}
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
	try{
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		const blog = await Blog.findById(request.params.id)

		if(!blog){
			return response.status(400).json({ error: 'invalid id' })
		}

		if(!(decodedToken.id && (decodedToken.id === blog.user.toString()))){
			return response.status(401).json({ error: 'invalid token' })
		}
		
		await Blog.findByIdAndRemove(request.params.id)

		const user = request.user

		user.blogs = user.blogs.filter(blog => blog != request.params.id)
		await user.save()
		response.status(204).end()
	}catch(error){
		next(error)
	}
})

blogsRouter.put('/:id', userExtractor, async (request, response, next) => {
	const blogBody = request.body

	const blog = {
		title: blogBody.title,
		author: blogBody.author,
		url: blogBody.url,
		likes: blogBody.likes
	}

	if(!blog.title || !blog.url){
		return response.status(400).json({
			error: 'title or url missing from request'
		})
	}
	
	try{
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		const blogToUpdate = await Blog.findById(request.params.id)
		if(!(decodedToken.id && (decodedToken.id === blogToUpdate.user.toString()))){
			return response.status(401).json({ error: 'invalid token' })
		}

		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

		response.status(200).json(updatedBlog)
	}catch(error){
		next(error)
	}
})


module.exports = blogsRouter