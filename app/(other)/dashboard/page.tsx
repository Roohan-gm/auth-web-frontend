"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { AuthSpinner } from "@/components/loaders/AuthSpinner";
import { useAuthStore } from "@/lib/authStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const search = useSearchParams();
  const tokenFromUrl = search.get("token");
  const userStrFromUrl = search.get("user");
  const router = useRouter();

  const { user, status } = useAuthStore();

  /* ---------- Google-callback handler ---------- */
  useEffect(() => {
    if (tokenFromUrl && userStrFromUrl) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStrFromUrl));
        useAuthStore.getState().setToken(tokenFromUrl);
        useAuthStore.getState().setUser(parsedUser);
        window.history.replaceState(null, "", "/dashboard");
      } catch (e) {
        console.error("Invalid user JSON", e);
      }
    }
  }, [tokenFromUrl, userStrFromUrl]);

  /* ---------- redirect AFTER hydration ---------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  /* ---------- loading / empty states ---------- */
  if (!user || status === "loading") return <AuthSpinner />;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name ?? "Guest"}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user.profilePicture || ""}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/user/${user.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href={`/user/${user.id}/edit`}>Edit Profile</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/user">Browse Users</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href="/settings">Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
