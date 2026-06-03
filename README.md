# pxt-animfx

Animation playback with end-event signaling for MakeCode Arcade.

The built-in `animation.runImageAnimation` has no way to tell you when an animation finishes. This extension runs frame-by-frame animations on its own update loop and emits an end event you can subscribe to per sprite.

## Blocks

- `animFX.playAnimation(sprite, frames, intervalMs, loop, name?)` — start an animation. Replaces any animation already running on this sprite. The optional **name** labels the animation so the end/loop events can target it; leave it blank for an unnamed animation.
- `animFX.onAnimationEnd(kind, name, handler)` — runs when a **non-looping** animation finishes naturally on **any sprite of the given SpriteKind**. The handler receives the sprite as an argument. Leave **name** blank to match an animation of any name, or set it to fire only for that named animation. Does **not** fire for looped animations or for animations stopped via `stopAnimation`. Keyed by kind rather than sprite instance so the block can sit at the top of your file and still work — sprite instances don't exist yet when block-emitted code runs at startup.
- `animFX.onAnimationLoop(kind, name, handler)` — runs **each time a looping animation wraps past its last frame and starts over**, on any sprite of the given kind. This is the loop counterpart to `onAnimationEnd` (looping animations never "end", so use this to react once per cycle). Same name-matching rule: blank **name** matches any animation, a set name matches only that one.
- `animFX.stopAnimation(sprite)` — stop any animation on this sprite. Does not fire the end event.
- `animFX.isAnimating(sprite)` — true while an animation is running on this sprite.
- `animFX.flipFrames(frames, axis)` — returns a NEW array of frames cloned from the input with each frame flipped horizontally, vertically, or both. The original frames are untouched, so you can keep both directions side-by-side. Flip once at setup time and reuse the result — don't re-flip on every play call.
- `animFX.combineAnimations(animations)` — concatenates multiple animations into one sequential frame array. The block slot auto-fills with a "create array with" Blockly block; click the **+** on that to add more animation slots. Useful for stringing together "wind up + swing + recover" multi-stage motions. Frames are referenced, not cloned — if you also flip one of the source animations, do that *before* combining.
- `animFX.rotateFrames(frames, deg)` — returns a NEW array of frames cloned from the input with each frame rotated **90°, 180°, or 270° clockwise**. The original frames are untouched. 90° and 270° swap each frame's width and height (a 16×32 sprite becomes 32×16); 180° keeps the same size. There's no built-in image rotation in Arcade, so this walks each frame pixel by pixel — rotate once at setup time and reuse the result, don't re-rotate on every play call.
- `animFX.anchorSprite(sprite, pivot, original)` — after you start a rotated animation, the sprite re-centers because the frame size changed. This nudges the sprite so the chosen **pivot** (center, top, bottom, left, right, or a corner) of the *original* bounding box stays put. Pass the ORIGINAL (un-rotated) frames so it knows the old size, and call it **right after** `playAnimation` (it assumes the sprite is still at the center the original image had).

## Example

```typescript
let s = sprites.create(img`. F F .`, SpriteKind.Player)

animFX.onAnimationEnd(SpriteKind.Player, "attack", function (sprite) {
    game.splash("done!")
    // If you need per-instance behavior, gate it here:
    // if (sprite == myBoss) { ... }
})

// Count how many times the idle loop comes around:
animFX.onAnimationLoop(SpriteKind.Player, "idle", function (sprite) {
    info.changeScoreBy(1)
})

animFX.playAnimation(s, attackFrames, 100, false, "attack")   // fires onAnimationEnd
animFX.playAnimation(s, idleFrames, 100, true, "idle")        // fires onAnimationLoop each cycle
```

### Flipping frames for direction changes

```typescript
let walkRight = [img`...`, img`...`]
let walkLeft = animFX.flipFrames(walkRight, animFX.FlipAxis.Horizontal)

// later, when the player faces left:
animFX.playAnimation(s, walkLeft, 100, true)
```

### Rotating an animation and keeping its feet planted

```typescript
let walkRight = [img`...`, img`...`]          // a 16x32 character, say
let walkUp = animFX.rotateFrames(walkRight, animFX.RotateDegrees.Deg90)

// 90° turns the 16x32 frames into 32x16, so the sprite would otherwise re-center.
// Anchor to "bottom" so the feet stay where they were:
animFX.playAnimation(s, walkUp, 100, true)
animFX.anchorSprite(s, animFX.PivotPoint.Bottom, walkRight)
```

## How the end and loop events work

Internally each animation registers in a tracking list along with its name. A single `game.onUpdate` loop advances frames. When a **non-looping** animation runs past its last frame, it's removed from the list and every `onAnimationEnd` handler whose `kind` matches `sprite.kind` (and whose name matches, or is blank) is invoked with the sprite. When a **looping** animation wraps past its last frame back to frame 0, every matching `onAnimationLoop` handler fires instead — once per cycle. Same shape as `sprites.onOverlap` / `sprites.onCreated`.

Name matching is a simple equality check with a blank-is-wildcard rule: a handler registered with an empty name matches every animation, while a named handler matches only animations played with that exact name.

## Caveats

- Looping animations never fire the **end** event by definition — use `onAnimationLoop` to react each time they come around.
- Manually calling `stopAnimation` does not fire the end or loop event — that's reserved for natural completion/wrapping.
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
