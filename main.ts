/**
 * Animation playback with end-event signaling.
 */
//% color=#7B68EE icon="" block="animFX"
namespace animFX {
    class AnimState {
        sprite: Sprite
        frames: Image[]
        intervalMs: number
        loop: boolean
        frameIdx: number
        nextFrameAt: number
    }

    let active: AnimState[] = []
    let handlerKinds: number[] = []
    let handlerFns: ((sprite: Sprite) => void)[] = []
    let driverInstalled = false

    function fireEnd(sprite: Sprite) {
        const k = sprite.kind()
        for (let i = 0; i < handlerKinds.length; i++) {
            if (handlerKinds[i] === k) {
                handlerFns[i](sprite)
            }
        }
    }

    function installDriver() {
        if (driverInstalled) return
        driverInstalled = true
        game.onUpdate(function () {
            const now = game.runtime()
            for (let i = active.length - 1; i >= 0; i--) {
                const s = active[i]
                if (now < s.nextFrameAt) continue
                s.frameIdx++
                if (s.frameIdx >= s.frames.length) {
                    if (s.loop) {
                        s.frameIdx = 0
                    } else {
                        active.removeAt(i)
                        fireEnd(s.sprite)
                        continue
                    }
                }
                s.sprite.setImage(s.frames[s.frameIdx])
                s.nextFrameAt = now + s.intervalMs
            }
        })
    }

    /**
     * Play an image-frame animation on a sprite.
     * @param sprite the sprite to animate
     * @param frames the frames of the animation
     * @param intervalMs milliseconds between frames
     * @param loop whether to loop the animation
     */
    //% block="play animation on $sprite=variables_get(mySprite) frames $frames every $intervalMs ms loop $loop"
    //% intervalMs.defl=100
    //% loop.defl=false
    //% weight=100
    export function playAnimation(sprite: Sprite, frames: Image[], intervalMs: number, loop: boolean) {
        if (!sprite || !frames || frames.length === 0) return
        stopAnimation(sprite)
        installDriver()
        const s = new AnimState()
        s.sprite = sprite
        s.frames = frames
        s.intervalMs = intervalMs
        s.loop = loop
        s.frameIdx = 0
        s.nextFrameAt = game.runtime() + intervalMs
        sprite.setImage(frames[0])
        active.push(s)
    }

    /**
     * Run code when an animation finishes naturally on any sprite of the given kind.
     * Does NOT fire for looped animations or for animations stopped via stopAnimation.
     */
    //% block="on $sprite of kind $kind=spritekind animation ended"
    //% draggableParameters="reporter"
    //% weight=90
    export function onAnimationEnd(kind: number, handler: (sprite: Sprite) => void) {
        installDriver()
        handlerKinds.push(kind)
        handlerFns.push(handler)
    }

    /**
     * Stop any animation currently running on the sprite. Does not fire the end event.
     */
    //% block="stop animation on $sprite=variables_get(mySprite)"
    //% weight=80
    export function stopAnimation(sprite: Sprite) {
        if (!sprite) return
        for (let i = active.length - 1; i >= 0; i--) {
            if (active[i].sprite === sprite) {
                active.removeAt(i)
            }
        }
    }

    /**
     * Returns true while an animation is running on the sprite.
     */
    //% block="is $sprite=variables_get(mySprite) animating"
    //% weight=70
    export function isAnimating(sprite: Sprite): boolean {
        if (!sprite) return false
        for (const s of active) {
            if (s.sprite === sprite) return true
        }
        return false
    }

    export enum FlipAxis {
        //% block="horizontal"
        Horizontal,
        //% block="vertical"
        Vertical,
        //% block="both"
        Both
    }

    /**
     * Return a new array of frames cloned from the input with each frame flipped on the chosen axis.
     * The original frames are not modified.
     */
    //% block="flip frames $frames $axis"
    //% weight=60
    export function flipFrames(frames: Image[], axis: FlipAxis): Image[] {
        const out: Image[] = []
        if (!frames) return out
        for (let i = 0; i < frames.length; i++) {
            const c = frames[i].clone()
            if (axis === FlipAxis.Horizontal || axis === FlipAxis.Both) c.flipX()
            if (axis === FlipAxis.Vertical || axis === FlipAxis.Both) c.flipY()
            out.push(c)
        }
        return out
    }

    /**
     * Concatenate multiple animations into a single frame sequence that plays each in order.
     * Returns a new array; the source animations are not modified.
     * The block defaults to a "create array with" slot; click the + on that to add more animations.
     */
    //% block="combine animations $animations"
    //% animations.shadow="lists_create_with"
    //% weight=55
    export function combineAnimations(animations: Image[][]): Image[] {
        const out: Image[] = []
        if (!animations) return out
        for (let i = 0; i < animations.length; i++) {
            const arr = animations[i]
            if (!arr) continue
            for (let j = 0; j < arr.length; j++) {
                out.push(arr[j])
            }
        }
        return out
    }

    export enum RotateDegrees {
        //% block="90° clockwise"
        Deg90,
        //% block="180°"
        Deg180,
        //% block="270° clockwise"
        Deg270
    }

    function rotateOne(src: Image, deg: RotateDegrees): Image {
        // 180° keeps the same dimensions: flip on both axes.
        if (deg === RotateDegrees.Deg180) {
            const c = src.clone()
            c.flipX()
            c.flipY()
            return c
        }
        // 90°/270° swap width and height. New canvas starts fully transparent (color 0).
        const w = src.width
        const h = src.height
        const dst = image.create(h, w)
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const col = src.getPixel(x, y)
                if (!col) continue
                if (deg === RotateDegrees.Deg90) {
                    dst.setPixel(h - 1 - y, x, col)
                } else {
                    dst.setPixel(y, w - 1 - x, col)
                }
            }
        }
        return dst
    }

    /**
     * Return a new animation with every frame rotated by 90/180/270 degrees clockwise.
     * 90° and 270° swap each frame's width and height. The original frames are not modified.
     * Pair with "anchor sprite" to keep a chosen edge planted after the size change.
     */
    //% block="rotate frames $frames by $deg"
    //% frames.shadow="lists_create_with"
    //% weight=58
    export function rotateFrames(frames: Image[], deg: RotateDegrees): Image[] {
        const out: Image[] = []
        if (!frames) return out
        for (let i = 0; i < frames.length; i++) {
            out.push(rotateOne(frames[i], deg))
        }
        return out
    }

    export enum PivotPoint {
        //% block="center"
        Center,
        //% block="top"
        Top,
        //% block="bottom"
        Bottom,
        //% block="left"
        Left,
        //% block="right"
        Right,
        //% block="top-left"
        TopLeft,
        //% block="top-right"
        TopRight,
        //% block="bottom-left"
        BottomLeft,
        //% block="bottom-right"
        BottomRight
    }

    function pivotX(left: number, w: number, pivot: PivotPoint): number {
        if (pivot === PivotPoint.Left || pivot === PivotPoint.TopLeft || pivot === PivotPoint.BottomLeft) return left
        if (pivot === PivotPoint.Right || pivot === PivotPoint.TopRight || pivot === PivotPoint.BottomRight) return left + w
        return left + w / 2
    }

    function pivotY(top: number, h: number, pivot: PivotPoint): number {
        if (pivot === PivotPoint.Top || pivot === PivotPoint.TopLeft || pivot === PivotPoint.TopRight) return top
        if (pivot === PivotPoint.Bottom || pivot === PivotPoint.BottomLeft || pivot === PivotPoint.BottomRight) return top + h
        return top + h / 2
    }

    /**
     * Reposition a sprite so the chosen pivot point stays put after its frames were rotated.
     * Call this right after starting a rotated animation, passing the ORIGINAL (un-rotated)
     * frames so the helper knows the old size. Example: rotate a tall sprite 90° with pivot
     * "bottom" and its feet stay planted instead of the sprite re-centering.
     */
    //% block="anchor $sprite=variables_get(mySprite) at $pivot using original frames $original"
    //% original.shadow="lists_create_with"
    //% weight=52
    export function anchorSprite(sprite: Sprite, pivot: PivotPoint, original: Image[]): void {
        if (!sprite || !original || original.length === 0) return
        const ow = original[0].width
        const oh = original[0].height
        const oldLeft = sprite.x - ow / 2
        const oldTop = sprite.y - oh / 2
        const oldX = pivotX(oldLeft, ow, pivot)
        const oldY = pivotY(oldTop, oh, pivot)
        const newX = pivotX(sprite.left, sprite.width, pivot)
        const newY = pivotY(sprite.top, sprite.height, pivot)
        sprite.x += oldX - newX
        sprite.y += oldY - newY
    }
}
