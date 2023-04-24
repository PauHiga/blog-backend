const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const testHelper = require('../utils/testHelper')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

let auth = ""

beforeEach( async ()=>{
  await Blog.deleteMany({})
  for (let blog of testHelper.blogs){
    let blogObject =  new Blog(blog)
    await blogObject.save()
  }
  await User.deleteMany({})

  const newUser = new User({
    user:'Hello',
    username:'World',
    passwordHash: await bcrypt.hash("hello world!", 10)
  })
  await newUser.save()

  await api
  .post('/api/login')
  .send(  
    {
    "username": "World",
    "password": "hello world!"
    })
  .expect(200)
  .then(res => {
  auth = res.body.token
  })
})

describe('When there is initially some blogs saved', ()=>{
  test('blogs are returned as json', async ()=>{
    await api
      .get('/api/blog')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('The right amount of posts is returned', async ()=>{
      const currentEntries = await testHelper.blogsReturned()
      expect(currentEntries.length).toBe(testHelper.blogs.length)
  })
  
  test('All the posts have an "id" property', async ()=>{
    const currentEntries = await testHelper.blogsReturned()
    for(entry of currentEntries){
      expect(entry.id).toBeDefined()
    }
  })
})

describe('Adding a new blog to the database', ()=>{

  test('a valid blog is successfully added to the database', async ()=>{
    const newEntry = 
      {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
      }

    await api
      .post('/api/blog/')
      .send(newEntry)
      .set('Authorization', 'Bearer ' + auth) 
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
      const blogsAtEnd = await testHelper.blogsReturned()
      expect(blogsAtEnd.length).toBe(testHelper.blogs.length + 1)
  
      const allTitles = blogsAtEnd.map(item => item.title)
      expect(allTitles).toContain("React patterns")
  })
  
  test('If the "likes" property is missing, it defaults to 0', async()=>{
    const noLikesProp = 
      {
        title: "Entry with no likes",
        author: "Michael Chan",
        url: "https://entrywithnolikes.com/" 
      }

    await api.post('/api/blog/')
      .send(noLikesProp)
      .set('Authorization', 'Bearer ' + auth) 
    
      const blogsAtEnd = await testHelper.blogsReturned()
  
      const noLikesEntry = blogsAtEnd.find(item => item.title === "Entry with no likes" && item.author === "Michael Chan" && item.url === "https://entrywithnolikes.com/")
  
      expect(noLikesEntry).toMatchObject({likes: 0})
  })
  
  test('If there is no token, it responds with status 401', async()=>{
    const newEntry = 
    {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7
    }

    await api
    .post('/api/blog/')
    .send(newEntry)
    .expect(401)
  })

  test('If the "title" property is missing, it responds with status 400', async()=>{
    const noTitleProp = 
      {
        author: "Titless Author",
        url: "https://entrywithnotitle.com/",
        likes: 7
      }
  
    await api.post('/api/blog/')
      .send(noTitleProp)
      .set('Authorization', 'Bearer ' + auth) 
      .expect(400)
  })
  
  test('If the "url" property is missing, it responds with status 400', async()=>{
    const noURLProp = 
      {
        title: "Entry with no url",
        author: "No'url Author",
        likes: 7
      }
  
    await api.post('/api/blog/')
      .send(noURLProp)
      .set('Authorization', 'Bearer ' + auth) 
      .expect(400)
  })
  
})

describe('When a blog entry is deleted', ()=>{
  test('A blog can be deleted', async()=>{

    const mockBlog = {
      title: "Harmful",
      author: "W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
    }

    await Blog.deleteMany({})
    await api
      .post('/api/blog')
      .send(mockBlog)
      .set('Authorization', 'Bearer ' + auth) 

    const allBlogs = await testHelper.blogsReturned()

    await api
      .delete(`/api/blog/${allBlogs[0].id}`)
      .set('Authorization', 'Bearer ' + auth) 
      .expect(204)

    const currentAllBlogs = await testHelper.blogsReturned()
    expect(currentAllBlogs.length).toBe(allBlogs.length - 1)
  })
})

describe('when a blog entry is updated', ()=>{
  test('the number of likes of an entry can be updated', async ()=>{
    const allBlogs = await testHelper.blogsReturned()
    
    let entryToModify = allBlogs[0]
    entryToModify.likes = 100000

    await api
      .put(`/api/blog/${entryToModify.id}`)
      .send(entryToModify)

    const allBlogsAfter = await testHelper.blogsReturned()
    const modifiedBlog = allBlogsAfter.find(item => item.id === entryToModify.id)
    expect(modifiedBlog.likes).toBe(100000)
  })
})

describe('when there is initially one user in the database', ()=>{

  test('a new user with a new username can be created', async()=>{

    const listOfUsersInitial = await testHelper.usersReturned()
    
    freshUser = {
      user: 'New User',
      username: 'New Username',
      password: 'Salarian'
    }

    await api
    .post('/api/users')
    .send(freshUser)
    .expect(201)
    .expect('Content-type', /application\/json/)

    const listOfUsersEnd = await testHelper.usersReturned()
    expect(listOfUsersEnd.length).toBe(listOfUsersInitial.length +1)
  
    const allFinalUsernames = listOfUsersEnd.map(item => item.username)
    expect(allFinalUsernames).toContain('New Username')
  })

  test('a user with a password with less than 3 characters length is rejected', async ()=>{
    const listOfUsersInitial = await testHelper.usersReturned()

    const invalidUser = {
      user: "Invalid User",
      username: "A username",
      password: "PW"
    }

    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      
    expect(result.body.error).toContain('username and password must be at least 3 characters long')

    const listOfUsersFinal = await testHelper.usersReturned()
    expect(listOfUsersFinal).toStrictEqual(listOfUsersInitial)
  })
  
  test('a user with a username with less than 3 characters length is rejected', async ()=>{
    const listOfUsersInitial = await testHelper.usersReturned()

    const invalidUser = {
      user: "Invalid User",
      username: "aa",
      password: "passwordLOL"
    }

    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      
    expect(result.body.error).toContain('username and password must be at least 3 characters long')

    const listOfUsersFinal = await testHelper.usersReturned()
    expect(listOfUsersFinal).toStrictEqual(listOfUsersInitial)
  })

  test('a user without a password is rejected', async ()=>{
    const listOfUsersInitial = await testHelper.usersReturned()

    const invalidUser = {
      user: "Invalid User",
      username: "A username"
    }

    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      
    expect(result.body.error).toContain('password is required')

    const listOfUsersFinal = await testHelper.usersReturned()
    expect(listOfUsersFinal).toStrictEqual(listOfUsersInitial)
  })  

  test('a user without a username is rejected', async ()=>{
    const listOfUsersInitial = await testHelper.usersReturned()

    const invalidUser = {
      user: "Invalid User",
      password: "passwordLOL"
    }

    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      
    expect(result.body.error).toContain('username is required')

    const listOfUsersFinal = await testHelper.usersReturned()
    expect(listOfUsersFinal).toStrictEqual(listOfUsersInitial)
  })  
  
})

// beforeEach( async ()=>{
//   await Blog.deleteMany({})
//   for (let blog of testHelper.blogs){
//     let blogObject =  new Blog(blog)
//     await blogObject.save()
//   }
// })


afterAll(async () => {
  await mongoose.connection.close()
})
