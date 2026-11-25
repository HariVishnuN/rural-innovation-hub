/**
 * Media and Image Utility Functions for Rural Innovation Hub
 * Handles client-side Canvas Base64 compression, URL resolution across environments,
 * and circular initials fallback for inventor avatars.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'https://rural-innovation-hub.onrender.com').replace(/\/+$/, '');

export const KNOWN_AVATARS = {
  'ramesh patel': '/images/avatars/ramesh.jpg',
  'kavita devi': '/images/avatars/kavita.jpg',
  'suresh kumar kannan': '/images/avatars/suresh.jpg',
  'suresh kumar': '/images/avatars/suresh.jpg',
  'ananya sengupta': '/images/avatars/ananya.jpg',
  'vikram deshmukh': '/images/avatars/vikram.jpg',
  'dr. anita roy': '/images/avatars/anita.jpg',
  'dr anita roy': '/images/avatars/anita.jpg',
  'prof. rajesh sharma': '/images/avatars/rajesh.jpg',
  'prof rajesh sharma': '/images/avatars/rajesh.jpg',
  'hari vishnu': '/images/avatars/harivishnu.jpg',
};

/**
 * Resolves media URLs:
 * - If already Base64 (data:image/...) or absolute (http/https), returns as is.
 * - If relative path starting with /uploads/, prepends VITE_API_URL (Render backend).
 * - Otherwise returns path as is (e.g. static /images/... assets).
 */
export const resolveMediaUrl = (url, fallback = '') => {
  if (!url) return fallback;
  const trimmed = String(url).trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE}${trimmed}`;
  }
  return trimmed;
};

/**
 * Extracts 2-letter uppercase initials from an innovator's name (e.g. "Suresh Kumar" -> "SK")
 */
export const getInitials = (name) => {
  if (!name) return 'IN';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Compresses an image file in the browser using HTML5 Canvas:
 * - Resizes to max 800px width/height while preserving aspect ratio.
 * - Encodes as JPEG with 0.7 quality into a Base64 data URL.
 * - Converts SVGs or small documents safely.
 */
export const compressImageToBase64 = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Pass through SVGs as data URLs directly
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean white background for transparent images
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert directly to compressed Base64 JPEG string
        const base64DataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(base64DataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
