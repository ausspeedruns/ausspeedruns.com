/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
	if (!url) return "";

	if (cacheTag && cacheTag !== "") {
		cacheTag = encodeURIComponent(cacheTag);
	}

	// Check if URL already has http/https protocol
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return cacheTag ? `${url}?${cacheTag}` : url;
	}

	// For local media, return relative URL so next/image can optimize it without HTTP fetch issues
	return cacheTag ? `${url}?${cacheTag}` : url;
};
