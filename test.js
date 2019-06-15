const fetch = require("node-fetch")

fetch("http://localhost:8080/api/melt", {
  method: "POST",
  body: JSON.stringify({
    authorId: "5d03fab1de7cce55fba1305c",
    imageData: "imgdata"
  }),
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
})
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.log(err))
