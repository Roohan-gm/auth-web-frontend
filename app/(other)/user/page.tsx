"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Eye } from "lucide-react";
import Link from "next/link";
import { userApi } from "@/lib/api";
import { AxiosResponse } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: AxiosResponse = await userApi.getAllUsers({
        page: currentPage,
        limit: 12,
        sort: "createdAt",
        order: "desc",
      });
      // defensive fallback
      const data = response.data ?? {};
      console.log("Data:", data);
      setUsers(data.users ?? []);
      setPagination((data.pagination as PaginationInfo) ?? null);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadUsers();
    }
  }, [status, currentPage, router, loadUsers]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setCurrentPage(1);
      loadUsers();
      return;
    }

    setIsSearching(true);
    try {
      const response: AxiosResponse = await userApi.searchUsers(searchTerm, {
        page: 1,
        limit: 12,
      });
      const data = response.data ?? {};
      setUsers(data.users ?? []);
      setPagination((data.pagination as PaginationInfo) ?? null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed:", error);
      setUsers([]);
      setPagination(null);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadUsers();
  };

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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Browse Users
          </h1>
          <p className="text-muted-foreground">
            Discover and connect with other members of the community
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              {searchTerm && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {users.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No users available"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={user.profilePicture || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate w-full">
                        {user.email}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Link href={`/user/${user.id}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevPage || isLoading}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.totalPages)
                )
              }
              disabled={!pagination.hasNextPage || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
