const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	try{
		const blogs = await Blog.find({})
		response.json(blogs)
	}catch (error){
		next(error)
	}
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)

	if(!blog.title || !blog.url){
		return response.status(400).json({
			error: 'title or url missing from request'
		})
	}

	if(!blog.likes){
		blog.likes = 0
	}

	try{
		const savedBlog = await blog.save()
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

blogsRouter.delete('/:id', async (request, response, next) => {
	try{
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	}catch(error){
		next(error)
	}
})

blogsRouter.put('/:id', async (request, response, next) => {
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
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
		response.status(200).json(updatedBlog)
	}catch(error){
		next(error)
	}
})


module.exports = blogsRouter