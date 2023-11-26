kaboom({
	width: 1000,
	height: 600,
	debug: true,
	global: true,
	background: [135, 206, 235],
});

const kentucky_animation_speed = 4;

loadRoot("static/kaboom/images/");
loadSprite("kentucky", "kentucky spritesheet.png", {
	sliceX: 18,
	anims: {
		walk: { from: 0, to: 3, loop: true, speed: kentucky_animation_speed },
		jump_charge: {
			from: 4,
			to: 7,
			loop: true,
			speed: kentucky_animation_speed,
		},
		max_jump_charge: {
			from: 8,
			to: 11,
			loop: true,
			speed: kentucky_animation_speed,
		},
		jump: { from: 0, to: 0, loop: true, speed: kentucky_animation_speed },
		glide: { from: 12, to: 13, loop: true, speed: kentucky_animation_speed },
	},
});

const fox_animation_speed = 8;

loadSprite("fox", "fox/fox spritesheet.png", {
	sliceX: 2,
	anims: {
		walk: {
			from: 0,
			to: 1,
			loop: true,
			speed: fox_animation_speed,
		},
	},
});
loadSprite("redfox", "fox/redfox spritesheet.png", {
	sliceX: 2,
	anims: {
		walk: {
			from: 0,
			to: 1,
			loop: true,
			speed: fox_animation_speed,
		},
	},
});

// food
const worm_animation_speed = 5;


loadSprite("banana", "food/banana.png");
loadSprite("strawberry", "food/strawberry.png");
loadSprite("worm", "food/worm spritesheet.png", {
	sliceX: 2,
	anims: {
		walk: {
			from: 0,
			to: 1,
			loop: true,
			speed: worm_animation_speed,
		},
		static1: {
			from: 0,
			to: 0,
			loop: false,
			speed: 1,
		},
		static1: {
			from: 1,
			to: 1,
			loop: false,
			speed: 1,
		},
	},
});


const floor_height = 30;
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

function physics() {
	let acc_y = 0;
	let is_air = false;
	let gliding = false;

	let jump_charge = 0;
	let jump_charge_maxed = false;
	let wait_till_ground = false;

	const base_jump_amplifier = 1.1;
	const base_jump_force_amplifier = 6.5;
	const base_jump_extra_amplifier = 1.1;
	const jump_charge_max_time = 2.5;
	const jump_charge_extra = 20;

	const base_gravity_amplifier = 60;
	const base_gliding_gravity_amplifier = 10;
	let gravity_amplifier = base_gravity_amplifier;
	return {
		update() {
			if (this.pos.y > floor_y) {
				this.pos.y = floor_y;
			} else {
				//on or above ground

				// gravity logic
				const gravity_time = gravity_amplifier * dt();

				this.pos.y = Math.min(floor_y, this.pos.y + acc_y * gravity_time);

				// above ground
				if (this.pos.y < floor_y) {
					acc_y += gravity_time;;
				} else {
					//on ground
					if (is_air) {
						is_air = false;
						stop_n_animate(this, "walk");
						if (gliding) {
							this.stop_glide();
						}
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
		jump(force = Math.floor(jump_charge), extra = jump_charge_extra) {
			force *= base_jump_amplifier * base_jump_force_amplifier;
			extra *= base_jump_amplifier * base_jump_extra_amplifier;
			if (this.pos.y === floor_y) {
				acc_y = -(force + extra);
			}
			is_air = true;
			jump_charge = 0;
			jump_charge_maxed = false;

			stop_n_animate(this, "jump");
		},
		glide_or_charge_jump() {
			if (!is_air) {
				stop_n_animate(this, "jump_charge");
				this.charge_jump();
			} else {
				wait_till_ground = true;
				gliding = true;
				gravity_amplifier = base_gliding_gravity_amplifier;
				stop_n_animate(this, "glide");
			}
		},
		charge_jump() {
			if (this.charged_jump_is_max()) {
				!jump_charge_maxed && stop_n_animate(this, "max_jump_charge");
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
			return this.is_grounded() && jump_charge === 0; // TODO && not crouched
		},
		stop_glide() {
			glide = false;
			gravity_amplifier = base_gravity_amplifier;
			is_air && stop_n_animate(this, "jump");
		},
	};
}

function scale_for_image(base, desired) {
	return desired / base;
}


const base_kentucky_image_height = 175;
const scale_for_kentucky = scale_for_image(base_kentucky_image_height, 875);

const kentucky_speed = 250; //basically just the speed of "static" objects to make kentucky look moving

const player = add([
	sprite("kentucky", {
		anim: "walk",
	}),
	pos(width() - 75, floor_y - 200),
	area(),
	physics(),
	scale(scale_for_kentucky),
	anchor("botright"),
	"player",
	"kentucky",
	{
		dir: LEFT,
		dead: false,
	},
]);

player.onCollide("food", (f) => {
	f.destroy();
	// TODO add health
	// player.heal();
});

player.onCollide("bad", (b) => {
	// TODO remove and make player invisible for short period of time
	b.destroy();
	// TODO hurt
	// player.hurt();
});

onKeyPress("space", () => {
	player.glide_or_charge_jump();
});

onKeyRelease("space", () => {
	player.dont_wait_till_ground();
	player.stop_glide();
	player.jump();
});

function move_obstacle(
	speed = get_kentucky_speed(),
	wiggle = false,
	wiggle_height = 20,
	wiggle_speed = 35,
	base_y = floor_y
) {
	let killed = false;
	let wiggle_up = true;
	return {
		update() {
			if (!killed) {
				this.move(speed, 0);
				if (this.pos.x > width() + 400) {
					// plus 400 just because of image width so it doesnt go away before it goes offscreen
					this.destroy();
				}
				if (wiggle) {
					m = wiggle_up ? -wiggle_speed : wiggle_speed;
					this.move(0, m);
					gap = base_y - this.pos.y;
					if (gap > wiggle_height) {
						wiggle_up = false;
					}
					if (gap <= 0 && !wiggle_up) {
						wiggle_up = true;
					}
				}
			}
		},
		killed() {
			killed = true;
		},
	};
}

function stop_n_animate(
	obj,
	sprite_animation_name = "walk",
	speed = kentucky_animation_speed
) {
	// obj.stop();
	return animate(obj, sprite_animation_name, speed);
}

function animate(
	obj,
	sprite_animation_name = "walk",
	speed = kentucky_animation_speed
) {
	return obj.play(sprite_animation_name, {
		speed: speed,
	});
}
function short_animation(obj, anim1, anim2, duration = 156, condition) {
	if (condition()) {
		stop_n_animate(obj, anim1);
	}
	setTimeout(() => {
		if (condition()) {
			stop_n_animate(obj, anim2);
		}
	}, duration);
}

function summonFood(
	sprite_function = () => sprite("banana"),
	move_function = () => move_obstacle(get_kentucky_speed(), true)
) {
	const food = add([
		sprite_function(),
		pos(0, floor_y),
		anchor("botleft"),
		area(),
		scale(3.5),
		move_function(),
		"food",
		"good",
		{
			dir: RIGHT,
		},
	]);
	return food;
}

function summonFox() {
	const foxes_to_redfoxes = 50;
	const is_red_fox = chance(1 / foxes_to_redfoxes);

	const base_extra_speed_amplifier = 1.2;
	const max_speed = 1000;

	const base_fox = [
		pos(0, floor_y),
		anchor("botright"),
		move_obstacle(
			Math.min(get_kentucky_speed(base_extra_speed_amplifier), max_speed)
		),
		area(),
		scale(3.5),
		"bad",
		"fox",
		"ground",
		{
			dir: RIGHT,
			dead: false,
		},
	];

	if (is_red_fox) {
		return add([
			sprite("redfox", { anim: "walk" }),
			"redfox",
			"rare",
			...base_fox,
		]);
	} else {
		return add([sprite("fox", { anim: "walk" }), ...base_fox]);
	}
}



let score = 0;

function get_kentucky_speed(amplifier = 1) {
	const kentucky_slow_rate = 100;
	const kentucky_max_speed = 950;
	return (
		Math.min(
			kentucky_max_speed,
			kentucky_speed + kentucky_speed * (score / 10 / kentucky_slow_rate)
		) * amplifier
	);
}

let add_food_every = 600;
let skip_food = 1;

const change_food_dur_max = 600;
const change_food_change_max = 400;

let add_bad_every = 50; //meaning how often a obs is created, in this case every 50 loops so every 5 seconds
let skip_bad = 2;

const change_bad_change_max = 256;
const change_bad_dur_min = 12;

const loop_animate = 5;

const food = [
	() => summonFood(() => sprite("banana")),
	() => summonFood(() => sprite("strawberry")),
	() =>
		summonFood(
			() => sprite("worm", { anim: "walk" }),
			() => move_obstacle(get_kentucky_speed(1.3))
		),
];


const obs_manipulation = setInterval(() => {
	if (score % add_bad_every === 0) {
		if (skip_bad) {
			skip_bad--;
		} else {
			// making duration less as you play more to summon foxes
			if (
				score %
					Math.min(change_bad_change_max, add_bad_every * add_bad_every) ===
				0
			) {
				add_bad_every = Math.max(add_bad_every + 1);
				skip_bad = choose([1, 1, 2, 2, 3]);
			}

			summonFox();
		}
	}
	if (score % add_food_every === 0) {
		if (skip_food) {
			skip_food--;
		} else {
			// making duration less as you play more to summon foxes
			if (
				score %
					Math.min(change_food_change_max, add_food_every * add_food_every) ===
				0
			) {
				add_food_every = Math.min(add_food_every + 1, change_food_dur_max);
				skip_food = choose([1, 1, 1, 1, 2, 2, 3]);
			}

			choose(food)();
		}
	}


	score++;
}, 100);
