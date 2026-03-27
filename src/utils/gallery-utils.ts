import { getCollection } from "astro:content";
import {
	buildCloudinaryThumbnailUrl,
	listCloudinaryImages,
	localPathToCloudinaryPublicId,
} from "./cloudinary-utils";

export type GalleryInfo = {
	slug: string;
	name: string;
	title: string;
	imageCount: number;
	published: Date;
	description: string;
	image: string;
	tags: string[];
	location: string;
};

export async function getGalleries(): Promise<GalleryInfo[]> {
	// Get gallery entries from content collections
	const galleryEntries = await getCollection("galleries");
	const localImageModules = import.meta.glob(
		"../content/galleries/**/*.{jpg,jpeg,png,webp,avif,gif}",
		{ eager: true },
	) as Record<string, { default: { src: string } }>;

	// Process galleries in parallel for better performance
	const galleryPromises = galleryEntries.map(async (entry) => {
		// Extract slug from id: "gallery1/index" -> "gallery1"
		const slug = entry.id.replace(/\/index$/, "");
		const localImages = Object.entries(localImageModules)
			.filter(([path]) => path.includes(`/content/galleries/${slug}/`))
			.sort(([a], [b]) => a.localeCompare(b));

		// Get images from Cloudinary API
		const folderPath = `galleries/${slug}`;
		let cloudinaryImages: Array<{
			public_id: string;
			width: number;
			height: number;
			format: string;
			url: string;
			secure_url: string;
		}> = [];
		let cloudinaryImageCount = 0;
		let firstImageUrl = "";

		try {
			cloudinaryImages = await listCloudinaryImages(folderPath);
			cloudinaryImageCount = cloudinaryImages.length;
		} catch {
			cloudinaryImages = [];
		}

		// Sort images by public_id to get first image consistently
		if (cloudinaryImages.length > 0) {
			cloudinaryImages.sort((a, b) => a.public_id.localeCompare(b.public_id));
			firstImageUrl = buildCloudinaryThumbnailUrl(
				cloudinaryImages[0].public_id,
				600,
				400,
			);
		}

		const localImageCount = localImages.length;
		const firstLocalImageUrl = localImages[0]?.[1]?.default?.src || "";
		const imageCount = cloudinaryImageCount + localImageCount;

		// Use cover image from metadata if available, otherwise use first image from Cloudinary
		let finalImagePath = entry.data.image || "";

		if (finalImagePath && !finalImagePath.startsWith("http")) {
			const explicitLocalImage = localImages.find(([path]) =>
				path.endsWith(`/${finalImagePath}`),
			)?.[1]?.default?.src;

			if (explicitLocalImage) {
				finalImagePath = explicitLocalImage;
			} else {
				const publicId = localPathToCloudinaryPublicId(
					`galleries/${slug}/${finalImagePath}`,
				);
				finalImagePath = buildCloudinaryThumbnailUrl(publicId, 600, 400);
			}
		} else if (!finalImagePath) {
			finalImagePath = firstLocalImageUrl || firstImageUrl;
		}

		return {
			slug,
			name: slug,
			title: entry.data.title,
			imageCount,
			published: entry.data.published,
			description: entry.data.description || "",
			image: finalImagePath,
			tags: entry.data.tags || [],
			location: entry.data.location || "",
		};
	});

	// Wait for all galleries to be processed in parallel
	const results = await Promise.all(galleryPromises);

	// Sort by published date (newest first)
	results.sort((a, b) => b.published.getTime() - a.published.getTime());

	return results;
}

export type GalleryForList = {
	slug: string;
	data: {
		title: string;
		tags: string[];
		published: Date;
		location?: string;
	};
};

export async function getSortedGalleriesList(): Promise<GalleryForList[]> {
	const galleries = await getGalleries();

	return galleries.map((gallery) => ({
		slug: gallery.slug,
		data: {
			title: gallery.title,
			tags: gallery.tags,
			published: gallery.published,
			location: gallery.location || undefined,
		},
	}));
}
