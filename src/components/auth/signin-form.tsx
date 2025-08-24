"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { FaApple, FaGoogle } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import Image from "next/image";

const SignInForm = () => {
  const router = useRouter();

  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!email || !password) {
      setIsLoading(false);
      toast.error("Email and password are required!");
      return;
    }

    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
        redirectUrl: "/auth/auth-callback",
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
        });
        router.push("/auth/auth-callback");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        toast.error("Invalid email or password");
        setIsLoading(false);
      }
    } catch (error: any) {
      switch (error.errors[0]?.code) {
        case "form_identifier_not_found":
          toast.error("This email is not registered. Please sign up first.");
          break;
        case "form_password_incorrect":
          toast.error("Incorrect password. Please try again.");
          break;
        case "too_many_attempts":
          toast.error("Too many attempts. Please try again later.");
          break;
        default:
          toast.error("An error occurred. Please try again");
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-6 py-8 w-full px-0.5">
      <h2 className="text-2xl font-semibold">Sign in to SicienceLab</h2>

      <form onSubmit={handleSignIn} className="w-full">
        <div className="flex gap-3">
          {/* Apple */}
          <Button
            type="button"
            variant="outline"
            disabled={!isLoaded || isLoading || !signIn}
            onClick={() =>
              signIn?.authenticateWithRedirect({
                strategy: "oauth_apple",
                redirectUrl: "/auth/auth-callback",
                redirectUrlComplete: "/dashboard",
              })
            }
            className="w-[118px] h-[35px] rounded-md border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] flex items-center justify-center"
          >
            <Image src="/apple.svg" alt="Apple" width={20} height={20} />
          </Button>

          {/* Facebook */}
          <Button
            type="button"
            variant="outline"
            disabled={!isLoaded || isLoading || !signIn}
            onClick={() =>
              signIn?.authenticateWithRedirect({
                strategy: "oauth_facebook",
                redirectUrl: "/auth/auth-callback",
                redirectUrlComplete: "/dashboard",
              })
            }
            className="w-[118px] h-[35px] rounded-md border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] flex items-center justify-center"
          >
            <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
          </Button>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            disabled={!isLoaded || isLoading || !signIn}
            onClick={() =>
              signIn?.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/auth/auth-callback",
                redirectUrlComplete: "/dashboard",
              })
            }
            className="w-[118px] h-[35px] rounded-md border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] flex items-center justify-center"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={!isLoaded || isLoading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full focus-visible:border-foreground"
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={!isLoaded || isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full focus-visible:border-foreground"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={!isLoaded || isLoading}
              className="absolute top-1 right-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-4 w-full">
          <Button
            type="submit"
            disabled={!isLoaded || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Sign in with email"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
