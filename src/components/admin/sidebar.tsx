import {
  BookAIcon,
  ChevronRightSquareIcon,
  CopyPlusIcon,
  FoldersIcon,
  LayersIcon,
  ListIcon,
  ShellIcon,
  ShuffleIcon,
  UsersRound,
} from "lucide-react";
import { cn } from "~/lib/utils";
import AdminNavbarLinkButton from "./link-button";

const items = [
  {
    title: "Morevi",
    list: [
      { title: "Home", icon: ShellIcon, href: "/admin" },
      { title: "Stock", icon: LayersIcon, href: "/admin/stock" },
      { title: "Users", icon: UsersRound, href: "/admin/users" },
      { title: "Orders", icon: ShuffleIcon, href: "/admin/orders" },
      { title: "Categories", icon: BookAIcon, href: "/admin/categories" },
    ],
  },
  {
    title: "Discogs",
    list: [
      { title: "Folders", icon: FoldersIcon, href: "/admin/discogs/folders" },
      { title: "Add new", icon: CopyPlusIcon, href: "/admin/discogs/add" },
    ],
  },
  {
    title: "Wolt",
    list: [
      { title: "List", icon: ListIcon, href: "/admin/wolt/list" },
      {
        title: "Generate",
        icon: ChevronRightSquareIcon,
        href: "/admin/wolt/generate",
      },
    ],
  },
] as const;

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        {items.map((item) => (
          <div className="px-3 py-2" key={item.title}>
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {item.title}
            </h2>
            <div className="space-y-1">
              {item.list.map(({ title, href, icon: Icon }) => (
                <AdminNavbarLinkButton
                  key={title}
                  icon={<Icon className="mr-2 size-4" />}
                  href={href}
                  title={title}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
