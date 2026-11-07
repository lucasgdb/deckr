import { getDictionary, locales } from '@/i18n';
import { pageUrl } from '@/lib/seo';
import { pages } from '@/lib/site';

/*
 * /llms.txt: a short, plain-text map of the site for language models (an optional convention; robots.txt, the
 * sitemap and the pages themselves remain the source of truth). Built from the same page list and copy.
 */
export const dynamic = 'force-static';

export function GET() {
   const pt = getDictionary('pt-br');
   const indexable = (Object.keys(pages) as (keyof typeof pages)[]).filter((key) => pages[key].indexable);

   const sections = locales.map((locale) => {
      const { meta } = getDictionary(locale);
      const links = indexable.map(
         (key) => `- [${meta.pages[key].title}](${pageUrl(pages[key].path, locale)}): ${meta.pages[key].description}`,
      );
      return [`## ${locale === 'en' ? 'English' : 'Português'}`, '', ...links].join('\n');
   });

   const body = [
      `# ${pt.meta.siteName}`,
      '',
      `> ${getDictionary('en').meta.description}`,
      '',
      `${getDictionary('en').footer.disclaimer} https://supercell.com/en/fan-content-policy/`,
      '',
      ...sections.flatMap((section) => [section, '']),
   ].join('\n');

   return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
