const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getImageUrl(imageUrl) {
  if (!imageUrl?.startsWith('/uploads/')) return imageUrl;
  return new URL(imageUrl, new URL(API_URL).origin).toString();
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('farmers-mart-token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}
