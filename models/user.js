const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user: String,
  username: {type: String, required: true},
  passwordHash: {type: String, required: true},
  blogs:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject)=>{
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)


