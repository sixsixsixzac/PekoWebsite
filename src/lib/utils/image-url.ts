/**
 * Constructs image URL from path
 */
export function constructImageUrl(path: string | null, defaultPath: string): string {
  if (!path) return defaultPath;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return defaultPath.includes("post_img") 
    ? `/images/post_img/${path}`
    : `/images/${path}`;
}

/**
 * Constructs author avatar URL
 * Handles both new uploads path and legacy avatar paths
 */
export function constructAuthorAvatarUrl(userImg: string | null): string | undefined {
  if (!userImg) return undefined;
  
  // Check for invalid/missing avatar indicators
  if (
    userImg === "none.png" ||
    userImg === "avatars/none.png" ||
    userImg.includes("none.png") ||
    userImg.trim() === ""
  ) {
    return undefined;
  }
  
  // If it's already a full URL, return as-is
  if (userImg.startsWith("http://") || userImg.startsWith("https://")) {
    return userImg;
  }
  
  // Handle new uploads path (uploads/avatars/...)
  if (userImg.startsWith("uploads/")) {
    return `/${userImg}`;
  }
  
  // Handle legacy paths that start with "avatars/"
  if (userImg.startsWith("avatars/")) {
    // Try uploads first (new location), then fall back to images (legacy)
    return `/uploads/${userImg}`;
  }
  
  // Handle legacy avatar filenames (just filename without path)
  // If it looks like an avatar filename (starts with "avatar_" or is a short random string)
  // and doesn't contain a path separator, assume it's in uploads/avatars/
  if (!userImg.includes("/") && !userImg.includes("\\")) {
    // Check if it looks like an avatar filename
    const isAvatarFilename = 
      userImg.startsWith("avatar_") ||
      userImg.match(/^[A-Z0-9]{8,}\.(jpg|jpeg|png|webp)$/i) !== null; // Random string filenames
    
    if (isAvatarFilename) {
      return `/uploads/avatars/${userImg}`;
    }
  }
  
  // Default: try images path (legacy location)
  return `/images/${userImg}`;
}

