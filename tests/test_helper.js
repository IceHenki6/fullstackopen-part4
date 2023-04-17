const Blog = require('../models/blog')

const blogPosts = [
	{
    "title": "Refactoring an application into separate modules 101",
    "author": "LordJs",
    "url": "randomurl",
    "likes": 100
	},
	{
    "title": "Just a random post name for testing purposes",
    "author": "LordRandom",
    "url": "randomurl",
    "likes": 24
	}
]

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}

module.exports = {
	blogPosts,
	blogsInDb
}