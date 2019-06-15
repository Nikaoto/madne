const express = require("express")
const mongodb = require("mongodb")

const url = "mongodb://localhost:27017"
const dbName = "madne"
const client = new mongodb.MongoClient(url, { useNewUrlParser: true });

client.connect()
  .then((clientData) => {
    console.log("MongoDB connection successful")
    
    const db = client.db(dbName)

    // Insert user
    db.collection("users").insertOne({
      name: "John Doe",
      handle: "johndoe",
      bio: "johndoe bio"
    }).catch(err => console.log(err))

    // Update user
    db.collection("users").updateMany({ handle: "johndoe" }, {
      $set: { bio: "johndoe bio2" }
    })
      .then(r => console.log(`modified ${r.matchedCount} instances`))
      .catch(err => console.log(err))
    
    // Delete user
    db.collection("users").deleteMany({ handle: "johndoe" })
      .then(r => console.log(`deleted ${r.deletedCount} instances`))
      .catch(err => console.log(err))
    
    client.close()
  })
  .catch(err => console.log(err))
