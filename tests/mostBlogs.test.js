const listHelper = require('../utils/list_helper')

describe('most blogs', () => {
	const blogs = [
		{
			_id: "5a422b3a1b54a676234d17f9",
			title: "Canonical string reduction",
			author: "Edsger W. Dijkstra",
			url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
			likes: 12,
			__v: 0
		},
		{
			_id: "5a422b891b54a676234d17fa",
			title: "First class tests",
			author: "Robert C. Martin",
			url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
			likes: 10,
			__v: 0
		},
		{
			_id: "5a422ba71b54a676234d17fb",
			title: "TDD harms architecture",
			author: "Robert C. Martin",
			url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
			likes: 0,
			__v: 0
		},
		{
			_id: "5a422bc61b54a676234d17fc",
			title: "Type wars",
			author: "Robert C. Martin",
			url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
			likes: 2,
			__v: 0
		}  
	]

	test('author with most blogs', () => {
		const result = listHelper.mostBlogs(blogs)
		expect(result).toEqual({
			author : "Robert C. Martin",
			blogs : 3
		})
	})
})