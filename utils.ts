export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/png;base64, prefix if needed, but for now we keep it to display
      // When sending to API we slice it.
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return await fileToBase64(new File([blob], "image.png", { type: blob.type }));
  } catch (e) {
    console.warn("CORS fetch failed, trying proxy or canvas fallback", e);
    // Fallback: If fetch fails due to CORS, we can't easily get the base64 in a pure frontend app without a proxy.
    // However, for this demo, we assume the provided images are accessible or we use a simple handling.
    // We return the URL itself if we can't convert, but the API call will fail if it's not base64.
    // In a real app, use a backend proxy.
    // For this specific demo, we will attempt to return a placeholder or throw.
    throw new Error("Unable to load image due to cross-origin restrictions. Please upload a local file.");
  }
};

export const stripBase64Prefix = (base64: string): string => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};
