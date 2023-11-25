kaboom({
	width: 1000,
	height: 600,
	debug: true,
	global: true,
	background: [135, 206, 235],
});

loadRoot("static/kaboom/images/");
loadSprite("kentucky", "kentucky spritesheet.png", {
	sliceX: 15,
	anims: {
		walk: { from: 0, to: 3 },
		jump_charge: { from: 4, to: 7 },
		max_jump_charge: { from: 8, to: 11 },
		jump: { from: 0, to: 0 },
    glide: { from: 12, to: 13 },
    eat: { from: 14, to: 14 },
	},
});
// loadSprite("fox", "fox.png")
loadSprite("fox", "fox spritesheet.png", {
	sliceX: 2,
	anims: {
		walk: {
			from: 0,
			to: 1,
		},
	},
});


//food
loadSprite("banana", "food/banana.png")

const floor_height = 40;
// TODO when resized // actually maybe not needed
const floor_y = height() - floor_height;

const floor = add([
	pos(0, floor_y),
	rect(width(), floor_height),
	area(),
	color(120, 120, 120),
	body({ isStatic: true }),
]);

setGravity(1000);

function gravity() {
	let acc_y = 0;
	let is_air = false;
  let gliding = false;

	let jump_charge = 0;
	let jump_charge_maxed = false;
  let wait_till_ground = false;

	const base_jump_amplifier = 1.1;
	const base_jump_force_amplifier = 6.5;
	const base_jump_extra_amplifier = 1;
	const jump_charge_max_time = 2.5;
	const jump_charge_extra = 20;

	const base_gravity_amplifier = 60;
  const base_gliding_gravity_amplifier = 10;
  let gravity_amplifier = base_gravity_amplifier
	return {
		update() {
			if (this.pos.y > floor_y) { //below ground
				this.pos.y = floor_y;
			} else { //on or above ground
        
        // gravity logic
				this.pos.y = Math.min(
					floor_y,
					this.pos.y + acc_y * gravity_amplifier * dt()
				);

        // above ground
				if (this.pos.y < floor_y) {
					acc_y++;
				} else {
          if (is_air) {
            if (gliding) {
              gliding = false;
              gravity_amplifier = base_gravity_amplifier
            }
            stop_n_animate(this, kentucky_animation_speed, "walk");
            is_air = false;
          }
          if (wait_till_ground) {
            wait_till_ground = false;
            this.glide_or_charge_jump();
          }
				}
			}
			if (jump_charge) {
				this.charge_jump();
			}
		},
		jump(
			force = Math.floor(jump_charge),
			extra = jump_charge_extra,
			amplifier = 1
		) {
			force *= amplifier * base_jump_amplifier * base_jump_force_amplifier;
			extra *= amplifier * base_jump_amplifier * base_jump_extra_amplifier;
			if (this.pos.y === floor_y) {
				acc_y = -(force + extra);
			}
			is_air = true;
			jump_charge = 0;
			jump_charge_maxed = false;

			stop_n_animate(this, kentucky_animation_speed, "jump");
		},
		glide_or_charge_jump() {
			if (!is_air) {
				stop_n_animate(this, kentucky_animation_speed, "jump_charge");
				this.charge_jump();
			} else {
				wait_till_ground = true;
        gliding = true;
        gravity_amplifier = base_gliding_gravity_amplifier
        stop_n_animate(this, kentucky_animation_speed, "glide");
			}
		},
		charge_jump() {
			if (this.charged_jump_is_max()) {
				!jump_charge_maxed &&
					stop_n_animate(this, kentucky_animation_speed, "max_jump_charge");
				jump_charge_maxed = true;
			} else {
				jump_charge = jump_charge + dt();
			}
			return jump_charge;
		},
		charged_jump_is_max() {
			return jump_charge >= jump_charge_max_time;
		},
    dont_wait_till_ground() {
      wait_till_ground = false;
    },
    is_grounded() {
      return !is_air; 
    },
    is_normal() {
      return this.is_grounded() && jump_charge === 0 // TODO && not crouched
    },
    stop_glide() {
      glide = false
      gravity_amplifier = base_gravity_amplifier
      stop_n_animate(this, kentucky_animation_speed, "jump");
    }
	};
}

function scale_for_image(base, desired) {
	return desired / base;
}

const base_kentucky_image_height = 175;
const scale_for_kentucky = scale_for_image(base_kentucky_image_height, 875);

const kentucky_speed = 250; //basically just the speed of "static" objects to make kentucky look moving
const kentucky_animation_speed = 4;

const player = add([
	sprite("kentucky"),
	pos(width() - 75, floor_y - 200),
	area(),
	gravity(),
	scale(scale_for_kentucky),
	anchor("botright"),
  "player",
  "kentucky",
	{
		dir: LEFT,
		dead: false,
	},
]);

animate(player, kentucky_animation_speed);

onCollide("player", "food", (p,f) => {
  f.destroy();
  if (p.is_normal()) {
  stop_n_animate(p, 0.5, "eat")
  }
  setTimeout(() => {
    if (p.is_normal()) {
      stop_n_animate(p, kentucky_animation_speed, "walk")
    }
  }, 156)

})

onKeyPress("space", () => {
	player.glide_or_charge_jump();
});

onKeyRelease("space", () => {
  player.dont_wait_till_ground();
  player.stop_glide();
	player.jump();
});

onUpdate("bad", (b) => {
	b.move(600, 0);
	if (b.pos.x > width() + 400) {
		b.destroy();
	}
});

function move_obstacle(speed = kentucky_speed, bad=false, flying = false, wiggle = false) {
  let killed=false;
	return {
    update() {
      if (!killed) {this.move(speed,0);
      if (this.pos.x> width() + 400) {// plus 400 just because of image width so it doesnt go away before it goes offscreen
        this.destroy();
      }}
    },
    killed() {
      killed=true
    }
  }
}

function stop_n_animate(obj, speed = 3.5, sprite_animation_name = "walk") {
	obj.stop();
	return animate(obj, speed, sprite_animation_name);
}

function animate(obj, speed = 3.5, sprite_animation_name = "walk") {
	return obj.play(sprite_animation_name, {
		loop: true, // Enable looping
		speed: speed, // Speed of animation (150ms interval)
	});
}

function summonFox() {
	const fox = add([
		sprite("fox"),
		pos(0, floor_y),
		anchor("botright"),
		area(),
		scale(3.5),
		"bad",
		{
			dir: RIGHT,
			dead: false,
		},
	]);
	animate(fox);
	return fox;
}
function summonFood(animate_funciton=null) {
	const food = add([
		sprite("banana"),
		pos(0, floor_y),
		anchor("botright"),
		area(),
		scale(3.5),
    move_obstacle(),
		"food",
		"good",
		{
			dir: RIGHT,
		},
	]);
	animate_funciton && animate_funciton();
	return food;
}



let loop_count = 1;
let loop_add = 45; //meaning how often a obs is created, in this case every 16 loops

const loop_change_add_max = 256;
const loop_change_add_min = 12;

const loop_animate = 5;

const obs_manipulation = setInterval(() => {
	if (loop_count % loop_add === 0) {
		// making duration less as you play more to summon foxes
		if (loop_count % Math.min(loop_change_add_max, loop_add * loop_add) === 0) {
			loop_add = Math.max(loop_add - 1, loop_change_add_min);
		}
		summonFood();
	}

	if (loop_count % loop_animate === 0) {
		let animate_type = loop_count % (loop_animate * 2) === 0;
		// every("two_animate", (obj) => {
		//   obj.use(sprite(obj.two_animate_base + animate_type ? '1' : '2'))
		// })
	}

	loop_count++;
}, 100);
