kaboom({
    width: 1000,
    height: 600,
    debug: true,
    global:true,
    background: [135, 206, 235],
});

/* window.addEventListener('resize', () => {
    kaboom.setCanvasDimensions(window.innerWidth, window.innerHeight * 0.5);
  }); */

// loadRoot("static/kaboom/")
loadRoot("static/kaboom/images/")
loadSprite("kentucky", "kentucky.png")
loadSprite("kentucky1", "kentucky1.png")
loadSprite("kentucky2", "kentucky2.png")
loadSprite("fox", "fox.png")


const floor_height = 40

const floor =add([
  pos(0, height()-floor_height),
  rect(width(), floor_height),
  area(),
  color(120,120,120),
  body({ isStatic: true }),
])

const kentucky_image_height = 175

setGravity(1000)

function gravity() {
  let acc_y = 0;
  let jump_charge = 0;
  const jump_charge_max = 10
  return {
    update() {
      const floor_y = height()-floor_height
      if (this.pos.y > floor_y) {
        this.pos.y = floor_y
      }
      else {
        this.pos.y = Math.min(floor_y, this.pos.y + acc_y)
        if (this.pos.y < floor_y) {
          acc_y++
        }
      }
      if (jump_charge) {
        this.charge_jump()
      }
    },
    jump(force=Math.floor(jump_charge/2), extra=15) {
      const floor_y = height()-floor_height
      if (this.pos.y === floor_y) {
        acc_y = -(force+extra)
      }
      jump_charge = 0
    },

    charge_jump() {
      if (jump_charge>jump_charge_max) {
        return jump_charge
      }
      return ++jump_charge
    },
    charged_jump_is_max() {
      return jump_charge >= jump_charge_max
    }
  }
}

const player = add([
  sprite("kentucky1"),
  pos(width()-75, height()-floor_height-200),
  area(),
  gravity(),
  scale(5),
  anchor("botright"),
  {
    dir: LEFT,
    dead: false,
},
]);

onKeyPress("space", () => {
  player.charge_jump()
})

onKeyRelease("space", () => {
  player.jump();

});






onUpdate("bad", (b) => {
  b.move(440,0)
  if (b.pos.x>width()+400) {
  b.destroy()

  }
})



function addFox() {
  return add([
    sprite("fox"),
    pos(0, height()-floor_height),
    anchor("botright"),
    area(),
    scale(0.35),
    "bad",
    {
      dir: RIGHT,
      dead: false,
    }
  ])
}

function random_boolean_with_weight(weight) {
  const random_weight = Math.min(weight/10, 0.8) * 0.5
  const random_decimal = Math.random()
  return Math.random() < random_weight
}

let weight = 6;

const object_creation = setInterval(() => {
  weight+=0.08
  if (random_boolean_with_weight(weight) && random_boolean_with_weight(weight) && random_boolean_with_weight(weight) && random_boolean_with_weight(weight) && random_boolean_with_weight(weight) && random_boolean_with_weight(weight)) {
    addFox()
  }
}, 100)