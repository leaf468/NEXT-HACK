import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL with CORS prevention
 * @param {File} file - The file to upload
 * @param {string} path - Storage path where the file will be stored (e.g. 'images/profile.jpg')
 * @returns {Promise<string>} - Promise that resolves to the download URL
 */
export const uploadFileAndGetUrl = async (file, path) => {
  try {
    const storage = getStorage();
    
    // Create a storage reference with the specified path
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('업로드 완료:', path);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    // Add cache-busting parameter to prevent CORS issues
    const corsProtectedUrl = `${downloadUrl}&t=${Date.now()}`;
    
    console.log('다운로드 URL:', corsProtectedUrl);
    return corsProtectedUrl;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Uploads multiple files to Firebase Storage and returns their download URLs
 * @param {Array<File>} files - Array of files to upload 
 * @param {string} basePath - Base storage path where files will be stored
 * @returns {Promise<Array<string>>} - Promise that resolves to array of download URLs
 */
export const uploadMultipleFiles = async (files, basePath) => {
  try {
    const uploadPromises = files.map((file, index) => {
      // Generate a unique path for each file using timestamp and index
      const filename = `${Date.now()}_${index}_${file.name}`;
      const path = `${basePath}/${filename}`;
      
      return uploadFileAndGetUrl(file, path);
    });
    
    // Wait for all uploads to complete
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload failed:', error);
    throw error;
  }
};