/**
 * Dynamic Client-Side SEO Management Utility for EcoReward
 * Updates document.title, canonical link, meta description, and OpenGraph / Twitter tags
 */

export const updatePageSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage
} = {}) => {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  if (title) {
    document.title = title.includes('EcoReward') ? title : `${title} | EcoReward`;
  }

  // 2. Helper to set or create meta elements
  const setMeta = (name, content, isProperty = false) => {
    if (!content) return;
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      if (isProperty) el.setAttribute('property', name);
      else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Update Standard Meta Description
  if (description) {
    setMeta('description', description);
    setMeta('og:description', description, true);
    setMeta('twitter:description', description);
  }

  // 4. Update Meta Keywords
  if (keywords) {
    setMeta('keywords', keywords);
  }

  // 5. Update OpenGraph and Twitter Titles
  const resolvedTitle = ogTitle || document.title;
  setMeta('og:title', resolvedTitle, true);
  setMeta('twitter:title', resolvedTitle);

  // 6. Update Canonical Link
  if (canonicalUrl) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }

  // 7. Update Preview Image
  if (ogImage) {
    setMeta('og:image', ogImage, true);
    setMeta('twitter:image', ogImage);
  }
};

export default updatePageSEO;
