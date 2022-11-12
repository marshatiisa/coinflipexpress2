//worked with Mark-mentor to get the win count code to display in the ejs
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient


var db, collection;
const dbName = "coinflip";
const url =
  `mongodb+srv://marshatiisa:ZjTYmNmnQQtcz5@cluster0.8gmpf0f.mongodb.net/${dbName}?retryWrites=true&w=majority`;

app.listen(3040, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('results').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs')
  })
})

app.post('/coinflipsave', (req, res) => {
  let userChoice = req.body.userChoice
  let flipResult = Math.ceil(Math.random()*2) === 1 ? 'heads' : 'tails'

  db.collection('results').insertOne({userChoice: req.body.userChoice, flipResult: flipResult}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    db.collection('results').find().toArray((err, result) => {
      let count = 0
      for(let i=0; i<result.length; i++){
        if(result[i].userChoice === result[i].flipResult){
          count ++
        }
      }
      res.render('index.ejs', {userChoice: userChoice, flipResult:flipResult, winCount:count})
    })
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
