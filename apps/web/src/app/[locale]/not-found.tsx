import { NotFoundView } from '@/features/not-found';

/** Fallback for `notFound()`. Unknown addresses don't get here: the proxy sends them to `not-found-page`. */
export default function NotFound() {
   return <NotFoundView />;
}
