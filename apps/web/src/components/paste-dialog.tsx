'use client';

import { parseDeckLink } from '@deckr/shared';
import { type FormEvent, useState } from 'react';
import { Button, Dialog, DialogFooter, Field, Input } from '@/components/ui';
import { useI18n } from '@/i18n/provider';

/** "Paste": loads a deck from a link the game shares. */
export function PasteDialog({
   open,
   onClose,
   onPaste,
}: {
   open: boolean;
   onClose: () => void;
   onPaste: (deck: number[]) => void;
}) {
   const { t } = useI18n();
   const [error, setError] = useState<string | null>(null);

   const close = () => {
      setError(null);
      onClose();
   };

   const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = event.currentTarget;
      const deck = parseDeckLink(String(new FormData(form).get('link') ?? ''));

      if (!deck) {
         setError(t.builder.pasteInvalid);
         return;
      }

      setError(null);
      form.reset();
      onPaste(deck);
   };

   return (
      <Dialog
         open={open}
         onOpenChange={(next) => {
            if (!next) close();
         }}
         title={t.builder.pasteTitle}
         description={t.builder.pasteDescription}
      >
         <form onSubmit={submit} noValidate>
            <Field label={t.builder.deckLink} hint={t.builder.pasteHint} error={error}>
               <Input
                  name="link"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://link.clashroyale.com/en?clashroyale://copyDeck?deck=…"
               />
            </Field>
            <DialogFooter>
               <Button variant="ghost" onClick={close}>
                  {t.common.cancel}
               </Button>
               <Button variant="primary" type="submit">
                  {t.builder.loadDeck}
               </Button>
            </DialogFooter>
         </form>
      </Dialog>
   );
}
