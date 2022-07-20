

class Player{
    constructor(startingPosX, startingPosY){
        this.Pos = createVector(startingPosX, startingPosY)
        this.mousePos = createVector(0, 0)
        this.shotingPointPos = createVector(0, 0)
        this.v = createVector(0, 0)
        this.moveSpeed = 3
        this.r = 15

        this.randomBulletPattern = 50

        this.maxMagCapacity = 5
        this.curentMagCapacity = this.maxMagCapacity 

        this.maxHealt = 100
        this.currentHealt = this.maxHealt

        this.bulletDamage = 20
        this.bulletSpeed = 6

        this.id = ""
          
        this.isDead = false
    }

    show(){
        
        fill(255, 0, 0)
        ellipse(this.Pos.x, this.Pos.y, this.r)

        fill(0)
        textSize(10)
        text(this.id.substr(0, 3), this.Pos.x - 10, this.Pos.y+24)

        stroke(255)
        line(this.Pos.x, this.Pos.y, this.v.x + this.Pos.x, this.v.y + this.Pos.y)

        
        //mysz
        fill(100,255,200)
        ellipse(this.mousePos.x, this.mousePos.y, 5)

        //shooting point
        fill(255,255,255)
        ellipse(this.shotingPointPos.x, this.shotingPointPos.y, 4)
    }
    update(){
        this.movement()
        this.constrain()
        this.mousePos = createVector(mouseX - width/2 + this.Pos.x, mouseY - height/2 + this.Pos.y)
        //this.mousePos = createVector(mouseX, mouseY)
        this.shotingPointPos = createVector(this.v.x + this.Pos.x, this.v.y + this.Pos.y)

        this.v = p5.Vector.sub(this.mousePos, this.Pos)
        this.v.setMag(20)
        
        

        
    }
    constrain(){
        this.Pos.x = constrain(this.Pos.x, -maxXposition, maxXposition)
        this.Pos.y = constrain(this.Pos.y, -maxYposition, maxYposition)
    }

    shoot(){
        if (this.curentMagCapacity > 0 && !this.isDead){
            myBullets.push(new Bullet(this.shotingPointPos, this.mousePos, this.randomBulletPattern, this.bulletDamage, this.bulletSpeed))
            this.curentMagCapacity -= 1
        }
    }
    collideWithBlob(blob){ // in argument must be given a vector // here we multiply radiuses by 2 because this collide function uses ellipse mode CENTER and we use RADIUS mode
        return collideCircleCircle(this.Pos.x, this.Pos.y, this.r * 2, blob.x, blob.y, blob.r * 2)
    }

    pickUpAmmoBlob(){
        if(this.curentMagCapacity < this.maxMagCapacity) this.curentMagCapacity+=1
    }
    pickUpUpgradeBlob(){
        this.maxHealt += 10
        this.currentHealt = this.maxHealt
        this.maxMagCapacity += 1
        this.curentMagCapacity = this.maxMagCapacity
        this.moveSpeed += 0.3
        if(this.randomBulletPattern > 15) this.randomBulletPattern -= 5       
        this.bulletDamage += 5
        this.bulletSpeed += 0.5
    }
    getHit(damage){
        this.currentHealt -= damage
        if (this.currentHealt < 0) this.currentHealt = 0
    }

    movement(){
        this.vel = createVector(0,0)
        if(keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
            this.vel.add(LEFT)
        }       
        if(keyIsDown(RIGHT_ARROW)|| keyIsDown(68)) {
            this.vel.add(RIGHT)
        }       
        if(keyIsDown(UP_ARROW)|| keyIsDown(87)) {
            this.vel.add(UP)
        }       
        if(keyIsDown(DOWN_ARROW)|| keyIsDown(83)) {
            this.vel.add(DOWN)
        }
        
        if (this.vel.magSq() > 0){
            this.vel = this.vel.normalize().mult(this.moveSpeed)
        }
            
        var potentialPos = this.Pos.add(this.vel)

        //detect collision with obstacles
        for(let i=0; i< obstacles.length; i++ ) {
            var obst = obstacles[i]

            var nearestPoint = createVector(0,0)
            nearestPoint.x = max(obst.x, min(obst.x + obst.w, this.Pos.x))
            nearestPoint.y = max(obst.y, min(obst.y + obst.h, this.Pos.y))

            var rayToNearestPoint = nearestPoint.sub(potentialPos)
            var overlap = this.r - rayToNearestPoint.mag()

            if(isNaN(overlap)) overlap = 0

            if(overlap > 0) {
                potentialPos.sub(rayToNearestPoint.normalize().mult(overlap))
            }
        }
                     
        this.Pos = potentialPos
    }

}