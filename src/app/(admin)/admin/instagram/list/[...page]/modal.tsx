import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { YouTubeEmbed } from "@next/third-parties/google";
import { Input } from "~/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Schema } from "@effect/schema";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  videos: string[];
};

const schema = Schema.Struct({
  startAt: Schema.String.pipe(
    Schema.pattern(/^\d{2}:\d{2}$/),
    Schema.annotations({
      message: () => "Needs to be in the format 00:00",
    }),
  ),
  link: Schema.optional(Schema.String.pipe(Schema.pattern(/^https:\/\/.+$/))),
  videoId: Schema.String,
});

export default function AddVideoModal({ isOpen, setIsOpen, videos }: Props) {
  const currentVideoIndex = useRef(0);
  const [api, setApi] = useState<CarouselApi>();

  const form = useForm<Schema.Schema.Type<typeof schema>>({
    resolver: effectTsResolver(schema),
    defaultValues: {
      startAt: "",
      link: "",
      videoId: "",
    },
  });

  useEffect(() => {
    if (!api) return;

    api.on("select", ({ selectedScrollSnap }) => {
      currentVideoIndex.current = selectedScrollSnap();
    });
  }, [api]);

  useEffect(() => {
    const { unsubscribe } = form.watch((values, { name }) => {
      if (name === "link") {
        const val = values.link?.match(/v=([^&"]+)/);
        form.setValue("videoId", val?.[1] ?? "");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="max-w-[60dvw]">
        <DialogHeader>
          <DialogTitle>Choose video and start time</DialogTitle>
        </DialogHeader>
        {!videos.length && (
          <Card
            className={cn(
              "mx-auto w-2/3 transition",
              !form.getValues("videoId") &&
                "flex h-80 items-center justify-center",
            )}
          >
            <CardContent className="my-auto p-0">
              {!form.getValues("link") ? (
                <span>No videos found, please write YouTube link below.</span>
              ) : (
                <YouTubeEmbed videoid={form.getValues("videoId")} />
              )}
            </CardContent>
          </Card>
        )}
        {!!videos.length && (
          <Carousel className="mx-auto w-2/3 items-center" setApi={setApi}>
            <CarouselContent>
              {videos.map((link) => (
                <CarouselItem key={link} className="h-96">
                  <YouTubeEmbed videoid={link} height={384} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
        <Form {...form}>
          <div className="mx-auto flex w-2/3 items-center gap-4 text-nowrap">
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start time</FormLabel>
                  <FormControl>
                    <Input className="w-16" placeholder="00:00" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com?v=" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
        <DialogFooter>
          <Button type="submit">Add video</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
