const { chain } = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return chain(blogs).sumBy('likes').value()
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) { return null }
  return chain(blogs).maxBy('likes').value()
}

const mostBlogs = (blogs) => {
  return findTopAuthor((owningBlogs) => owningBlogs.length, blogs)
}

const mostLikes = (blogs) => {
  return findTopAuthor(totalLikes, blogs)
}

const findTopAuthor = (toTarget, blogs) => {
  return chain(blogs)
    .groupBy('author')
    .mapValues(toTarget)
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
