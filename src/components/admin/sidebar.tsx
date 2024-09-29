import {
  ChevronRightSquareIcon,
  CopyPlusIcon,
  FoldersIcon,
  ListIcon,
  ListMusic,
  ListPlus,
} from "lucide-react";
import { cn } from "~/lib/utils";
import AdminNavbarLinkButton from "./link-button";
import {
  $getFavoriteYoutubePlaylists,
  type PlaylistFavourites,
} from "~/server/digg/youtube/exports";
import effectComponent from "~/server/effect";
import { Effect } from "effect";

const items = ({ playlists }: { playlists: PlaylistFavourites }) =>
  [
    // {
    //   title: "Morevi",
    //   list: [
    //     { title: "Home", icon: ShellIcon, href: "/admin" },
    //     { title: "Stock", icon: LayersIcon, href: "/admin/stock" },
    //     { title: "Users", icon: UsersRound, href: "/admin/users" },
    //     { title: "Orders", icon: ShuffleIcon, href: "/admin/orders" },
    //     { title: "Categories", icon: BookAIcon, href: "/admin/categories" },
    //   ],
    // },
    {
      title: "Discogs",
      list: [
        { title: "Folders", icon: FoldersIcon, href: "/admin/discogs/folders" },
        { title: "Add new", icon: CopyPlusIcon, href: "/admin/discogs/add" },
      ],
    },
    // {
    //   title: "Wolt",
    //   list: [
    //     { title: "List", icon: ListIcon, href: "/admin/wolt/list" },
    //     {
    //       title: "Generate",
    //       icon: ChevronRightSquareIcon,
    //       href: "/admin/wolt/generate",
    //     },
    //   ],
    // },
    {
      title: "Instagram",
      list: [
        { title: "List", icon: ListIcon, href: "/admin/instagram/list" },
        {
          title: "Generate",
          icon: ChevronRightSquareIcon,
          href: "/admin/instagram/generate",
        },
      ],
    },
    {
      title: "Youtube",
      list: [
        { title: "Add", icon: ListPlus, href: "/admin/youtube/playlist-add" },
        ...playlists
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((playlist) => ({
            title: playlist.name,
            icon: ListMusic,
            href: `/admin/youtube/playlist/${playlist.playlistId}`,
          })),
      ],
    },
  ] as const;

export const Sidebar = effectComponent(
  ({ className, userId }: { className?: string; userId?: string }) =>
    Effect.gen(function* () {
      const playlists = yield* $getFavoriteYoutubePlaylists(userId);
      const menuItems = items({ playlists });

      return (
        <div className={cn("pb-12", className)}>
          <div className="space-y-4 py-4">
            {menuItems.map((item) => (
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
    }),
);
