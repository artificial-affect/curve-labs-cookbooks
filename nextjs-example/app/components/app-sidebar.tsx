'use client';
import {
  type LucideIcon,
  GithubIcon,
  SparklesIcon,
  BookOpenTextIcon,
  ExternalLinkIcon,
  MessageSquareTextIcon,
} from 'lucide-react';
import {
  Sidebar,
  useSidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type InternalItem = { href: string; label: string; icon: LucideIcon };
type ExternalItem = { href: string; label: string; icon: LucideIcon };

const sdkItems: InternalItem[] = [
  { href: '/', label: 'Quickstart', icon: SparklesIcon },
  { href: '/chat', label: 'Chat', icon: MessageSquareTextIcon },
];

const resourceItems: ExternalItem[] = [
  { href: 'https://www.curvelabs.org/documentation', label: 'Docs', icon: BookOpenTextIcon },
  { href: 'https://playground.curvelabs.org', label: 'Playground', icon: ExternalLinkIcon },
  { href: 'https://github.com/artificial-affect', label: 'GitHub', icon: GithubIcon },
];

const legalItems: Pick<ExternalItem, 'href' | 'label'>[] = [
  { href: 'https://www.curvelabs.org/terms', label: 'Terms' },
  { href: 'https://www.curvelabs.org/privacy', label: 'Privacy' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  function closeMobile() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-foreground/15 p-4">
        <Link href="/" className="h-9 space-y-1 outline-none focus-visible:underline" onClick={closeMobile}>
          <p className="mono-meta leading-none text-[10px]">Curve Labs</p>
          <p className="font-serif text-lg leading-tight tracking-tight">ThinkFeel SDK Cookbook</p>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel>SDK Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sdkItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    {isActive ? (
                      <SidebarMenuButton
                        type="button"
                        disabled
                        aria-current="page"
                        aria-label={`${item.label} (current page)`}
                        className="opacity-100 hover:bg-transparent hover:text-foreground"
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        <span className="size-1.5 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link href={item.href} onClick={closeMobile}>
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1">{item.label}</span>
                          <span className="size-1.5 shrink-0 rounded-full bg-transparent" aria-hidden="true" />
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map(item => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <a
                        target="_blank"
                        href={item.href}
                        onClick={closeMobile}
                        rel="noopener noreferrer"
                        aria-label={`${item.label} (opens in a new tab)`}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-foreground/15 p-4">
        <div className="space-y-2">
          <p className="mono-meta text-[10px] leading-relaxed">
            ThinkFeel `/completions` cookbook with non-stream responses.
          </p>
          <div className="flex items-center gap-3 text-[10px]">
            {legalItems.map(item => (
              <a
                target="_blank"
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                rel="noopener noreferrer"
                className="mono-meta text-link text-foreground/70 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
