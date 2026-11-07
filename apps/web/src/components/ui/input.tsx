'use client';

import { Input as BaseInput } from '@base-ui/react/input';
import { Eye, EyeOff } from 'lucide-react';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * DS rule: fields don't offer browser autofill or saved passwords unless a screen opts in by passing
 * its own `autoComplete`. The data attributes keep password managers (1Password, LastPass, Bitwarden) away too.
 */
export const noAutofill = {
   autoComplete: 'off',
   'data-1p-ignore': true,
   'data-lpignore': 'true',
   'data-bwignore': true,
   'data-form-type': 'other',
} as const;

type InputProps = ComponentProps<typeof BaseInput> & { className?: string };

/**
 * The DS focus treatment for text fields: the border brightens and a soft ring grows around it.
 * Use `focus` for a bare input and `focus-within` (via `fieldRingWithin`) for a wrapper around one.
 */
export const fieldRing =
   'outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-muted focus:ring-4 focus:ring-ink/15 data-invalid:border-negative data-invalid:focus:ring-negative/20';

export const fieldRingWithin =
   'transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-muted focus-within:ring-4 focus-within:ring-ink/15 has-data-invalid:border-negative has-data-invalid:focus-within:ring-negative/20';

export function Input({ className, ...props }: InputProps) {
   return (
      <BaseInput
         {...noAutofill}
         className={cn(
            'h-11 w-full min-w-0 rounded-field border border-control bg-ground px-3 text-ink placeholder:text-faint sm:h-10',
            fieldRing,
            className,
         )}
         {...props}
      />
   );
}

/** A pill-shaped input with a fixed prefix (such as `#` for player tags). */
export function PrefixInput({ prefix, className, ...props }: Omit<InputProps, 'prefix'> & { prefix: ReactNode }) {
   return (
      <div
         className={cn(
            'flex h-11 items-center rounded-full border border-control bg-ground sm:h-10',
            fieldRingWithin,
            className,
         )}
      >
         <span aria-hidden className="pl-4 text-faint">
            {prefix}
         </span>
         <BaseInput
            {...noAutofill}
            className="h-full min-w-0 flex-1 bg-transparent pr-4 pl-1 outline-none placeholder:text-faint"
            {...props}
         />
      </div>
   );
}

/** An input joined to an action on its right (e.g. a read-only link and its Copy button). */
export function InputGroup({ className, children }: { className?: string; children: ReactNode }) {
   return (
      <div
         className={cn(
            'flex h-11 items-center overflow-hidden rounded-full border border-control bg-ground sm:h-9',
            fieldRingWithin,
            className,
         )}
      >
         {children}
      </div>
   );
}

/** The input inside an `InputGroup`: no frame of its own. */
export function InputGroupInput({ className, ...props }: InputProps) {
   return (
      <BaseInput
         {...noAutofill}
         className={cn('h-full min-w-0 flex-1 bg-transparent pr-2 pl-4 outline-none placeholder:text-faint', className)}
         {...props}
      />
   );
}

/**
 * A secret such as an API token: masked like a password, with a button to reveal it. It is a text field
 * with masked glyphs rather than `type="password"`, so browsers don't treat the form as a login to save.
 */
export function SecretInput({ className, ...props }: Omit<InputProps, 'type'>) {
   const { t } = useI18n();
   const [revealed, setRevealed] = useState(false);

   return (
      <InputGroup className={className}>
         <InputGroupInput
            type="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(!revealed && '[-webkit-text-security:disc]')}
            {...props}
         />
         <Button
            variant="ghost"
            size="icon"
            className="mr-1 size-9 sm:size-8"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? t.common.hideToken : t.common.showToken}
            aria-pressed={revealed}
         >
            {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
         </Button>
      </InputGroup>
   );
}
