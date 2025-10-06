import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context) {
  const moments = await getCollection('moments');
  return rss({
    stylesheet: `${import.meta.env.BASE_URL || ''}/rss/rss.xsl`,
    title: 'stoicopa',
    description: 'My personal hamster wheel.',
    site: context.site,
    items: moments.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `${import.meta.env.BASE_URL || ''}/moments/${post.id}`,
      content: sanitizeHtml(parser.render(post.body)),
      ...post.data,
    })),
    customData: `<language>en-us</language>`,
  });
}
