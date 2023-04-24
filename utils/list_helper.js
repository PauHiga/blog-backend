const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) =>{
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length !== 0){
    const reducer = (max, item) => item.likes > max ? item.likes : max
    const maxLikes = blogs.reduce(reducer, 0)
    const favoriteBlog = blogs.find((item) => item.likes === maxLikes)
    return {"title":favoriteBlog.title, "author":favoriteBlog.author, "likes":favoriteBlog.likes}
  }
  else{ 
    return "The blog list is empty"
  }
}

const mostBlogs = (blogs) =>{
  if (blogs.length !== 0){
    let count = {}
    blogs.forEach(item => {
      count[item.author] = (count[item.author] || 0) + 1
    })
    const entries = Object.entries(count)
    const reduce = (topAuthor, item) => {
      if(topAuthor[1] > item[1]) {
        return topAuthor
      }
      else{
        return item
      }
    }

    const mostRepeated = entries.reduce(reduce, entries[0]) 
    return {author: mostRepeated[0], blogs: mostRepeated[1]}
  }
  else{
    return("The blog list is empty")
  }
}

const mostLikes = (blogs) =>{
  if (blogs.length !== 0){
    let count = {}
    blogs.forEach(item => {
      count[item.author] = (count[item.author] || 0) + item.likes
    })
    const entries = Object.entries(count)
    const reduce = (mostLikedAuthor, item) => {
      if(mostLikedAuthor[1] > item[1]){
        return mostLikedAuthor
      }
      else{
        return item
      }
    }
    const moreLiked = entries.reduce(reduce, entries[0])
    return {author:moreLiked[0], likes: moreLiked[1]}
    
  }
  else{
    return("The blog list is empty")
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
