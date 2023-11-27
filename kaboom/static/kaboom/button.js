function addButton(txt, p, layer) {

	// add a parent background object
	const btn = layer.add([
		rect(240, 80, { radius: 8 }),
		pos(p),
		area(),
		scale(1),
		anchor("center"),
		outline(4, color(hsl2rgb( 0, 0, 0.2))),
	])

	// add a child object that displays the text
	btn.add([
		text(txt, {
			align:"center",
		}),
		anchor("center"),
		color(hsl2rgb(0,0,0.2)),
	])

	// onHoverUpdate() comes from area() component
	// it runs every frame when the object is being hovered
	btn.onHoverUpdate(() => {
		const t = time() * 10
		btn.color = hsl2rgb( 0, 0, 0.9)
		setCursor("pointer")
	})

	// onHoverEnd() comes from area() component
	// it runs once when the object stopped being hovered
	btn.onHoverEnd(() => {
		btn.scale = vec2(1)
		btn.color = rgb()
	})

	return btn

}