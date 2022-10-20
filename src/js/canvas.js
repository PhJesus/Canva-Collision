import utils from './utils'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
  x: 10,
  y: 10
}

function generateLightColorHex() {
  let color = "#";
  for (let i = 0; i < 3; i++)
    color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
  return color;
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

let prevEvent, currEvent;

let speedX, speedY;

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
  currEvent = event;
});

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
});

// Objects
class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 1) * (Math.round(Math.random()) ? 1 : -1),
      y: (Math.random() - 1) * (Math.round(Math.random()) ? 1 : -1)
    }
    this.radius = radius;
    this.color = color;
    this.mass = 1;
    this.opacity = 0;
    this.dragging = false;
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.strokeStyle = this.color
    c.stroke()
    c.closePath()
  }

  update(particles) {
    this.draw();

    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i] ) continue;

      if (utils.distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0) {
        utils.resolveCollision(this, particles[i]);
        
      }

      if (utils.distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0 && this.opacity < 0.2) {
        this.opacity += 0.2;
      }
    }

    if (this.opacity > 0) {
      this.opacity -= 0.003;

      this.opacity = Math.max(0, this.opacity);
    }
    

    if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
      this.velocity.x = -this.velocity.x;
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
      this.velocity.y = -this.velocity.y;
    }

    canvas.onmousedown = e => {
      for (let i = 0; i < particles.length; i++) {
        if (utils.distance(e.layerX, e.layerY, particles[i].x, particles[i].y) - this.radius * 2 < 0) {
          particles[i].dragging = true;
        }
      }
    }
    
    canvas.onmouseup = e => {
      for (let i = 0; i < particles.length; i++) {
        particles[i].dragging = false;
      }
    }

    canvas.onmousemove = e => {
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].dragging) {
          particles[i].x = e.layerX;
          particles[i].y = e.layerY;
          particles[i].velocity.x = speedX;
          particles[i].velocity.y = speedY;
        }
      }
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Implementation
let particles;
function init() {
  particles = [];

  for (let i = 0; i < 500; i++) {
    const radius = 15;
    let x = utils.randomIntFromRange(radius, canvas.width - radius);
    let y = utils.randomIntFromRange(radius, canvas.height - radius);
    //const color = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');;
    const color = generateLightColorHex();

    if (i !== 0) {
      for (let j = 0; j < particles.length; j++) {
        if (utils.distance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
          x = Math.random() * innerWidth;
          y = Math.random() * innerHeight;
          j = -1;
        }
      }
    }

    particles.push(new Circle(x, y, radius, color)); 
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update(particles);
  });

  if (prevEvent && currEvent) {
    let movX = (currEvent.screenX - prevEvent.screenX);
    let movY = (currEvent.screenY - prevEvent.screenY);
    switch (true) {
      case currEvent.screenX > prevEvent.screenX && currEvent.screenY == prevEvent.screenY:
        speedX = 1 * Math.sqrt(movX * movX);
        speedY = 0;
        break;
      case currEvent.screenX < prevEvent.screenX && currEvent.screenY == prevEvent.screenY:
        speedX = -Math.abs(1 * Math.sqrt(movX * movX));
        speedY = 0;
        break;
      case currEvent.screenX == prevEvent.screenX && currEvent.screenY > prevEvent.screenY:
        speedY = 1 * Math.sqrt(movY * movY);
        speedX = 0;
        break;
      case currEvent.screenX == prevEvent.screenX && currEvent.screenY < prevEvent.screenY:
        speedY = -Math.abs(1 * Math.sqrt(movY * movY));
        speedX = 0;
        break;
      case currEvent.screenX > prevEvent.screenX && currEvent.screenY > prevEvent.screenY:
        speedX = 1 * Math.sqrt(movX * movX);
        speedY = 1 * Math.sqrt(movY * movY);
        break;
      case currEvent.screenX < prevEvent.screenX && currEvent.screenY < prevEvent.screenY:
        speedX = -Math.abs(1 * Math.sqrt(movX * movX));
        speedY = -Math.abs(1 * Math.sqrt(movY * movY));
        break;
      case currEvent.screenX > prevEvent.screenX && currEvent.screenY < prevEvent.screenY:
        speedX = 1 * Math.sqrt(movX * movX);
        speedY = -Math.abs(1 * Math.sqrt(movY * movY));
        break;
      case currEvent.screenX < prevEvent.screenX && currEvent.screenY > prevEvent.screenY:
        speedX = -Math.abs(1 * Math.sqrt(movX * movX));
        speedY = 1 * Math.sqrt(movY * movY);
        break;
    }
  }
  
  prevEvent = currEvent;
}

init();
animate();
