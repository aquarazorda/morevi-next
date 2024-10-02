"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Plus, MoreVertical, Trash } from "lucide-react";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { usePlayback } from "./playback-context";
// import { createPlaylistAction, deletePlaylistAction } from "./actions";
import { usePlaylist } from "~/hooks/use-playlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type Playlist } from "~/server/db/types";
import { SearchInput } from "./search";

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  const pathname = usePathname();
  const router = useRouter();
  const { deletePlaylist } = usePlaylist();

  async function handleDeletePlaylist(id: string) {
    deletePlaylist(id);

    if (pathname === `/p/${id}`) {
      router.prefetch("/");
      router.push("/");
    }

    // deletePlaylistAction(id);
    router.refresh();
  }

  return (
    <li className="group relative">
      <Link
        prefetch={true}
        href={`/p/${playlist.id}`}
        className={`block cursor-pointer px-4 py-1 text-[#d1d5db] hover:bg-[#1A1A1A] focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
          pathname === `/p/${playlist.id}` ? "bg-[#1A1A1A]" : ""
        }`}
        tabIndex={0}
      >
        {playlist.name}
      </Link>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 transform opacity-0 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white focus:text-white"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Playlist options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              disabled={isProduction}
              onClick={() => handleDeletePlaylist(playlist.id)}
              className="text-xs"
            >
              <Trash className="mr-2 size-3" />
              Delete Playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

export function OptimisticPlaylists() {
  const { playlists, updatePlaylist } = usePlaylist();
  const playlistsContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { registerPanelRef, handleKeyNavigation, setActivePanel } =
    usePlayback();

  useEffect(() => {
    registerPanelRef("sidebar", playlistsContainerRef);
  }, [registerPanelRef]);

  async function addPlaylistAction() {
    const newPlaylist = {
      name: "New Playlist",
      coverUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // updatePlaylist(newPlaylistId, newPlaylist);
    // router.prefetch(`/p/${newPlaylistId}`);
    // router.push(`/p/${newPlaylistId}`);
    // createPlaylistAction(newPlaylistId, "New Playlist");
    router.refresh();
  }

  return (
    <div
      className="hidden h-[100dvh] w-56 overflow-auto bg-[#121212] md:block"
      onClick={() => setActivePanel("sidebar")}
    >
      <div className="m-4">
        <SearchInput />
        <div className="mb-6">
          <Link
            href="/"
            className={`-mx-4 block px-4 py-1 text-xs text-[#d1d5db] transition-colors hover:bg-[#1A1A1A] focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
              pathname === "/" ? "bg-[#1A1A1A]" : ""
            }`}
          >
            All Tracks
          </Link>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-400 transition-colors hover:text-white"
          >
            Playlists
          </Link>
          <form action={addPlaylistAction}>
            <Button
              disabled={isProduction}
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              type="submit"
            >
              <Plus className="h-3 w-3 text-gray-400" />
              <span className="sr-only">Add new playlist</span>
            </Button>
          </form>
        </div>
      </div>
      <ScrollArea className="h-[calc(100dvh-180px)]">
        <ul
          ref={playlistsContainerRef}
          className="mt-[1px] space-y-0.5 text-xs"
          onKeyDown={(e) => handleKeyNavigation(e, "sidebar")}
        >
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
