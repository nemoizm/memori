/**
 * Cloudinary utility functions for image management
 *
 * This module provides functions to:
 * - Generate Cloudinary URLs with transformations
 * - Check if an image URL is from Cloudinary
 * - Build optimized image URLs
 */

export interface CloudinaryConfig {
	cloudName: string;
	apiKey?: string;
	apiSecret?: string;
}

export interface CloudinaryImageOptions {
	width?: number;
	height?: number;
	format?: "auto" | "webp" | "jpg" | "png" | "avif";
	quality?: "auto" | number;
	crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
	gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
	fetchFormat?: "auto" | "webp" | "jpg" | "png";
	loading?: "lazy" | "eager";
}

/**
 * Get Cloudinary configuration from environment variables
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
	const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;

	if (!cloudName) {
		return null;
	}

	return {
		cloudName,
		apiKey: import.meta.env.CLOUDINARY_API_KEY,
		apiSecret: import.meta.env.CLOUDINARY_API_SECRET,
	};
}

/**
 * Check if Cloudinary is enabled
 */
export function isCloudinaryEnabled(): boolean {
	return !!import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
	return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/**
 * Build a Cloudinary URL with transformations
 * Based on Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
 *
 * @param publicId - The public ID of the image (e.g., "galleries/gallery1/image1" - without extension)
 * @param options - Transformation options
 * @returns The Cloudinary URL
 */
export function buildCloudinaryUrl(
	publicId: string,
	options: CloudinaryImageOptions = {},
): string {
	const config = getCloudinaryConfig();
	if (!config) {
		throw new Error("Cloudinary is not configured");
	}

	const cleanPublicId = publicId.startsWith("/") ? publicId.slice(1) : publicId;

	const transformations: string[] = [];

	if (options.width) transformations.push(`w_${options.width}`);
	if (options.height) transformations.push(`h_${options.height}`);
	if (options.crop) transformations.push(`c_${options.crop}`);
	if (options.gravity) transformations.push(`g_${options.gravity}`);

	if (options.quality) {
		transformations.push(
			options.quality === "auto" ? "q_auto" : `q_${options.quality}`,
		);
	}

	// ⚠️ QUAN TRỌNG: KHÔNG dùng f_auto nếu public_id có extension
	if (options.format && options.format !== "auto") {
		transformations.push(`f_${options.format}`);
	}

	const transformStr =
		transformations.length > 0 ? `${transformations.join(",")}/` : "";

	return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformStr}${cleanPublicId}`;
}

/**
 * Build an optimized Cloudinary URL for thumbnails
 * Uses limit crop to preserve aspect ratio
 */
export function buildCloudinaryThumbnailUrl(
	publicId: string,
	width = 400,
	height?: number,
): string {
	return buildCloudinaryUrl(publicId, {
		width,
		height,
		crop: "limit", // Preserve aspect ratio
		quality: "auto",
		format: "auto",
	});
}

/**
 * Build a Cloudinary URL without transformations (original size)
 * Returns URL in format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
 * Cloudinary will automatically serve the original image at its actual dimensions
 */
export function buildCloudinaryOriginalUrl(publicId: string): string {
	const config = getCloudinaryConfig();
	if (!config) {
		throw new Error("Cloudinary is not configured");
	}

	const cleanPublicId = publicId.startsWith("/") ? publicId.slice(1) : publicId;

	// KHÔNG transform – giữ nguyên extension
	return `https://res.cloudinary.com/${config.cloudName}/image/upload/${cleanPublicId}`;
}

/**
 * Build an optimized Cloudinary URL for full-size images
 */
export function buildCloudinaryFullUrl(
	publicId: string,
	maxWidth = 2400,
): string {
	return buildCloudinaryUrl(publicId, {
		width: maxWidth,
		crop: "limit",
		quality: "auto",
	});
}

/**
 * Convert a local image path to Cloudinary public ID
 *
 * Note: Some images may have been uploaded with extension, some without.
 * Cloudinary URLs can work with or without extension in the path.
 * We keep the extension to match actual URLs that work.
 *
 * @param localPath - Local path like "content/galleries/gallery1/image.jpg", "galleries/gallery1/image.jpg", or "../../content/galleries/gallery1/image.jpg"
 * @returns Cloudinary public ID like "galleries/gallery1/image.jpg" (with extension to match actual URLs)
 */
export function localPathToCloudinaryPublicId(localPath: string): string {
	// Normalize path separators
	let publicId = localPath.replace(/\\/g, "/");

	// Extract the galleries/... part from the path
	// Handle paths like: ../../content/galleries/gallery1/image.jpg
	// Or: content/galleries/gallery1/image.jpg
	// Or: galleries/gallery1/image.jpg
	const galleriesMatch = publicId.match(/(?:^|\/)(galleries\/.+)$/);
	if (galleriesMatch) {
		publicId = galleriesMatch[1];
	} else {
		// Fallback: remove common prefixes
		publicId = publicId.replace(/^src\//, "").replace(/^content\//, "");

		// Ensure it starts with "galleries/"
		if (!publicId.startsWith("galleries/")) {
			publicId = `galleries/${publicId}`;
		}
	}

	// Keep file extension to match actual Cloudinary URLs
	// URLs from Cloudinary include extension: galleries/gallery5/IMG_4945.jpg
	return publicId;
}

/**
 * Get Cloudinary public ID from a full Cloudinary URL
 */
export function getPublicIdFromCloudinaryUrl(url: string): string | null {
	const match = url.match(/\/upload\/(?:[^/]+\/)*(.+)$/);
	return match ? match[1] : null;
}

/**
 * Get image metadata (dimensions) from Cloudinary
 * Uses Cloudinary's API to fetch image information
 */
export async function getCloudinaryImageMetadata(
	publicId: string,
): Promise<{ width: number; height: number } | null> {
	const config = getCloudinaryConfig();
	if (!config || !config.apiKey || !config.apiSecret) {
		// If API credentials not available, return null
		// Dimensions will be fetched client-side
		return null;
	}

	try {
		// Use Cloudinary Admin API to get resource info
		// Note: This requires API credentials
		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload/${publicId}`,
			{
				headers: {
					Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`,
				},
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return {
			width: data.width || 800,
			height: data.height || 600,
		};
	} catch {
		return null;
	}
}

/**
 * List all images in a Cloudinary folder
 * Uses Cloudinary Admin API to fetch resources
 *
 * @param folderPath - Folder path like "galleries/gallery1"
 * @returns Array of image resources with public_id, width, height, etc.
 */
export async function listCloudinaryImages(folderPath: string): Promise<
	Array<{
		public_id: string;
		width: number;
		height: number;
		format: string;
		bytes: number;
		url: string;
		secure_url: string;
	}>
> {
	const config = getCloudinaryConfig();
	if (!config || !config.apiKey || !config.apiSecret) {
		throw new Error(
			"Cloudinary API credentials are required to list images. Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
		);
	}

	try {
		// Normalize folder path (ensure it ends with / for prefix search)
		const prefix = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;

		// Use Cloudinary Admin API to list resources by prefix
		// Documentation: https://cloudinary.com/documentation/admin_api#get_resources
		// This works for images uploaded with folder option (script upload)
		// where public_id includes the folder path
		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload?prefix=${encodeURIComponent(prefix)}&max_results=500`,
			{
				headers: {
					Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`,
				},
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to list Cloudinary images: ${response.status} ${errorText}`,
			);
		}

		const data = await response.json();
		const resources = data.resources || [];

		// If no resources found with prefix, try to list all and filter by folder structure
		// This handles cases where images are uploaded manually but public_id doesn't include folder path
		// However, this is less efficient, so we only do it if prefix search returns nothing
		if (resources.length === 0) {
			// Try listing resources in the folder using the folder path directly
			// For manual uploads, Cloudinary might store them differently
			// Note: This is a fallback - ideally images should be uploaded with correct folder structure
			console.warn(
				`No images found with prefix "${prefix}". This might indicate images were uploaded manually without folder structure in public_id.`,
			);
		}

		return resources;
	} catch (error) {
		throw error;
	}
}

/**
 * Build a Cloudinary URL that preserves aspect ratio
 * Uses 'limit' or 'fit' crop mode instead of 'fill'
 */
export function buildCloudinaryThumbnailUrlPreserveAspect(
	publicId: string,
	maxWidth = 800,
	maxHeight?: number,
): string {
	return buildCloudinaryUrl(publicId, {
		width: maxWidth,
		height: maxHeight,
		crop: "limit", // Preserve aspect ratio, limit to max dimensions
		quality: "auto",
		format: "auto",
	});
}
