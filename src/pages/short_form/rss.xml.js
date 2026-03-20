import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { withBasePath } from '../../utils/withBasePath';
const parser = new MarkdownIt();

export async function GET(context) {
  const short_form = await getCollection('short_form');
  return rss({
    stylesheet: withBasePath('/rss/rss.xsl'),
    title: 'stoicopa',
    description: 'My personal hamster wheel.',
    site: context.site,
    items: short_form.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: withBasePath(`/short_form/${post.id}/`),
      content: sanitizeHtml(parser.render(post.body)),
      ...post.data,
    })),
    customData: `<language>en-us</language>`,
  });
}
