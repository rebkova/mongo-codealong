import express, { response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from "mongoose"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/mongo-codealong" //url to our database
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise


// ----------- author model -----------
const Author = mongoose.model("Author", {
  name: String
})

const Book = mongoose.model("Book", {
  title: String,
  author: {
    //here we say it relates to an object ID from another model
    type: mongoose.Schema.Types.ObjectId,
    //which model it refers to
    ref: "Author"
  }
})

if (process.env.RESET_DATABASE) {
  //write RESET_DATABASE=true npm run dev in the terminal
  console.log("Resetting database!")
  // async function -> no need to use promises, can use await
  // SEED function runs every time -> generating more authors 
  const seedDatabase = async () => {

    //deletes existing data to avoid multiplication
    //ID changes every time!!!
    await Author.deleteMany()

    const tolkien = new Author({ name: "J.R.R. Tolkien" })
    await tolkien.save()

    const rowling = new Author({ name: "J.K. Rowling" })
    await rowling.save()

    await new Book({ title: "Harry Potter and the Philosopher's Stone", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Chamber of Secrets", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Prisoner of Azkaban", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Goblet of Fire", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Order of the Phoenix", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Half-Blood Prince", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Deathly Hallows", author: rowling }).save()
    await new Book({ title: "The Lord of the Rings", author: tolkien }).save()
    await new Book({ title: "The Hobbit", author: tolkien }).save()
  }
  seedDatabase()
}

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 9000
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (require, response) => {
  response.send('Hello, codealong material here!')
})


// ------- RESTful route ---------------

// ---- return all authors ---
app.get("/authors", async (require, response) => {

  //finds everything in the database
  const authors = await Author.find()
  response.json(authors)
})

//--- return a single author by id ---
app.get("/authors/:id", async (require, response) => {
  const author = await Author.findById(require.params.id)

  if (author) {
    response.json(author)
  }
  else {
    //the wrong id has to be the same length as the correct one
    //HOW to HANDLE that?
    response.status(404).json({ error: "Author not found!" })
  }
})

//---- return all books by an author ----
app.get("/authors/:id/books", async (require, response) => {

  //finds the author
  const author = await Author.findById(require.params.id)
  console.log(`Author: ${author}`)

  if (author) {
    //get book with the author's id
    //WHICH AUTHOR IS IT REFERRING TO?
    const books = await Book.find({ author: mongoose.Types.ObjectId(author.id) })
    response.json(books)
  }
  else {
    //the wrong id has to be the same length as the correct one
    response.status(404).json("Author not found!")
  }

})

//---- return all books ----
app.get("/books", async (require, response) => {
  //we include the realationship to author
  //got into the author collection and pull out the data for that book
  const books = await Book.find().populate("author")
  response.json(books)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
