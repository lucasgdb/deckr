'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useLoginOpen } from '@/lib/session';

// The dialog (with its form validation and help popovers) is downloaded the first time someone opens it.
const LoginDialog = dynamic(() => import('./login-dialog').then((module) => module.LoginDialog), { ssr: false });

/** Rendered once in the layout. Mounts the login dialog on first open and keeps it, so closing animates. */
export function LoginDialogLoader() {
   const open = useLoginOpen();
   const [wanted, setWanted] = useState(false);

   useEffect(() => {
      if (open) setWanted(true);
   }, [open]);

   return wanted ? <LoginDialog /> : null;
}
