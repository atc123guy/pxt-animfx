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

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    animFX.stopAnimation(player)
})
