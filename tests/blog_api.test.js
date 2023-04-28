const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const testHelper = require('./test_helper')
const api = supertest(app)



beforeEach(async () => {
	await User.deleteMany({})
	const passwordHash = await bcrypt.hash('secretito', 10)
	const user = new User({ username:'root', name:'Kimi', passwordHash })
	

	await Blog.deleteMany({})
	
	//The first blog belongs to the first user
	const firstBlog = new Blog(testHelper.blogPosts[0])
	firstBlog.user = user.id
	user.blogs = user.blogs.concat(firstBlog)
	await user.save()
	await firstBlog.save()

	const secondBlog = new Blog(testHelper.blogPosts[1])
	await secondBlog.save()
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
		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		const newBlog = {
			"title": "Another random blog",
			"author": "Randomnia",
			"url": "randomurl",
			"likes": 2,
		}
	
		await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)
	
		const blogsAfterPost = await testHelper.blogsInDb()
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length + 1)
	
		const titles = blogsAfterPost.map(blog => blog.title)
		expect(titles).toContain('Another random blog')
	})
	
	test('If the like property is missing from the request, it will default to value 0', async () => {
		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		const newBlog = {
			"title": "Another random blog",
			"author": "Randomnia",
			"url": "randomurl",
		}
	
		await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)
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
		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		const newBlog = {
			"author": "Randomnia",
		}
	
		await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)
			.expect(400)
	
		const blogsAfterPost = await testHelper.blogsInDb()
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length)
	})

	test("If the user is not authenticated, the backend responds with status 401", async () => {

		const token = ''

		const newBlog = {
			"title": "Another random blog",
			"author": "Randomnia",
			"url": "randomurl",
			"likes": 2,
		}
	
		await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)
			.expect(401)

	
		const blogsAfterPost = await testHelper.blogsInDb()
		expect(blogsAfterPost).toHaveLength(testHelper.blogPosts.length)
	
		const titles = blogsAfterPost.map(blog => blog.title)
		expect(titles).not.toContain('Another random blog')
	})
})

describe('succesfully deleting blog posts', () => {
	test('correctly deletes a blog post', async () => {
		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		const blogs = await testHelper.blogsInDb()
		const blogToDelete = blogs[0]

		await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)

		const blogsAfterDelete = await testHelper.blogsInDb()
		expect(blogsAfterDelete).toHaveLength(testHelper.blogPosts.length - 1)

		const blogsIds = blogsAfterDelete.map(blog => blog.id)

		expect(blogsIds).not.toContain(blogToDelete.id)
	})

	test('responds with 400 bad request if id is invalid', async () => {
		const invalidId = '1234'

		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		await api.delete(`/api/blogs/${invalidId}`).set('Authorization', `Bearer ${token}`).expect(400)

		const blogsAtEnd = await testHelper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(testHelper.blogPosts.length)
	})
})

describe('updating blog posts', () => {
	test('PUT request succesfully updates a blog post', async () => {
		const blogs = await testHelper.blogsInDb()
		const blogToEdit = blogs[0]

		const users = await testHelper.usersInDb()
		const user = users[0]

		const userForToken = {
			username: user.username,
			id: user.id
		}
		const token = jwt.sign(userForToken, process.env.SECRET)

		blogToEdit.title = 'Edited Blog'
		blogToEdit.url = 'anotherurl'

		await api.put(`/api/blogs/${blogToEdit.id}`).set('Authorization', `Bearer ${token}`).send(blogToEdit).expect(200)

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

describe('when there is initially one user in db', () => {
	test('creation succeeds with a new username', async () => {
		const usersAtStart = await testHelper.usersInDb()

		const newUser = {
			username: 'iceman',
			name: 'Kimi Raikkonen',
			password: 'iloveracing07'
		}

		await api.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		
		const usersAtEnd = await testHelper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(user => user.username)

		expect(usernames).toContain(newUser.username)
	})

	test('creation of a new user fails with status 400 if the username is already in db', async () => {
		const usersAtStart = await testHelper.usersInDb()
		
		const newUser = {
			username: 'root',
			name: 'Mika Hakkinen',
			password: 'FlyingFinn9899'
		}

		const result = await api.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('expected `username` to be unique')

		const usersAtEnd = await testHelper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('creation of user fails if no password is provided', async () => {
		const usersAtStart = await testHelper.usersInDb()
		
		const newUser = {
			username: 'IWasFasterThanLoeb',
			name: 'Miko Hirvonen',
			password: ''
		}

		const result = await api.post('/api/users').send(newUser)
			.expect(400)

		expect(result.body.error).toContain('a password is required, and must be more than 3 characters long')

		const usersAtEnd = await testHelper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)		
	})

	test('creation of user fails if no username is provided', async () => {
		const usersAtStart = await testHelper.usersInDb()
		
		const newUser = {
			username: '',
			name: 'Miko Hirvonen',
			password: '1234'
		}

		const result = await api.post('/api/users').send(newUser)
			.expect(400)

		expect(result.body.error).toContain('a username is required')

		const usersAtEnd = await testHelper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)		
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})