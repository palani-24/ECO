/**
 * Utility helper to handle user avatar image URLs cleanly and safely.
 */

export const getAvatarUrl = (userOrImage, name = 'User') => {
  let image = '';
  let displayName = name;

  if (typeof userOrImage === 'string') {
    image = userOrImage;
  } else if (userOrImage && typeof userOrImage === 'object') {
    image = userOrImage.profileImage || userOrImage.avatar || '';
    if (userOrImage.name) displayName = userOrImage.name;
  }

  if (!image || typeof image !== 'string' || image.trim() === '') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=10b981&color=fff`;
  }

  // If image URL is a relative backend path starting with /uploads
  if (image.startsWith('/uploads')) {
    const backendHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
    return `${backendHost}${image}`;
  }

  return image;
};

/**
 * Image error handler to catch broken image URLs and fallback smoothly to UI Avatars
 */
export const handleAvatarError = (e, name = 'User') => {
  if (e && e.target) {
    e.target.onerror = null; // Prevent infinite loop if fallback fails
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=10b981&color=fff`;
  }
};
