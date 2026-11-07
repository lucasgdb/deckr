/** Structured data as a JSON-LD script. `<` is escaped so the JSON can never close the script element. */
export function JsonLd({ data }: { data: unknown }) {
   const json = JSON.stringify(data).replace(/</g, '\\u003c');

   // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON built by the app, with `<` escaped.
   return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
