const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const testHelper = require('./test_helper')
const api = supertest(app)

const blogPosts = [
	{
    "title": "Refactoring an application into separate modules 101",
    "author": "LordJs",
    "url": "randomurl",
    "likes": 1000
	},
	{
    "title": "Just a random post name for testing purposes",
    "author": "LordRandom",
    "url": "randomurl",
    "likes": 24
	}
]

beforeEach(async () => {
	await Blog.deleteMany({})
	let blogObj = new Blog(blogPosts[0])
	await blogObj.save()
	blogObj = new Blog(blogPosts[1])
	await blogObj.save()
})

test('the right amount of blogs are returned in JSON format', async () => {
	await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
	const response = await api.get('/api/blogs')
	expect(response.body).toHaveLength(blogPosts.length)
})

//expect(post.id).toBeDefined()
test('The unique identifier property of blogs is id', async () => {
	const blogs = await testHelper.blogsInDb()

	blogs.forEach(blog => {
		expect(blog.id).toBeDefined()
	})
})

test('POST request succesfully creates a new blog post', async () => {
	const newBlog = {
		"title": "Another random blog",
    "author": "Randomnia",
    "url": "randomurl",
    "likes": 2
	}

	await api.post('/api/blogs').send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAfterPost = await testHelper.blogsInDb()
	expect(blogsAfterPost).toHaveLength(blogPosts.length + 1)

	const titles = blogsAfterPost.map(blog => blog.title)
	expect(titles).toContain('Another random blog')
})

test('If the like property is missing from the request, it will default to value 0', async () => {
	const newBlog = {
		"title": "Another random blog",
    "author": "Randomnia",
    "url": "randomurl",
	}

	await api.post('/api/blogs').send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAfterPost = await testHelper.blogsInDb()
	expect(blogsAfterPost).toHaveLength(blogPosts.length + 1)

	blogsAfterPost.forEach(blog => {
		expect(blog.likes).toBeDefined()
	})
})

test('If title or url are missing from the request, the backend responds with 400 bad request', async () => {
	const newBlog = {
    "author": "Randomnia",
	}

	await api.post('/api/blogs').send(newBlog)
		.expect(400)

	const blogsAfterPost = await testHelper.blogsInDb()
	expect(blogsAfterPost).toHaveLength(blogPosts.length)
})


afterAll(async () => {
	await mongoose.connection.close()
})