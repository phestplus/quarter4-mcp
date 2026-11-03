---
name: visuals
description: Create visuals for sales and seasonal content: niche-specific photo and video shot lists, image-generation prompts sized for each platform (Midjourney, GPT Image, Imagen, Flux), free licensed stock photos with attribution, carousel outlines, and short-form video scripts for Reels, TikTok, Shorts and WhatsApp Status. Use when the user asks for images, photos, graphics, thumbnails, a video script, storyboard or Reel idea.
---

# Images and video

## Real photos first

The product the user sells should be shown with their own photos or videos. Help them shoot it: use the shot list from `asset_brief` (it fits their niche: lace-up and outsole for sneakers, fabric movement for dresses, headlights and walkaround for cars).

## Stock photos for mood

Call `find_images` with a scene description ("sneakers on wet street at night", "warm holiday table"). Use results for backgrounds, lifestyle and mood only, never as if they were the user's product. Keep the `attribution` line where `attributionRequired` is true. If results are weak, say that a free Pexels or Unsplash key gives much better photos (`PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`).

## Ready-to-post graphics

`content_kit` turns the offer and products into finished, correctly sized graphics with captions on one review page (share, copy, download). Pass the seller's photos as `products[].image` (phone photos: run `studio_photo` first for a clean product shot). If a product has no photo, `content_kit` returns a question: ask the seller once whether to send photos, use representative photos (tagged), create images, or go without, then call it again with `productPhotos`. To change photos later, call `content_kit` with the same `kitId`; the link stays the same. If you can generate images, generate them and pass the https URLs in `images`; Claude cannot generate images, so use the seller's photos or let the tool find free licensed photos.

## AI images

1. `asset_brief` with `assetType: "image"` (or `carousel`, `story`), `niche`, `eventId` and `aiGenerated: true`.
2. Three prompt variants from `imagePrompt.template`: subject, setting, lighting, style, brand colours, negative space for the headline, no text in the image.
3. Add the size setting for the user's tool from `sizeByTool`.
4. Headline and sub-text to add in Canva or Figma, plus alt text.

## Video

1. `asset_brief` with `assetType: "video"`, `videoSeconds` (15, 30 or 60), platform, `niche`, `eventId`.
2. Three hook options for the first 1 to 2 seconds.
3. Beat sheet table: Time | Shot | On-screen text (6 words max) | Voiceover.
4. Shot list, caption, music note (commercial library) and the platform safe zone.

## Rules

- Label realistic AI imagery where the platform requires it.
- No real people, logos or characters without rights.
- Burned-in captions on every video.
