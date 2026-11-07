'use client';

import { PageHeader } from '@/components/page-header';
import { Card, LinkButton } from '@/components/ui';
import { useI18n } from '@/i18n/provider';

export function NotFoundView() {
   const { t, href } = useI18n();

   return (
      <>
         <PageHeader title={t.notFound.title} />
         <Card aria-label={t.notFound.title} className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-base">{t.notFound.body}</p>
            <LinkButton href={href('/')} variant="primary">
               {t.notFound.home}
            </LinkButton>
         </Card>
      </>
   );
}
