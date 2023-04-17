const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const testHelper = require('./test_helper')
const api = supertest(app)



beforeEach(async () => {
	await Blog.deleteMany({})
	let blogObj = new Blog(testHelper.blogPosts[0])
	await blogObj.save()
	blogObj = new Blog(testHelper.blogPosts[1])
	await blogObj.save()
})

describe('getting all posts from db', () => {
	test('the right amount of blogs are returned in JSON format', async () => {
		await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
		const response = await api.get('/api/blogs')
		expect(response.body).toHaveLength(testHelper.blogPosts.length)
	})

	test('The unique identifier property of blogs is id', async () => {
		const blogs = await testHelper.blogsInDb()
	
		blogs.forEach(blog => {
			expect(blog.id).toBeDefined()
		})
	})
})


describe('creation of a new blog post', () => {
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
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length + 1)
	
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
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length + 1)
	
		blogsAfterPost.forEach(blog => {
			expect(blog.likes).toBeDefined()
		})
	})
	
	test('If title or url are missing from the request, the backend responds with 400 bad request', 
	async () => {
		const newBlog = {
			"author": "Randomnia",
		}
	
		await api.post('/api/blogs').send(newBlog)
			.expect(400)
	
		const blogsAfterPost = await testHelper.blogsInDb()
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length)
	})
})

describe('succesfully deleting blog posts', () => {
	test('correctly deletes a blog post', async () => {
		const blogs = await testHelper.blogsInDb()
		const blogToDelete = blogs[0]
		await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

		const blogsAfterDelete = await testHelper.blogsInDb()
		expect(blogsAfterDelete).toHaveLength(testHelper.blogPosts.length - 1)

		const blogsIds = blogsAfterDelete.map(blog => blog.id)

		expect(blogsIds).not.toContain(blogToDelete.id)
	})

	test('responds with 400 bad request if id is invalid', async () => {
		const invalidId = '1234'

		await api.delete(`/api/blogs/${invalidId}`).expect(400)

		const blogsAtEnd = await testHelper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(testHelper.blogPosts.length)
	})
})

describe('updating blog posts', () => {
	test('PUT request succesfully updates a blog post', async () => {
		const blogs = await testHelper.blogsInDb()
		const blogToEdit = blogs[0]
		blogToEdit.title = 'Edited Blog'
		blogToEdit.url = 'anotherurl'

		await api.put(`/api/blogs/${blogToEdit.id}`).send(blogToEdit).expect(200)

		const blogsAfterUpdate = await testHelper.blogsInDb()

		const urls = blogsAfterUpdate.map(blog => blog.url)

		expect(urls).toContain(blogToEdit.url)
	})

	test('Responds with 400 bad request if the url or the title are removed on the request', async () => {
		const blogs = await testHelper.blogsInDb()
		const blogToEdit = blogs[0]
		blogToEdit.title = ''
		blogToEdit.url = ''

		await api.put(`/api/blogs/${blogToEdit.id}`).send(blogToEdit).expect(400)

		const blogsAfterUpdate = await testHelper.blogsInDb()

		const urls = blogsAfterUpdate.map(blog => blog.url)

		expect(urls).not.toContain(blogToEdit.url)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})