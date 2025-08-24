"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/nextjs";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";

const SignUpForm = () => {
  const router = useRouter();

  const { signUp, isLoaded, setActive } = useSignUp();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordScore, setPasswordScore] = useState(0);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!firstName || !lastName || !email || !password) {
      toast.error("First name, last name, email and password are required!");
      return;
    }

    setIsUpdating(true);

    try {
      // Sri Lanka time (UTC +5:30)
      const sriLankaTime = new Date(
        new Date().getTime() + 5.5 * 60 * 60 * 1000
      );

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          registeredAt: sriLankaTime.toISOString(), // Lanka time store කරන්න
        },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.success("Verification code sent to your email.");
      setIsVerifying(true);
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));

      switch (error.errors[0]?.code) {
        case "form_identifier_exists":
          toast.error("This email is already registered. Please sign in.");
          break;
        case "form_password_pwned":
          toast.error(
            "The password is too common. Please choose a stronger password."
          );
          break;
        case "form_param_format_invalid":
          toast.error(
            "Invalid email address. Please enter a valid email address."
          );
          break;
        case "form_password_length_too_short":
          toast.error(
            "Password is too short. Please choose a longer password."
          );
          break;
        default:
          toast.error("An error occurred. Please try again");
          break;
      }
    } finally {
      setIsUpdating(false);
    }
  };
  const getPasswordScore = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!code) {
      toast.error("Verification code is required!");
      return;
    }

    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("verify result:", completeSignUp);
      if (completeSignUp.status === "complete") {
        await setActive({
          session: completeSignUp.createdSessionId,
        });
        router.push("/auth/auth-callback");
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
        toast.error("Invalid verification code");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", JSON.stringify(error, null, 2));
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return isVerifying ? (
    <div className="flex flex-col items-start w-full text-start gap-y-6 py-8 px-0.5">
      <h2 className="text-2xl font-semibold">Verify your account</h2>
      <p className="text-sm text-muted-foreground">
        To continue, please enter the 6-digit verification code we just sent to{" "}
        {email}.
      </p>
      <form onSubmit={handleVerifyEmail} className="w-full">
        <div className="space-y-2 w-full pl-0.5">
          <Label htmlFor="code">Verification code</Label>
          <InputOTP
            id="code"
            name="code"
            maxLength={6}
            value={code}
            disabled={!isLoaded || isLoading}
            onChange={(e) => setCode(e)}
            className="pt-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="mt-4 w-full">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Verify code"
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Didn&apos;t receive the code?{" "}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              signUp?.prepareEmailAddressVerification({
                strategy: "email_code",
              });
              toast.success("Verification code resent to your email.");
            }}
            className="text-primary"
          >
            Resend code
          </Link>
        </p>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-start gap-y-6 py-8 w-full px-0.5">
      <h2 className="text-2xl font-semibold">Create an account</h2>

      <form onSubmit={handleSignUp} className="w-full">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              disabled={!isLoaded || isUpdating}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="w-full focus-visible:border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              disabled={!isLoaded || isUpdating}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full focus-visible:border-foreground"
            />
          </div>
        </div>
        <div className="mt-4 space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={!isLoaded || isUpdating}
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
              disabled={!isLoaded || isUpdating}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                setPasswordScore(getPasswordScore(val));
              }}
              placeholder="Enter your password"
              className="w-full focus-visible:border-foreground"
            />
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    passwordScore >= level
                      ? passwordScore <= 2
                        ? "bg-red-500"
                        : passwordScore === 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-xs mt-1 font-medium">
              {password &&
                (passwordScore <= 1 ? (
                  <span className="text-red-500">Weak</span>
                ) : passwordScore === 2 ? (
                  <span className="text-yellow-500">Medium</span>
                ) : (
                  <span className="text-green-600">Strong</span>
                ))}
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
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
            disabled={!isLoaded || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
