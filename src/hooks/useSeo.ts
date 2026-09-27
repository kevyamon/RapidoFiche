import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
}

const BASE_URL = 'https://rapidofiche.com';
const SITE_NAME = 'RapidoFiche';

export const useSeo = ({ title, description, canonicalPath, ogType = 'website' }: SeoProps) => {
  useEffect(() => {
    // 1. Titre de page
    const formattedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = formattedTitle;

    // 2. Méta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }
    }

    // 3. Titre Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', formattedTitle);
    }

    // 4. URL Canonique & Open Graph URL
    const fullUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : window.location.href;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', fullUrl);
    }

    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) {
      ogTypeMeta.setAttribute('content', ogType);
    }
  }, [title, description, canonicalPath, ogType]);
};
