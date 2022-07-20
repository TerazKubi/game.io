class Bullet{
    constructor(Position, TargetPos, randomBulletPattern, damage, speed){
        this.bulletPos = Position
        this.mousePos = TargetPos

        this.speed = speed
        this.randomBulletPattern = randomBulletPattern

        this.damage = damage

        this.r = 7

        this.trajectory = p5.Vector.sub(this.mousePos, this.bulletPos).setMag(500)
        this.trajectory.add(p5.Vector.random2D().mult(this.randomBulletPattern))
        
        this.trajectory.setMag(this.speed)
        
        this.s = setTimeout(()=>{
            this.destroy()
        },3000)

    }

    show(){
        push()
        ellipseMode(CENTER)
        fill(color(255,0,0));
        ellipse(this.bulletPos.x, this.bulletPos.y, this.r * 2 )
        pop();    
    }
      
    update(){
        this.bulletPos.add(this.trajectory)
        
    }

    destroy(){
        myBullets.splice(myBullets.indexOf(this), 1)
    }

    destroyOnCollision(){
        this.destroyWhenTouchedOtherPlayer()
        this.destroyWhenTouchedWalls()
    }
    destroyWhenTouchedOtherPlayer(){
        Object.entries(players).filter(([key, value]) => !value.isDead).forEach(([key, value]) => {
            if(collideCircleCircle(value.x, value.y, value.r * 2, this.bulletPos.x, this.bulletPos.y, this.r * 2)){
                console.log(key, value)
                this.destroy()
                socket.emit("dealDamageToUser", ([key, this.damage, socket.id]))
            }
        })          
    }
    destroyWhenTouchedWalls(){
        obstacles.forEach(obst => {
            if(collideRectCircle(obst.x, obst.y, obst.w, obst.h, this.bulletPos.x, this.bulletPos.y, this.r * 2)){
                this.destroy()
            }
        })
    }


}