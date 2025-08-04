import api from "@/api";

/**
 * Compresses an image file using browser APIs (canvas).
 * @param file Image file (must be from browser, not React Native)
 * @param quality Output quality (0..1)
 * @param maxWidth Resize to max width if larger
 * @returns Compressed image as Blob
 */
export function compressImage(
  file: File,
  quality: number = 0.7,
  maxWidth: number = 1024
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;

      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        const width = img.width * scale;
        const height = img.height * scale;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas not supported");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject("Compression failed");
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress, then upload an image to GCS using the backend signed URL endpoint.
 * @returns The final public URL
 */
export async function compressAndUploadImage(
  file: File,
  backendBaseUrl: string
): Promise<string> {
  const compressedBlob = await compressImage(file, 0.7, 1024);

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const fullPath = `product-image/${filename}`;
  const compressedFile = new File([compressedBlob], fullPath, {
    type: "image/jpeg",
  });

  const { data } = await api.get(`/upload/generateUploadURL`, {
    params: { filename: fullPath, contentType: "image/jpeg" },
    withCredentials: true,
  });

  const uploadRes = await fetch(data.url, {
    method: "PUT",
    headers: {
      "Content-Type": "image/jpeg",
    },
    body: compressedFile,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error("Upload to GCS failed:", errorText);
    throw new Error("GCS Upload failed");
  }

  return data.publicUrl;
}

/**
 * Compress image and get both the file and upload URLs (for multi-step workflow).
 */
export async function compressImageAndPrepareUpload(
  file: File,
  backendBaseUrl: string
): Promise<{ file: File; url: string; publicUrl: string }> {
  const compressedBlob = await compressImage(file, 0.7, 1024);

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const fullPath = `product-image/${filename}`;
  const compressedFile = new File([compressedBlob], fullPath, {
    type: "image/jpeg",
  });

  const { data } = await api.get(`/upload/generateUploadURL`, {
    params: { filename: fullPath, contentType: "image/jpeg" },
    withCredentials: true,
  });

  return {
    file: compressedFile,
    url: data.url,
    publicUrl: data.publicUrl,
  };
}

/**
 * Upload any image or file to GCS using a signed URL (step 2/2 for multi-step workflow).
 */
export async function uploadToGCS(
  signedUrl: string,
  file: File
): Promise<void> {
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/jpeg",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error("Upload to GCS failed:", errorText);
    throw new Error("GCS Upload failed");
  }
}

/**
 * Upload bulk product sheet to GCS, returns public URL and file path.
 */
export async function uploadBulkSheetToGCS(
  file: File,
  backendBaseUrl: string
): Promise<{ publicUrl: string; filePath: string }> {
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = `bulk-upload-sheet/${filename}`;

  const { data } = await api.get(`/upload/generateUploadURL`, {
    params: {
      filename: filePath,
      contentType: file.type || "application/octet-stream",
    },
    withCredentials: true,
  });

  const uploadRes = await fetch(data.url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error("❌ Bulk sheet upload failed:", errorText);
    throw new Error(`Upload failed: ${errorText}`);
  }

  return {
    publicUrl: data.publicUrl,
    filePath,
  };
}

/**
 * Get a signed upload URL from backend and its public URL.
 */
export async function getSignedUploadUrl(
  filePath: string,
  fileType: string,
  backendBaseUrl: string
): Promise<{ url: string; publicUrl: string }> {
  const { data } = await api.get(`/upload/generateUploadURL`, {
    params: {
      filename: filePath,
      contentType: fileType || "application/octet-stream",
    },
    withCredentials: true,
  });
  return data;
}

/**
 * Upload any file to a signed URL.
 */
export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  fileType: string
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": fileType },
    body: file,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Upload to GCS failed:", errorText);
    throw new Error("Upload failed");
  }
}
