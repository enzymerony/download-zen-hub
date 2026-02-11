const HF_API_KEY = "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";

interface CleaningResult {
  originalImage: string;
  cleanedImage: string;
  detectedElements: string[];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function loadImageToCanvas(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function detectObjects(imageFile: File): Promise<any[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/detr-resnet-50",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageFile,
      }
    );
    if (!response.ok) {
      console.warn("Object detection API returned:", response.status);
      return [];
    }
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn("Object detection failed:", error);
    return [];
  }
}

async function removeTextAndWatermarks(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext("2d")!;
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const grayData = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    grayData[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const edgeMap = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -grayData[(y - 1) * width + (x - 1)] + grayData[(y - 1) * width + (x + 1)] +
        -2 * grayData[y * width + (x - 1)] + 2 * grayData[y * width + (x + 1)] +
        -grayData[(y + 1) * width + (x - 1)] + grayData[(y + 1) * width + (x + 1)];
      const gy =
        -grayData[(y - 1) * width + (x - 1)] - 2 * grayData[(y - 1) * width + x] -
        grayData[(y - 1) * width + (x + 1)] + grayData[(y + 1) * width + (x - 1)] +
        2 * grayData[(y + 1) * width + x] + grayData[(y + 1) * width + (x + 1)];
      edgeMap[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  const mask = new Uint8Array(width * height);
  const edgeThreshold = 50;
  for (let i = 0; i < width * height; i++) {
    if (edgeMap[i] > edgeThreshold) mask[i] = 1;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pi = idx * 4;
      const r = data[pi], g = data[pi + 1], b = data[pi + 2];
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);

      let surroundingBrightness = 0, count = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const ni = (ny * width + nx) * 4;
            surroundingBrightness += (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
            count++;
          }
        }
      }
      surroundingBrightness /= count;
      const localContrast = Math.abs(brightness - surroundingBrightness);

      if (localContrast > 40 && saturation < 60) mask[idx] = 1;
      if (localContrast > 15 && localContrast < 40 && saturation < 30) mask[idx] = 1;
    }
  }

  const dilatedMask = new Uint8Array(width * height);
  const dilateRadius = 2;
  for (let y = dilateRadius; y < height - dilateRadius; y++) {
    for (let x = dilateRadius; x < width - dilateRadius; x++) {
      let found = false;
      for (let dy = -dilateRadius; dy <= dilateRadius && !found; dy++) {
        for (let dx = -dilateRadius; dx <= dilateRadius && !found; dx++) {
          if (mask[(y + dy) * width + (x + dx)] === 1) found = true;
        }
      }
      if (found) dilatedMask[y * width + x] = 1;
    }
  }

  const resultData = new Uint8ClampedArray(data);
  for (let pass = 0; pass < 5; pass++) {
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = y * width + x;
        if (dilatedMask[idx] === 1) {
          let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
          const sampleRadius = 5 + pass * 2;
          for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
            for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const ni = ny * width + nx;
                if (dilatedMask[ni] === 0) {
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const weight = 1 / (1 + dist * dist);
                  totalR += resultData[ni * 4] * weight;
                  totalG += resultData[ni * 4 + 1] * weight;
                  totalB += resultData[ni * 4 + 2] * weight;
                  totalWeight += weight;
                }
              }
            }
          }
          if (totalWeight > 0) {
            const pi = idx * 4;
            resultData[pi] = Math.round(totalR / totalWeight);
            resultData[pi + 1] = Math.round(totalG / totalWeight);
            resultData[pi + 2] = Math.round(totalB / totalWeight);
          }
        }
      }
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx] === 1) {
        const pi = idx * 4;
        let avgR = 0, avgG = 0, avgB = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ni = ((y + dy) * width + (x + dx)) * 4;
            avgR += resultData[ni]; avgG += resultData[ni + 1]; avgB += resultData[ni + 2];
            count++;
          }
        }
        resultData[pi] = Math.round(avgR / count);
        resultData[pi + 1] = Math.round(avgG / count);
        resultData[pi + 2] = Math.round(avgB / count);
      }
    }
  }

  const resultImageData = new ImageData(resultData, width, height);
  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = width;
  resultCanvas.height = height;
  resultCanvas.getContext("2d")!.putImageData(resultImageData, 0, 0);
  return resultCanvas;
}

async function aiCleanImage(imageFile: File): Promise<string | null> {
  const models = [
    "google/maxim-s3-denoising-sidd",
    "microsoft/bringing-old-photos-back-to-life",
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${HF_API_KEY}` },
            body: imageFile,
          }
        );

        if (response.status === 503) {
          console.warn(`Model ${model} is loading, retrying in 20s...`);
          await new Promise((r) => setTimeout(r, 20000));
          continue;
        }

        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }

        console.warn(`Model ${model} returned ${response.status}`);
        break;
      } catch (error) {
        console.warn(`Model ${model} failed:`, error);
        break;
      }
    }
  }
  return null;
}

export async function cleanImage(file: File): Promise<CleaningResult> {
  const originalBase64 = await fileToBase64(file);
  const detectedElements: string[] = [];

  const objects = await detectObjects(file);
  if (objects.length > 0) {
    objects.forEach((obj: any) => {
      if (obj.label) {
        detectedElements.push(`Detected: ${obj.label} (${Math.round((obj.score || 0) * 100)}%)`);
      }
    });
  }

  const cleanedImageUrl = await aiCleanImage(file);
  if (cleanedImageUrl) {
    detectedElements.push("✅ AI-powered cleaning applied");
    return { originalImage: originalBase64, cleanedImage: cleanedImageUrl, detectedElements };
  }

  detectedElements.push("🔧 Using advanced canvas-based cleaning");
  const canvas = await loadImageToCanvas(originalBase64);
  const cleanedCanvas = await removeTextAndWatermarks(canvas);
  const cleanedBase64 = cleanedCanvas.toDataURL("image/png", 1.0);
  detectedElements.push("✅ Text & watermark removal applied");
  detectedElements.push("✅ Edge smoothing applied");

  return { originalImage: originalBase64, cleanedImage: cleanedBase64, detectedElements };
}

export async function quickCleanImage(file: File): Promise<CleaningResult> {
  const originalBase64 = await fileToBase64(file);
  const canvas = await loadImageToCanvas(originalBase64);
  const cleanedCanvas = await removeTextAndWatermarks(canvas);
  const cleanedBase64 = cleanedCanvas.toDataURL("image/png", 1.0);

  return {
    originalImage: originalBase64,
    cleanedImage: cleanedBase64,
    detectedElements: ["✅ Quick text removal applied", "✅ Quick watermark removal applied"],
  };
}
