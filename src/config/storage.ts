// Supabase Storage configuration

export const STORAGE_BASE_URL = 'https://bydkzxqmgsvsnjtafphj.supabase.co/storage/v1/object/public/Repository%20Bucket';

// Transform local image path to Supabase Storage URL
// e.g., '/images/projects/X25RB00-immersive/tmclark-ocean.jpeg'
// -> 'https://bydkzxqmgsvsnjtafphj.supabase.co/storage/v1/object/public/Repository%20Bucket/X25RB00-immersive/x25rb00-tmclark-ocean.jpeg'
export function getStorageUrl(localPath: string): string {
  // If already a full URL, return as-is
  if (localPath.startsWith('http')) {
    return localPath;
  }

  // Extract project folder and filename from path like '/images/projects/X25RB00-immersive/filename.jpg'
  const match = localPath.match(/\/images\/projects\/(X\d{2}RB\d{2}-[^/]+)\/(.+)/i);

  if (!match) {
    // Not a project image, return original path
    return localPath;
  }

  const [, projectFolder, originalFilename] = match;

  // Get project prefix (lowercase): X25RB00-immersive -> x25rb00
  const projectPrefix = projectFolder.split('-')[0].toLowerCase();

  // Transform filename: add prefix, lowercase, hyphens instead of underscores/spaces
  let newFilename = originalFilename.toLowerCase();

  // If filename doesn't already have the prefix, add it
  if (!newFilename.startsWith(projectPrefix)) {
    newFilename = `${projectPrefix}-${newFilename}`;
  }

  // Clean up the filename
  newFilename = newFilename
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');

  return `${STORAGE_BASE_URL}/projects/${projectFolder}/${newFilename}`;
}

// For backward compatibility - check if image exists locally, otherwise use storage
export function getImageUrl(localPath: string, useStorage = true): string {
  if (useStorage) {
    return getStorageUrl(localPath);
  }
  return localPath;
}
