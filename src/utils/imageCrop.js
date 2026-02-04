// src/utils/imageCrop.jsx

// Helper: Tạo ảnh từ URL
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

// Helper: Crop ảnh thành File
export const getCroppedImg = async (
  imageSrc,
  pixelCrop,
  fileName = "cropped.jpg",
  fileType = "image/jpeg"
) => {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(pixelCrop.width);
    canvas.height = Math.round(pixelCrop.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Không thể tạo context canvas.");
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Không thể tạo blob từ canvas.");
          }
          resolve(new File([blob], fileName, { type: fileType }));
        },
        fileType,
        1
      );
    });
  } catch (error) {
    console.error("[Lỗi crop ảnh]", error);
    throw new Error("Có lỗi xảy ra khi crop ảnh.");
  }
};

// Helper: Chuyển file thành data URL
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không thể đọc file."));
    reader.readAsDataURL(file);
  });
};