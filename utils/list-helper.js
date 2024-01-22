const { chain } = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  let topBlog = null
  for (const blog of blogs) {
    topBlog = blog.likes > (topBlog?.likes ?? 0) ? blog : topBlog
  }
  return topBlog
}

const mostBlogs = (blogs) => {
  return most((blogsOfEachAuthor) => blogsOfEachAuthor.length, blogs)
}

const mostLikes = (blogs) => {
  return most(totalLikes, blogs)
}

const most = (valuesMapper, blogs) => {
  return chain(blogs)
    .groupBy('author')
    .mapValues((blogs) => valuesMapper(blogs))
    .map((count, author) => ({ author, count }))
    .maxBy('count')
    .value()
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
