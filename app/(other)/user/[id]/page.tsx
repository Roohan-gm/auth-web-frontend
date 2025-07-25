"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Calendar, Mail, CalendarClock, VenusAndMars, Users } from "lucide-react";
import Link from "next/link";
import { userApi } from "@/lib/api";
import { AxiosResponse } from "axios";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  profilePicture?: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { id } = use(params);
  const isOwnProfile = session?.user?.id === id;

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: AxiosResponse = await userApi.getProfile(id);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && id) {
      loadProfile();
    }
  }, [status, id, router, loadProfile]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadProfile} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Profile not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isOwnProfile ? "My Profile" : `${profile.name}'s Profile`}
          </h1>
          <p className="text-muted-foreground">
            {isOwnProfile
              ? "Manage your account information"
              : "View user profile"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profile.profilePicture || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{profile.name}</h2>
                  {isOwnProfile && (
                    <Link href={`/user/${profile.id}/edit`}>
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.age && (
                    <div className="flex items-center gap-3">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.age} years old</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex items-center gap-3">
                      <VenusAndMars className="h-5 w-5 text-muted-foreground" />
                      <span className="capitalize">{profile.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Details</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Member since{" "}
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {profile.lastLogin && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Last active{" "}
                        {new Date(profile.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Manage your account" : "Available actions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isOwnProfile ? (
                <>
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                  <Link href="/user">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Browse Users
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/user">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Browse Users
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
