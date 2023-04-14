const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  // Blog
  //   .find({})
  //   .then(blogs => {
  //     response.json(blogs)
  //   })
	try{
		const blogs = await Blog.find({})
		response.json(blogs)
	}catch (error){
		console.log(error)
	}
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // blog
  //   .save()
  //   .then(result => {
  //     response.status(201).json(result)
  //   })
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
		console.log(error)
	}
})

module.exports = blogsRouter