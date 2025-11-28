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
 */
export function constructAuthorAvatarUrl(userImg: string | null): string | undefined {
  if (!userImg || userImg === "none.png") return undefined;
  if (userImg.startsWith("http://") || userImg.startsWith("https://")) {
    return userImg;
  }
  // Handle new uploads path
  if (userImg.startsWith("uploads/")) {
    return `/${userImg}`;
  }
  return `/images/${userImg}`;
}

