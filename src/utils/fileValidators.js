const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates file type and size.
 * @param {File} file - The file to validate.
 * @returns {{isValid: boolean, error: string|null}}
 */
export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are allowed.' 
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { 
      isValid: false, 
      error: 'File size exceeds 5MB limit. Please upload a smaller file.' 
    };
  }

  return { isValid: true, error: null };
}
