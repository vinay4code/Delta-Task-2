const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const survivorImage = new Image();
survivorImage.src = 'player.png';

const zombieImage = new Image();
zombieImage.src = 'zombie.png';
window.addEventListener('click',() =>{
    document.getElementById('backgroundMusic').play();
});


class Entity {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

class Survivor extends Entity {
    constructor(x, y) {
        super(x, y, 50, 80, survivorImage); // Increased size
        this.isJumping = false;
        this.isShooting = false;
        this.health = 100;
        this.score = 0;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = -15;
            this.isJumping = true;
        }
    }

    shoot() {
        if (!this.isShooting) {
            projectiles.push(new Projectile(this.x + this.width / 2, this.y));
            this.isShooting = true;
            shootSound.currentTime = 0; // Reset sound to the beginning
            shootSound.play();
            setTimeout(() => this.isShooting = false, 100);
        }
    }

    update() {
        super.update();
        if (this.y + this.height < canvas.height) {
            this.velocityY += 0.5; // Gravity
        } else {
            this.velocityY = 0;
            this.isJumping = false;
            this.y = canvas.height - this.height;
        }
    }

    draw() {
        super.draw();
        // health and score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Health: ${this.health}`, 10, 20);
        ctx.fillText(`Score: ${this.score}`, 10, 50);
    }
}

class Zombie extends Entity {
    constructor(x, y) {
        super(x, y, 50, 80, zombieImage); // Increased size
    }

    update() {
        super.update();
        this.x -= 1;
        // Check collision
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            survivor.health -= 1;
            this.x = -100;
        }
    }
}

class Projectile extends Entity {
    constructor(x, y) {
        super(x, y, 5, 5, null);
        this.velocityY = 0;
        this.velocityX = 6;
        this.gravity = 0.1;
    }

    update() {
        super.update();
        this.velocityY += this.gravity;
        // Check collision with zombies
        zombies.forEach((zombie, index) => {
            if (this.x < zombie.x + zombie.width &&
                this.x + this.width > zombie.x &&
                this.y < zombie.y + zombie.height &&
                this.y + this.height > zombie.y) {
                survivor.score += 10;
                zombies.splice(index, 1);
                projectiles.splice(projectiles.indexOf(this), 1);
                hitSound.currentTime = 0; // Reset sound to the beginning
                hitSound.play();
            }
        });
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const survivor = new Survivor(100, canvas.height - 80); // Adjusted initial position
const zombies = [];
const projectiles = [];
let isPaused = false;

// Function to spawn new zombies
function spawnZombie() {
    zombies.push(new Zombie(canvas.width, canvas.height - 80)); // Adjusted initial position
    if (!isPaused) {
        setTimeout(spawnZombie, Math.random() * 3000 + 1000);
    }
}

function updateGame() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    survivor.update();
    survivor.draw();

    zombies.forEach((zombie, index) => {
        zombie.update();
        zombie.draw();

        if (zombie.x + zombie.width < 0) {
            zombies.splice(index, 1);
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();

        if (projectile.x > canvas.width || projectile.y > canvas.height) {
            projectiles.splice(index, 1);
        }
    });

    // Display controls in the top-right corner
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Controls:', canvas.width - 150, 20);
    ctx.fillText('Move: Arrow Keys', canvas.width - 150, 40);
    ctx.fillText('Jump: Space', canvas.width - 150, 60);
    ctx.fillText('Shoot: S', canvas.width - 150, 80);
    ctx.fillText('Pause: P', canvas.width - 150, 100);

    if (survivor.health > 0) {
        requestAnimationFrame(updateGame);
    } else {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            survivor.velocityX = -5;
            break;
        case 'ArrowRight':
            survivor.velocityX = 5;
            break;
        case 'Space':
            survivor.jump();
            break;
        case 'KeyS':
            survivor.shoot();
            break;
        case 'KeyP': // Pause
            isPaused = !isPaused;
            if (!isPaused) {
                updateGame();
                spawnZombie();
            }
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            survivor.velocityX = 0;
            break;
    }
});

spawnZombie(); // Start spawning zombies
updateGame();
