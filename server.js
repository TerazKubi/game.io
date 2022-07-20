const express = require('express'); //Import the express dependency
const nodemon = require('nodemon');
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

//Idiomatic expression in express to route and respond to a client request
//app.get('/', (req, res) => {        //get requests to the root ("/") will route here
//    res.sendFile('public/index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
//});

var server = app.listen(process.env.PORT || 5000, ()=>{
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://' + host + ':' + port)
  })



app.use(express.static('public'));

var io = require('socket.io')(server)


var obstacles = [
  {x: 100, y:50, w:50, h:150},
  {x: 200, y:250, w:120, h:70},
  {x: -200, y:50, w:60, h:190},
  {x: 20, y: -90, w: 140, h: 80}        
]

var players = {}
var blobs = []


var scoreBoard = {}
var scoreBoardAsArray = []

const AMMO_BLOBS_COUNT = 100
const UPGRADES_COUNT = 0   

const MIN_SPAWN_BLOB = -200;
const MAX_SPAWN_BLOB = 200;
for (let i =0 ;i< AMMO_BLOBS_COUNT; i++){
  spawnNewBlob("ammo")
}
for (let i =0 ;i< UPGRADES_COUNT; i++){
  spawnNewBlob("upgrade")
}

setInterval(() =>{
  io.sockets.emit("hearthbeat", ({players, blobs, scoreBoardAsArray}))
}, 16)


io.sockets.on('connection', (socket)=>{
  console.log('Player joined: ' + socket.id)
  socket.emit("hearthbeat", ({players, blobs, scoreBoardAsArray}))
  socket.emit("sendObstacles",(obstacles))

  scoreBoard[socket.id] = 0
  scoreBoardAsArray = Object.keys(scoreBoard).map(function(key) {
    return [key, scoreBoard[key]];
  })

  

  socket.on("playerData", (playerData) => {
    players[socket.id] = playerData
    
  })

  socket.on("blobToDelete", ([index, blobType]) => {
    blobs.splice(index, 1)
    //console.log(index)
    spawnNewBlob(blobType)
    io.sockets.emit("hearthbeat", ({players, blobs, scoreBoardAsArray}))
  })
  

  socket.on("dealDamageToUser", ([sid, damage, ownerId]) => {
    console.log(sid, damage, ownerId)
    io.to(sid).emit("takeDamage", damage)
    players[sid].health -= damage
    console.log("player: " + sid + " took " + damage + " curentHealth: " + players[sid].health)

    if(players[sid].health <= 0){
      scoreBoard[ownerId] += 1
      scoreBoard[sid] = 0
      scoreBoardAsArray = Object.keys(scoreBoard).map(function(key) {
        return [key, scoreBoard[key]];
      })
      io.to(sid).emit("youDied")
      
      
      // Sort the array based on the second element
      scoreBoardAsArray.sort(function(first, second) {
        return second[1] - first[1];
      })
      
    }
  })
  socket.on("playerDeath", (playerId) => {
    delete players[playerId]
    io.sockets.emit("hearthbeat", ({players, blobs, scoreBoardAsArray}))
  })


  socket.on('disconnect', function() {
    console.log('Player has disconnected: ' + socket.id)
    delete players[socket.id]
    delete scoreBoard[socket.id]
    scoreBoardAsArray = Object.keys(scoreBoard).map(function(key) {
      return [key, scoreBoard[key]];
    })
    
  })
})


function spawnNewBlob(type){
  var newR
  var newX = Math.floor(Math.random() * (MAX_SPAWN_BLOB - MIN_SPAWN_BLOB + 1) + MIN_SPAWN_BLOB)
  var newY = Math.floor(Math.random() * (MAX_SPAWN_BLOB - MIN_SPAWN_BLOB + 1) + MIN_SPAWN_BLOB)
  var count = 0
  obstacles.forEach(o => {
    while(checkIfInObstacle(newX, newY, o.x, o.y, o.w, o.h)){      
      newX = Math.floor(Math.random() * (MAX_SPAWN_BLOB - MIN_SPAWN_BLOB + 1) + MIN_SPAWN_BLOB)
      newY = Math.floor(Math.random() * (MAX_SPAWN_BLOB - MIN_SPAWN_BLOB + 1) + MIN_SPAWN_BLOB)
      count+=1
    }
  })
  //console.log(count)

  if(type == "ammo"){
    newR = 3
  } else if(type == "upgrade"){  
    newR = 6
  }
  blobs.push({x: newX, y: newY, r: newR, blobType: type})             
}
function checkIfInObstacle(blobx, bloby, ox, oy, ow, oh){
  
  if(blobx >= ox-10 && blobx <= ox+ow+10 && bloby >= oy-10 && bloby <= oy+oh+10) {                  
    return true
  }else {
    return false
  }     
  
}

//npm run dev