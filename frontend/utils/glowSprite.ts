export function makeGlowSprite(size = 256): string {
    // Generate the red glow spirit for each point
    const c = document.createElement("canvas");
    c.width = c.height = size;

    const ctx = c.getContext("2d")!;
    const grd = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );

    grd.addColorStop(0.00, "rgba(255,0,0,1.0)");
    grd.addColorStop(0.10, "rgba(255,0,0,0.8)");
    grd.addColorStop(0.30, "rgba(255,0,0,0.5)");
    grd.addColorStop(1.00, "rgba(255,0,0,0.0)");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    return c.toDataURL();
}
