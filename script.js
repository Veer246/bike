const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bike = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 20,
    speed: 0,
    acceleration: 0.1,
    friction: 0.01,
    tilt: 0,
    maxTilt: 20,
};

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
};

let mountainSegments = [
    { x: 0, y: canvas.height },
    { x: 100, y: canvas.height - 50 },
    { x: 200, y: canvas.height - 80 },
    { x: 300, y: canvas.height - 100 },
    { x: 400, y: canvas.height - 60 },
    { x: 500, y: canvas.height - 90 },
    { x: 600, y: canvas.height - 40 },
    { x: 700, y: canvas.height - 70 },
    { x: 800, y: canvas.height },
];

const segmentWidth = 100;
const segmentHeightVariation = 80;

function drawBike() {
    ctx.save();
    ctx.translate(bike.x, bike.y);
    ctx.rotate(bike.tilt * Math.PI / 180);
    ctx.fillStyle = 'black';
    ctx.fillRect(-bike.width / 2, -bike.height / 2, bike.width, bike.height);
    ctx.restore();
}

function drawMountain() {
    ctx.beginPath();
    ctx.moveTo(mountainSegments[0].x, mountainSegments[0].y);
    for (let i = 1; i < mountainSegments.length; i++) {
        ctx.lineTo(mountainSegments[i].x, mountainSegments[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.stroke();
}

function generateNewSegment() {
    const lastSegment = mountainSegments[mountainSegments.length - 1];
    const newX = lastSegment.x + segmentWidth;
    const newY = lastSegment.y - segmentHeightVariation + Math.random() * (segmentHeightVariation * 2);
    mountainSegments.push({ x: newX, y: newY });
}

function updateMountain() {
    const firstSegment = mountainSegments[0];
    if (firstSegment.x < -segmentWidth) {
        mountainSegments.shift(); // Remove the first segment if it's out of the screen
        generateNewSegment(); // Generate a new segment at the end
    }
}

function updateBike() {
    if (keys.up) bike.speed += bike.acceleration;
    if (keys.down) bike.speed -= bike.acceleration;
    if (keys.left) bike.tilt = Math.max(bike.tilt - 1, -bike.maxTilt);
    if (keys.right) bike.tilt = Math.min(bike.tilt + 1, bike.maxTilt);
    
    bike.speed *= 1 - bike.friction;
    bike.x += bike.speed * Math.cos(bike.tilt * Math.PI / 180);
    bike.y += bike.speed * Math.sin(bike.tilt * Math.PI / 180);

    checkMountainCollision();

    if (bike.x < 0) bike.x = 0;
    if (bike.x > canvas.width) bike.x = canvas.width;
    if (bike.y > canvas.height) bike.y = canvas.height;
}

function checkMountainCollision() {
    for (let i = 0; i < mountainSegments.length - 1; i++) {
        const p1 = mountainSegments[i];
        const p2 = mountainSegments[i + 1];
        
        if (bike.x >= p1.x && bike.x <= p2.x) {
            const slope = (p2.y - p1.y) / (p2.x - p1.x);
            const intercept = p1.y - slope * p1.x;
            const yAtBikeX = slope * bike.x + intercept;
            
            if (bike.y >= yAtBikeX - bike.height / 2 && bike.y <= yAtBikeX + bike.height / 2) {
                bike.y = yAtBikeX - bike.height / 2;
                bike.speed = 0; // stop the bike on collision
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMountain();
    drawBike();
}

function update() {
    updateBike();
    updateMountain();
    draw();
    requestAnimationFrame(update);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'ArrowDown') keys.down = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp') keys.up = false;
    if (e.code === 'ArrowDown') keys.down = false;
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

generateNewSegment(); // Generate initial mountain segments
update();
