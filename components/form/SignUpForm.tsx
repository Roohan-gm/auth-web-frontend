"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { authApi } from "@/lib/api"

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  age: string
  gender: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.age && { age: Number.parseInt(formData.age) }),
        ...(formData.gender && { gender: formData.gender }),
      }
      await authApi.signup(userData)
      router.push("/login?message=Account created successfully! Please sign in.")
    } catch (err: unknown) {
      const error = err as ApiError
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"

      // Handle specific error cases
      if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
        setError("An account with this email already exists. Please sign in instead or use a different email.")
      } else if (errorMessage.includes("validation")) {
        setError("Please check your information and try again.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: string) => {
    setOauthLoading(provider)
    setError("")

    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes("OAuthAccountNotLinked")) {
          setError(
            "An account with this email already exists. Please sign in with your email and password first, then link your social accounts in settings.",
          )
        } else {
          setError(`Failed to sign up with ${provider}. Please try again.`)
        }
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch {
      setError(`Failed to sign up with ${provider}. Please try again.`)
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp("google")}
            disabled={isLoading || oauthLoading !== null}
            className="w-full"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp("facebook")}
            disabled={isLoading || oauthLoading !== null}
            className="w-full"
          >
            {oauthLoading === "facebook" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            Facebook
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="25"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="none">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || oauthLoading !== null}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
