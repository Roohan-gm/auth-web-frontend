"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import * as z from "zod";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  User,
  CalendarClock,
  VenusAndMars,
  Save,
  RotateCcw,
} from "lucide-react";
import { userApi } from "@/lib/api";
import type { AxiosResponse } from "axios";
import { UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/use-auth";
import { AuthSpinner } from "@/components/loaders/AuthSpinner";

/* ------------- Zod schema ------------- */
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.string().min(1),
  profilePicture: z.string().url().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [initial, setInitial] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  });

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<UserProfile> = await userApi.getProfile(id);
      setInitial(res.data);
      reset({
        name: res.data.name,
        age: res.data.age,
        gender: res.data.gender,
        profilePicture: res.data.profilePicture ?? "",
      });
    } catch {
      toast("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        profilePicture: data.profilePicture || undefined,
      };
      await userApi.updateProfile(id, payload);
      toast("Profile updated!");
      router.push(`/user/${id}`);
    } catch {
      toast("Update failed");
    }
  };

  if (loading || isLoading) return <AuthSpinner />;

  if (!user || !initial) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 md:grid-cols-3"
        >
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Picture URL */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={watch("profilePicture") || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl">
                    {watch("name").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <label className="text-sm font-medium">
                    Profile picture URL
                  </label>
                  <Input
                    {...register("profilePicture")}
                    placeholder="https://..."
                    className="mt-1"
                  />
                  {errors.profilePicture && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.profilePicture.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input {...register("name")} className="mt-1" />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Age
                </label>
                <Input
                  type="number"
                  {...register("age")}
                  className="mt-1 w-32"
                />
                {errors.age && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <VenusAndMars className="h-4 w-4" />
                  Gender
                </label>
                <Select
                  value={watch("gender")}
                  onValueChange={(v) => setValue("gender", v)}
                >
                  <SelectTrigger className="mt-1 w-40">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Save or discard changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push(`/user/${id}`)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => reset()}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
