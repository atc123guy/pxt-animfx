# pxt-animfx

Animation playback with end-event signaling for MakeCode Arcade.

The built-in `animation.runImageAnimation` has no way to tell you when an animation finishes. This extension runs frame-by-frame animations on its own update loop and emits an end event you can subscribe to per sprite.

## Blocks

- `animFX.playAnimation(sprite, frames, intervalMs, loop)` — start an animation. Replaces any animation already running on this sprite.
- `animFX.onAnimationEnd(sprite, handler)` — runs when an animation finishes naturally on this sprite. Does **not** fire for looped animations or for animations stopped via `stopAnimation`.
- `animFX.stopAnimation(sprite)` — stop any animation on this sprite. Does not fire the end event.
- `animFX.isAnimating(sprite)` — true while an animation is running on this sprite.
- `animFX.flipFrames(frames, axis)` — returns a NEW array of frames cloned from the input with each frame flipped horizontally, vertically, or both. The original frames are untouched, so you can keep both directions side-by-side. Flip once at setup time and reuse the result — don't re-flip on every play call.

## Example

```typescript
let s = sprites.create(img`. F F .`, SpriteKind.Player)

animFX.onAnimationEnd(s, function () {
    game.splash("done!")
})

animFX.playAnimation(s, myFrames, 100, false)
```

### Flipping frames for direction changes

```typescript
let walkRight = [img`...`, img`...`]
let walkLeft = animFX.flipFrames(walkRight, animFX.FlipAxis.Horizontal)

// later, when the player faces left:
animFX.playAnimation(s, walkLeft, 100, true)
```

## How the end event works

Internally each animation registers in a tracking list. A single `game.onUpdate` loop advances frames and, when a non-looping animation runs past its last frame, removes it from the list and calls `control.raiseEvent(ANIM_END_SRC, sprite.id)`. The `onAnimationEnd` block wires a `control.onEvent` handler keyed to that same sprite id.

## Caveats

- Looping animations never fire the end event by definition.
- Manually calling `stopAnimation` does not fire the end event — that's reserved for natural completion.
- If a sprite is destroyed mid-animation, call `stopAnimation` first; the runner doesn't auto-detect destruction in v1.
- Sprite ids may be reused if a sprite is destroyed and another created. Avoid relying on end events for sprites that get destroyed mid-animation.

## Use as Extension

This repository can be added as an extension in MakeCode.

- Open https://arcade.makecode.com/
- Click `New Project`
- Click `Extensions` under the gearwheel menu
- Search for the URL of this repo

## Supported targets

- for PXT/arcade
