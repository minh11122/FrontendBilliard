//src/utils/cloudinary
export const uploadImages = async (files, setUploading) => {
  if (!files || files.length === 0) {
    console.error("Không có file");
    return [];
  }

  setUploading(true);
  try {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", "giftme");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqh0zio2c/image/upload",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await res.json();
      if (!data.secure_url) {
        throw new Error(`Upload thất bại cho ảnh ${file.name}`);
      }
      return data.secure_url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter((url) => url && url.trim());
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    setUploading(false);
  }
};