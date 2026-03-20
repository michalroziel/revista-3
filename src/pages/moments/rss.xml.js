import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { withBasePath } from '../../utils/withBasePath';
const parser = new MarkdownIt();

export async function GET(context) {
  const moments = await getCollection('moments');
  return rss({
    stylesheet: withBasePath('/rss/rss.xsl'),
    title: 'stoicopa',
    description: 'My personal hamster wheel.',
    site: context.site,
    items: moments.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: withBasePath(`/moments/${post.id}/`),
      content: sanitizeHtml(parser.render(post.body)),
      ...post.data,
    })),
    customData: `<language>en-us</language>`,
  });
}
