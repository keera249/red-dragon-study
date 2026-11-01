const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export function validateUploadedImageFile(input: FileValidationInput): {
  valid: boolean;
  error?: string;
  safeFileName?: string;
} {
  if (!input || !input.fileName) {
    return { valid: false, error: 'File name is required.' };
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size must be between 1 byte and 5 MB.' };
  }

  if (!ALLOWED_MIME_TYPES.has(input.mimeType.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file type. Only JPEG, PNG, and WebP images are permitted.',
    };
  }

  const lowerName = input.fileName.toLowerCase();
  const dotIdx = lowerName.lastIndexOf('.');
  if (dotIdx === -1) {
    return { valid: false, error: 'File must have a valid image extension (.jpg, .png, .webp).' };
  }

  const ext = lowerName.slice(dotIdx);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp.' };
  }

  // Prevent double extensions or executable patterns (e.g. shell.php.jpg)
  const basePart = lowerName.slice(0, dotIdx);
  if (/\.(php|exe|sh|bat|cmd|js|html|svg)$/i.test(basePart)) {
    return { valid: false, error: 'Suspicious file name rejected.' };
  }

  const cleanBase = basePart.replace(/[^a-z0-9_-]/g, '-').slice(0, 60) || 'image';
  const safeFileName = `${Date.now()}-${cleanBase}${ext}`;

  return { valid: true, safeFileName };
}
