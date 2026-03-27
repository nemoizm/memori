# 🌸 Memori

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen) 
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue) 
![Tailwind CSS v3](https://img.shields.io/badge/Tailwind_CSS-v3-38bdf8?logo=tailwind-css)

A static photo gallery website built with [Astro](https://astro.build). Inspired from [Fuwari](https://github.com/saicaca/fuwari).

> **Note:** This theme uses **Tailwind CSS v3** (not Tailwind v4). This is an intentional choice to maintain compatibility with the current configuration.

You can find the official Astro theme here:  
https://astro.build/themes/details/a-static-photo-gallery-template-built-with-astro/

[**🖥️ Live Demo (Github Pages)**](https://codewithnemo.github.io/memori)

All images from Unsplash

![Preview Image](./src/assets/images/demo.png)

## ✨ Features

- [x] Built with [Astro](https://astro.build) and [Tailwind CSS v3](https://tailwindcss.com) (Note: This theme uses Tailwind CSS v3, not Tailwind v4)
- [x] Smooth animations and page transitions
- [x] Light / dark mode
- [x] Customizable theme colors & banner
- [x] Responsive design
- [x] Photo gallery with timeline view
- [x] Image lightbox with [Fancybox](https://fancyapps.com/)
- [x] Cloudinary integration for image storage and optimization
- [x] Automatic image optimization and transformation
- [x] Gallery metadata (location, camera, date)

## 🚀 Getting Started

1. Clone this repository:
   ```sh
   git clone https://github.com/codewithnemo/memori.git
   cd memori
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```
   - Install [pnpm](https://pnpm.io) `npm install -g pnpm` if you haven't.

3. Set up Cloudinary:
   - Sign up for a free account at [Cloudinary](https://cloudinary.com/)
   - Get your Cloudinary credentials from the dashboard
   - Create a `.env` file in the project root with the following variables:
     ```env
     PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
     Or use the `CLOUDINARY_URL` format:
     ```env
     CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
     ```

4. Edit the config file `src/config.ts` to customize your gallery website.

5. Create a new gallery:
   ```sh
   pnpm new-gallery <gallery-name>
   ```
   This creates a gallery entry in `src/content/galleries/<gallery-name>/index.md`.

6. Upload images to Cloudinary:
   - Add your images to a local folder (e.g., `galleries/<gallery-name>/`)
   - Upload them to Cloudinary using the upload script:
     ```sh
     pnpm upload-cloudinary <gallery-name>
     ```
     Or upload all galleries:
     ```sh
     pnpm upload-cloudinary
     ```
   - Or upload manually via Cloudinary dashboard to the folder `galleries/<gallery-name>/`

7. Deploy your gallery to Vercel, Netlify, GitHub Pages, etc. following [the guides](https://docs.astro.build/en/guides/deploy/). 
   - Remember to set the Cloudinary environment variables in your deployment platform
   - Edit the site configuration in `astro.config.mjs` before deployment

## 📝 Frontmatter of Galleries

Create a gallery by running:
```sh
pnpm new-gallery <gallery-name>
```

Or manually create a folder in `src/content/galleries/` with an `index.md` file:

```yaml
---
title: My Gallery Title
published: 2026-01-01
description: Description of this gallery
image: cover.jpg  # Optional: cover image filename from Cloudinary (or leave empty to use first image)
location: "City, Country"  # Optional
camera: "Canon EOS R5"  # Optional
---
```

**Important:** Images are stored on Cloudinary, not locally. Upload images to Cloudinary in the folder `galleries/<gallery-name>/`. The gallery will automatically fetch and display all images from the corresponding Cloudinary folder.

### Uploading Images to Cloudinary

1. **Using the upload script (recommended):**
   - Place your images in a local folder (e.g., `galleries/<gallery-name>/`)
   - Run: `pnpm upload-cloudinary <gallery-name>` (or `pnpm upload-cloudinary` to upload all galleries)
   - Images will be uploaded to Cloudinary with the correct folder structure

2. **Manual upload via Cloudinary Dashboard:**
   - Upload images to Cloudinary
   - Ensure they are in the folder `galleries/<gallery-name>/`
   - The `public_id` should include the folder path (e.g., `galleries/gallery1/image.jpg`)

## ⚡ Commands

All commands are run from the root of the project, from a terminal:

| Command                                         | Action                                              |
|:------------------------------------------------|:----------------------------------------------------|
| `pnpm install`                                  | Installs dependencies                               |
| `pnpm dev`                                      | Starts local dev server at `localhost:4321`         |
| `pnpm build`                                    | Build your production site to `./dist/`             |
| `pnpm preview`                                  | Preview your build locally, before deploying        |
| `pnpm check`                                    | Run checks for errors in your code                  |
| `pnpm format`                                   | Format your code using Biome                        |
| `pnpm new-gallery <name>`                       | Create a new gallery                                |
| `pnpm upload-cloudinary [name]`                 | Upload images to Cloudinary (optionally for a specific gallery) |
| `pnpm upload-cloudinary`                        | Upload all galleries to Cloudinary                  |
| `pnpm convert-heic`                             | Convert HEIC images to JPEG                         |
| `pnpm delete-heic`                              | Delete HEIC images                                  |
| `pnpm astro ...`                                | Run CLI commands like `astro add`, `astro check`    |
| `pnpm astro --help`                             | Get help using the Astro CLI                        |

## 📄 License

This project is licensed under the MIT License.
