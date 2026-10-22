// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
// Where a post was photographed; posts with a location get a pin on /map.
const location = z
  .object({
    name: z.string(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .optional();
// 2. Define a `type` and `schema` for each collection
const moments = defineCollection({
  // type: "content", // v2.5.0 and later
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/moments' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        positionx: z.string().optional(),
        positiony: z.string().optional(),
      })
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    location,
  }),
});

const short_form = defineCollection({
  // type: "content", // v2.5.0 and later
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/short_form' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        positionx: z.string().optional(),
        positiony: z.string().optional(),
      })
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    location,
  }),
});

const long_form = defineCollection({
  // type: "content", // v2.5.0 and later
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/long_form' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        positionx: z.string().optional(),
        positiony: z.string().optional(),
      })
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    location,
  }),
});

const zeitweilig = defineCollection({
  // type: "content", // v2.5.0 and later
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/zeitweilig' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        positionx: z.string().optional(),
        positiony: z.string().optional(),
      })
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    location,
  }),
});

const authors = defineCollection({
  // type: "content", // v2.5.0 and later
  loader: glob({ pattern: '**\/[^_]*.mdx', base: './src/content/authors' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        positionx: z.string().optional(),
        positiony: z.string().optional(),
      })
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  moments,
  short_form,
  long_form,
  zeitweilig,
  authors,
};
