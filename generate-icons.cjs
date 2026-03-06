// Quick script to generate simple DialPro icons as data URI PNGs
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

function createPNG(size) {
    // Create a minimal valid PNG with a gold "D" on dark background
    // Using raw pixel approach for a simple colored square

    const { createCanvas } = (() => {
        try { return require('canvas'); } catch { return { createCanvas: null }; }
    })();

    if (!createCanvas) {
        // Fallback: create a minimal 1-color PNG manually
        // This creates a valid PNG with solid color
        return createMinimalPNG(size);
    }
}

function createMinimalPNG(size) {
    // PNG file structure for a simple colored icon
    // We'll create a basic bitmap manually
    const zlib = require('zlib');

    const width = size;
    const height = size;

    // Create raw pixel data (RGBA)
    const pixels = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // Create a rounded-corner gold "D" shape on dark bg
            const cx = width / 2;
            const cy = height / 2;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const radius = width * 0.42;
            const innerRadius = width * 0.30;

            if (dist <= radius) {
                if (dist <= innerRadius) {
                    // Inner dark circle
                    pixels[idx] = 0x14;     // R
                    pixels[idx + 1] = 0x14; // G
                    pixels[idx + 2] = 0x14; // B
                    pixels[idx + 3] = 0xFF; // A

                    // Draw "D" letter area (simplified: just make the inner ring gold)
                } else {
                    // Gold ring
                    pixels[idx] = 0xF0;     // R
                    pixels[idx + 1] = 0xA5; // G
                    pixels[idx + 2] = 0x00; // B
                    pixels[idx + 3] = 0xFF; // A
                }
            } else {
                // Transparent
                pixels[idx] = 0;
                pixels[idx + 1] = 0;
                pixels[idx + 2] = 0;
                pixels[idx + 3] = 0;
            }
        }
    }

    // Build PNG
    // Add filter byte (0 = None) at start of each row
    const rawData = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        rawData[y * (1 + width * 4)] = 0; // filter type: None
        pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
    }

    const compressed = zlib.deflateSync(rawData);

    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type: RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const ihdrChunk = createChunk('IHDR', ihdr);
    const idatChunk = createChunk('IDAT', compressed);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);

    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
const iconsDir = path.join(__dirname, 'public', 'icons');

[16, 48, 128].forEach((size) => {
    const png = createMinimalPNG(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
    console.log(`Created icon${size}.png`);
});

console.log('Done!');
