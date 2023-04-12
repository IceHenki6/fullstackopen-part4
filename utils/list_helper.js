const _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	const reducer = (a, c) => a + c

	const likesArr = blogs.map(blog => blog.likes)

	return likesArr.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
	const mostLiked = blogs[0]

	blogs.forEach(blog => {
		if(blog.likes > mostLiked.likes){
			mostLiked = blog
		}
	})

	return mostLiked
}

const mostBlogs = (blogs) => {
	const authorsArr = _.map(blogs, 'author')
	const blogsPerAuthor = _.countBy(authorsArr)

	let blogsPerAuthorArr = []
	for (const author in blogsPerAuthor){
		const authorObj = {
			author : author,
			blogs : blogsPerAuthor[author]
		}
		blogsPerAuthorArr.push(authorObj)
	}

	return _.maxBy(blogsPerAuthorArr, 'blogs')
}


const mostLikes = (blogs) => {
	const likesPerAuthor = {}
	let authorsArr = []

	blogs.forEach(blog => {
		likesPerAuthor[blog.author] = 0
	})

	blogs.forEach(blog => {
		likesPerAuthor[blog.author] += blog.likes
	})
	
	for(const author in likesPerAuthor){
		const authorObj = {
			author: author,
			likes: likesPerAuthor[author]
		}
		authorsArr.push(authorObj)
	}
	return _.maxBy(authorsArr, 'likes')
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}