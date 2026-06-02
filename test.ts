// Sandbox project for the animFX extension. Press A to play a blink animation.
// When it finishes naturally, a splash fires from the onAnimationEnd handler.

let player = sprites.create(img`
    . F F F F .
    F F F F F F
    F F F F F F
    . F F F F .
`, SpriteKind.Player)

controller.moveSprite(player)

let blinkFrames = [
    img`
        . F F F F .
        F F F F F F
        F F F F F F
        . F F F F .
    `,
    img`
        . F F F F .
        F . F F . F
        F F F F F F
        . F F F F .
    `,
    img`
        . F F F F .
        F F F F F F
        F . F F . F
        . F F F F .
    `
]

let blinkFramesFlippedH = animFX.flipFrames(blinkFrames, animFX.FlipAxis.Horizontal)
let blinkFramesFlippedV = animFX.flipFrames(blinkFrames, animFX.FlipAxis.Vertical)

animFX.onAnimationEnd(SpriteKind.Player, function (sprite) {
    game.splash("blink done")
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, blinkFrames, 150, false)
    }
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, blinkFramesFlippedH, 150, false)
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, blinkFramesFlippedV, 150, false)
    }
})

let comboFrames = animFX.combineAnimations([blinkFrames, blinkFramesFlippedH])

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, comboFrames, 150, false)
    }
})

// Rotation: build a rotated variant for each quarter turn, exercising every RotateDegrees value.
let blinkRot90 = animFX.rotateFrames(blinkFrames, animFX.RotateDegrees.Deg90)
let blinkRot180 = animFX.rotateFrames(blinkFrames, animFX.RotateDegrees.Deg180)
let blinkRot270 = animFX.rotateFrames(blinkFrames, animFX.RotateDegrees.Deg270)

// Press R: play the 90° rotated animation, then keep the bottom edge planted.
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, blinkRot90, 150, true)
        animFX.anchorSprite(player, animFX.PivotPoint.Bottom, blinkFrames)
    }
})

// Menu: cycle through the 180°/270° variants to confirm they round-trip.
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!animFX.isAnimating(player)) {
        animFX.playAnimation(player, blinkRot180, 150, false)
        animFX.playAnimation(player, blinkRot270, 150, false)
        animFX.anchorSprite(player, animFX.PivotPoint.Center, blinkFrames)
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    animFX.stopAnimation(player)
})
