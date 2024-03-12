"use client";

import { isRight } from "fp-ts/lib/Either";
import { redirect } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { login } from "~/server/auth/login";

export default function AdminLoginPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await login(null, formData);
      if (isRight(res)) {
        redirect("/admin");
      }

      setError(res.left);
    });
  };

  return (
    <div className="container relative grid h-[800px] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <div className={"grid gap-6"}>
          <form action={onSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="username"
                  type="username"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  disabled={pending}
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  disabled={pending}
                />
              </div>
              <Button loading={pending} type="submit">
                Sign In with Email
              </Button>
              <div>{error}</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
