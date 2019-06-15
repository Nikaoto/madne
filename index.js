const express = require("express")
const mongodb = require("mongodb")
const bodyParser = require("body-parser")
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const upload = multer({ dest: path.resolve(__dirname, "uploads/") })
const mustache = require("mustache")

const PORT = process.env.PORT || 8080
const STATIC_DIR = path.resolve(__dirname, "static")
const VIEW_DIR = path.resolve(__dirname, "views")
const getStaticFile = (fileName) => path.resolve(STATIC_DIR, fileName)
const getView = (fileName) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(VIEW_DIR, fileName), (err, fileContent) => {
    if (err) {
      reject(err)
    } else {
      resolve(fileContent.toString())
    }
  })
})
const getViewSync = (fileName) => fs.readFileSync(path.resolve(VIEW_DIR, fileName)).toString()

// Configure mongodb
const MONGO_URL = "mongodb://localhost:27017"
const DB_NAME = "madne"
const mongoClient = new mongodb.MongoClient(MONGO_URL, { useNewUrlParser: true });
mongoClient.connect()
  .then(() => main(mongoClient.db(DB_NAME)))
  .catch(err => console.log(err))

const main = (db) => {
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static(STATIC_DIR))

  // Preload nested templates
  const headView = getViewSync("head.mst")
  const footerView = getViewSync("footer.mst")
  
  // Landing page
  app.get("/", (req, res) => {
    getView("index.mst")
      .then(view => {
        res.status(200).send(mustache.render(view, {
          head: headView,
          title: "madne",
          footer: footerView
        }))
      })
      .catch(err => res.status(500).json({ error: err}))
  })

  // Upload page
  app.get("/upload", (req, res) => {
    getView("upload.mst")
      .then(view => {
        res.status(200).send(mustache.render(view, {
          head: headView,
          footer: footerView
        }))
      })
      .catch(err => res.status(500).json({ error: err}))
  })

  // About page
  app.get("/about", (req, res) => {
    getView("about.mst")
      .then(view => {
        res.status(200).send(mustache.render(view, {
          head: headView,
          footer: footerView
        }))        
      })
      .catch(err => res.status(500).json({ error: err}))
  })

  // Fetch all melts ordered by id
  app.get("/api/melts", (req, res) => {
    db.collection("melts").find({}).sort({ _id: -1 }).toArray()
      .then(melts => res.status(200).json(melts))
      .catch(err => res.status(500).json({ error: err }))
  })


  // Upload a melt
  app.post("/api/melt", upload.single("imageData"), (req, res) => {
    const { authorId, imageData } = req.body

    // Insert into db
    db.collection("melts").insertOne({
      solids: 0,
      imageData: new Buffer.from(imageData.split(",")[1], "base64"),
      author: new mongodb.ObjectID.createFromHexString(authorId)
    })
      .then(r => res.status(200).json({ status: "ok" }))
      .catch(err => res.status(500).json({ error: err }))
  })
  
  // Fetch users
  app.get("/api/users", (req, res) => {
    db.collection("users").find({}).toArray()
      .then(users => res.status(200).json(users))
      .catch(err => res.status(500).json({ error: err }))
  })

  // Handle 404
  app.use((req, res, next) => {
    if (req.accepts("html")) {
      res.status(404).send("<h1>404: Not found</h1>")
      return;
    }

    if (req.accepts("json")) {
      res.status(404).json({ error: "404: Not found" })
      return;
    }

    res.status(404).type("txt").send("404: Not found")
  })

  const server = app.listen(PORT, () => {
    console.log("App running on port", server.address().port)
  })
}
