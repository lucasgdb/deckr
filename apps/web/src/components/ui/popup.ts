/** Shared look for everything that floats over the page: select lists, menus. */
export const floatingSurface =
   'origin-(--transform-origin) rounded-[14px] bg-[#1c1c1c] p-1 text-ink shadow-[0_16px_48px_rgb(0_0_0/0.55)] outline outline-raised transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0';

export const floatingItem =
   'flex min-h-11 cursor-default select-none items-center gap-2 rounded-[10px] px-3 outline-none data-disabled:opacity-50 data-highlighted:bg-raised sm:min-h-9 [&_svg]:size-4 [&_svg]:shrink-0';
