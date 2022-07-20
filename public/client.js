

var socket = io()

var player

var players = {}
var myBullets = []
var blobs = []


var scoreBoard = []
var obstacles = []

var UP
var DOWN
var LEFT
var RIGHT

const maxXposition = 600
const maxYposition = 600



function setup(){
    createCanvas(innerWidth - 4, innerHeight - 4);
    
    UP = createVector(0, -1)
    DOWN = createVector(0, 1)
    LEFT = createVector(-1, 0)
    RIGHT = createVector(1, 0)
        
    
    player = new Player(0, 0)
    
    socket.on("connect",()=>{
        console.log("hello " + socket.id)
        player.id = socket.id
    })
    socket.on("hearthbeat", (data)=>{
        players = data.players
        blobs = data.blobs
        scoreBoard = data.scoreBoardAsArray
    })

    socket.on("sendObstacles",(obst)=>{
        obstacles = obst
    })
    

    socket.on("takeDamage", (dmg) => {
        player.getHit(dmg)
        sendDataToserver()
    })


    socket.on("youDied", ()=>{
        player.isDead = true
    })

    
    ellipseMode(RADIUS)
}



function draw(){
    background(192, 192, 192)

    push()

    translate(width / 2 - player.Pos.x , height / 2 - player.Pos.y)
    
    //draw other players
    Object.entries(players).filter(([key, value]) => key != socket.id && !value.isDead).forEach(([key, value]) => {
        fill(0)
        textSize(10)
        text(key.substr(0, 3), value.x - 10, value.y+24)
        fill(0,0,255)
        ellipse(value.x, value.y, value.r)
        fill(0,0,255)
        ellipse(value.shotPointPos.x, value.shotPointPos.y, 4)
        
        //draw others bullets
        for(let i=0; i<value.bullets.length;i++){
            fill(0,0,0)
            ellipse(value.bullets[i].bulletPos.x, value.bullets[i].bulletPos.y, value.bullets[i].r)
        }
    })

    //draw blobs   
    for (let i = 0; i < blobs.length; i++){
        if(blobs[i].blobType == "ammo"){
            fill(0, 255, 0)
            ellipse(blobs[i].x, blobs[i].y, blobs[i].r)
        }else if(blobs[i].blobType == "upgrade"){
            fill(255, 0, 255)
            ellipse(blobs[i].x, blobs[i].y, blobs[i].r)
        }       
    }
    
    //check collison between player and blobs
    for (let i=0; i < blobs.length; i++){
        if(player.collideWithBlob(blobs[i])){
            var bt = blobs[i].blobType
            if(bt == "ammo" && player.curentMagCapacity < player.maxMagCapacity){
                player.pickUpAmmoBlob()
                socket.emit("blobToDelete",  [i, bt])
            }else if(bt == "upgrade"){
                player.pickUpUpgradeBlob()
                socket.emit("blobToDelete",  [i, bt])
            }

            
            break
        }
    }
    
    
    
    //draw obstacle  
    fill(0, 0, 0, 0)
    
    for(let i=0; i<obstacles.length; i++){
        rect(obstacles[i].x, obstacles[i].y, obstacles[i].w, obstacles[i].h)
    }
    
    //draw bullets
    for(let i=0; i < myBullets.length;i++) {
        myBullets[i].show()
        myBullets[i].update()
        myBullets[i].destroyOnCollision()
        
    }
    
    //draw and update player
    player.update()
    player.show()

    pop()

    //draw UI
    fill(0)
    textSize(16)
    text(player.curentMagCapacity + "/" + player.maxMagCapacity, width - 50, height - 10)
    fill(255,0,0)
    rect(10, 10, player.maxHealt, 20)
    fill(0,255,0)
    rect(10, 10, player.currentHealt, 20)
    fill(0)
    textSize(15)
    text(player.currentHealt + "/" + player.maxHealt, (player.maxHealt/2) - 20, 26)


    //draw scoreboard
    var playersCount = scoreBoard.length
    
    fill(0,0,0, 150)
    rect(width - 110, 10, 100, 50 + (playersCount-1) * 20)

    fill(255,255,255)
    text("Score:", width - 110 + 10, 30)
    textSize(13)
    var count = 1
    scoreBoard.forEach((value) => {
        if(value[0] == socket.id){
            text(value[0].substr(0, 3) + "(You)", width - 110 + 10, 50 + (count-1) * 20)
        }else{
            text(value[0].substr(0, 3), width - 110 + 10, 50 + (count-1) * 20)
        }
        text(value[1], width - 110 + 80, 50 + (count-1) * 20)
        count += 1
    })
    
  

    //player died
    if(player.isDead){
        fill(0,0,0, 190)
        rect(0,0, width, height)
        fill(255,255,255)
        rect(width/2 - 175, height/2 - 100, 350, 200)
        fill(0)
        textSize(30)
        text("Press space to respawn", width/2 - 155, height/2)
    }

    sendDataToserver()

}



function sendDataToserver(){
    var playerData = {
        x: player.Pos.x,
        y: player.Pos.y,
        r: player.r,
        shotPointPos: {x: player.shotingPointPos.x, y: player.shotingPointPos.y},
        bullets: myBullets,
        health: player.currentHealt,
        isDead: player.isDead
    }
    socket.emit("playerData", playerData)
}


function mouseClicked(){
    player.shoot()
}
function keyPressed(){
    if(key == ' ' && player.isDead) {
        player = new Player(0, 0)
        player.id = socket.id
        player.isDead = false
        //loop()
    }
}