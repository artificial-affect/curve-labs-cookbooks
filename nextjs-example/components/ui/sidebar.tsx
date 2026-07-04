'use client';
import { cn } from '@/src/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { Button } from '@/components/ui/button';
import { XIcon, PanelLeftIcon } from 'lucide-react';
import {
  type Dispatch,
  type CSSProperties,
  type ComponentProps,
  type SetStateAction,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useContext,
  useCallback,
  createContext,
} from 'react';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextValue = {
  open: boolean;
  isMobile: boolean;
  openMobile: boolean;
  toggleSidebar: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setOpenMobile: Dispatch<SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useMobileQuery() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.');

  return context;
}

type SidebarProviderProps = ComponentProps<'div'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function SidebarProvider({
  style,
  children,
  className,
  onOpenChange,
  open: openProp,
  defaultOpen = true,
  ...props
}: SidebarProviderProps) {
  const isMobile = useMobileQuery();
  const [openMobile, setOpenMobile] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (value: SetStateAction<boolean>) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (onOpenChange) {
        onOpenChange(next);
        return;
      }

      setUncontrolledOpen(next);
    },
    [onOpenChange, open]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(previous => !previous);
      return;
    }

    setOpen(previous => !previous);
  }, [isMobile, setOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT) return;
      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar]);

  useEffect(() => {
    if (!isMobile) return;
    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = openMobile ? 'hidden' : originalOverflow;
    document.body.style.overscrollBehavior = openMobile ? 'none' : originalOverscrollBehavior;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [isMobile, openMobile]);

  const value = useMemo<SidebarContextValue>(
    () => ({ isMobile, open, setOpen, openMobile, setOpenMobile, toggleSidebar }),
    [isMobile, open, setOpen, openMobile, toggleSidebar]
  );

  const mergedStyle = {
    '--sidebar-width': SIDEBAR_WIDTH,
    '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
    ...style,
  } as CSSProperties;

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn('group/sidebar-wrapper flex h-dvh w-full overflow-hidden overscroll-none', className)}
        style={mergedStyle}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = ComponentProps<'aside'> & {
  side?: 'left' | 'right';
};

function Sidebar({ className, children, side = 'left', ...props }: SidebarProps) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    const hiddenTransform = side === 'left' ? '-translate-x-full' : 'translate-x-full';

    return (
      <>
        <div
          aria-hidden="true"
          onClick={() => setOpenMobile(false)}
          className={cn(
            'fixed inset-0 z-40 bg-black/70 transition-opacity md:hidden',
            openMobile ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        />
        <aside
          className={cn(
            'fixed inset-y-0 z-50 flex h-dvh w-[--sidebar-width-mobile] flex-col overflow-hidden overscroll-none border-foreground/15 bg-secondary transition-transform md:hidden',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            openMobile ? 'translate-x-0' : hiddenTransform,
            className
          )}
          {...props}
        >
          <div className="flex h-12 items-center justify-end border-b border-foreground/15 px-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
              <XIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-none">{children}</div>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 transition-[width] duration-200 ease-linear md:block',
        open ? 'w-[--sidebar-width]' : 'w-0',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'absolute inset-y-0 flex w-[--sidebar-width] flex-col overflow-hidden overscroll-none bg-secondary/30 transition-opacity duration-200',
          side === 'left' ? 'left-0 border-r border-foreground/15' : 'right-0 border-l border-foreground/15',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {children}
      </div>
    </aside>
  );
}

const SidebarInset = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex h-dvh min-w-0 flex-1 flex-col overflow-hidden overscroll-none', className)} {...props} />
));
SidebarInset.displayName = 'SidebarInset';

const SidebarHeader = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <header ref={ref} className={cn('flex shrink-0 flex-col', className)} {...props} />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-none p-2', className)}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <footer ref={ref} className={cn('mt-auto flex shrink-0 flex-col', className)} {...props} />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = forwardRef<HTMLDivElement, ComponentProps<'section'>>(({ className, ...props }, ref) => (
  <section ref={ref} className={cn('space-y-2', className)} {...props} />
));
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = forwardRef<HTMLHeadingElement, ComponentProps<'h2'>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('mono-meta px-3 text-[10px] uppercase tracking-[0.16em]', className)} {...props} />
));
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1', className)} {...props} />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('space-y-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('list-none', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

type SidebarMenuButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
};

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild = false, isActive = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        data-active={isActive ? 'true' : 'false'}
        className={cn(
          'peer/menu-button flex w-full items-center gap-2 border border-transparent px-3 py-2 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive && 'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background',
          className
        )}
        {...props}
      />
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarTrigger = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-9 w-9 border border-foreground/15 bg-background', className)}
        onClick={event => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleSidebar();
        }}
        {...props}
      >
        <PanelLeftIcon className="size-4 rtl:rotate-180" aria-hidden="true" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    );
  }
);
SidebarTrigger.displayName = 'SidebarTrigger';

export {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarInset,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarProvider,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarGroupContent,
};
