# pxt-animfx

Animation playback with end-event signaling for MakeCode Arcade.

The built-in `animation.runImageAnimation` has no way to tell you when an animation finishes. This extension runs frame-by-frame animations on its own update loop and emits an end event you can subscribe to per sprite.

## Blocks

- `animFX.playAnimation(sprite, frames, intervalMs, loop)` — start an animation. Replaces any animation already running on this sprite.
- `animFX.onAnimationEnd(kind, handler)` — runs when an animation finishes naturally on **any sprite of the given SpriteKind**. The handler receives the sprite as an argument. Does **not** fire for looped animations or for animations stopped via `stopAnimation`. Keyed by kind rather than sprite instance so the block can sit at the top of your file and still work — sprite instances don't exist yet when block-emitted code runs at startup.
- `animFX.stopAnimation(sprite)` — stop any animation on this sprite. Does not fire the end event.
- `animFX.isAnimating(sprite)` — true while an animation is running on this sprite.
- `animFX.flipFrames(frames, axis)` — returns a NEW array of frames cloned from the input with each frame flipped horizontally, vertically, or both. The original frames are untouched, so you can keep both directions side-by-side. Flip once at setup time and reuse the result — don't re-flip on every play call.
- `animFX.combineAnimations(animations)` — concatenates an array of animations into one sequential frame array. Useful for stringing together "wind up + swing + recover" or similar multi-stage motions and then playing them as a single animation. Frames are referenced, not cloned — if you also flip one of the source animations, do that *before* combining.

## Example

```typescript
let s = sprites.create(img`. F F .`, SpriteKind.Player)

animFX.onAnimationEnd(SpriteKind.Player, function (sprite) {
    game.splash("done!")
    // If you need per-instance behavior, gate it here:
    // if (sprite == myBoss) { ... }
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

Internally each animation registers in a tracking list. A single `game.onUpdate` loop advances frames and, when a non-looping animation runs past its last frame, removes it from the list and invokes every registered handler whose `kind` matches `sprite.kind`, passing the sprite as the argument. Same shape as `sprites.onOverlap` / `sprites.onCreated`.

## Caveats

- Looping animations never fire the end event by definition.
- Manually calling `stopAnimation` does not fire the end event — that's reserved for natural completion.
- If a sprite is destroyed mid-animation, call `stopAnimation` first; the runner doesn't auto-detect destruction.
- The end-event handler is keyed by sprite kind, not instance. If you have multiple sprites of the same kind animating, the handler fires once for each as they finish — use the `sprite` parameter to distinguish.

## Use as Extension

This repository can be added as an extension in MakeCode.

- Open https://arcade.makecode.com/
- Click `New Project`
- Click `Extensions` under the gearwheel menu
- Search for the URL of this repo

## Supported targets

- for PXT/arcade
