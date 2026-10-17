export interface ImageResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputType?: "image/jpeg" | "image/png" | "image/webp";
}

export async function imageToBase64(
    file: File,
    options: ImageResizeOptions = {}
): Promise<string> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        outputType = "image/jpeg",
    } = options;

    const image = await loadImage(file);

    let { width, height } = image;

    // Không resize nếu ảnh đã đủ nhỏ
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(
            maxWidth / width,
            maxHeight / height
        );

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Cannot create canvas context");
    }

    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    return canvas.toDataURL(
        outputType,
        quality
    );
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        const url = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Cannot load image"));
        };

        image.src = url;
    });
}