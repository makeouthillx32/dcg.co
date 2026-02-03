// components/Auth/SigninWithPassword.tsx - Updated to use server actions with Remember Me
"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useTheme } from "@/app/provider";
import { Loader2 } from "lucide-react";
import { signInAction } from "@/app/actions";

export default function SigninWithPassword() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      remember: e.target.checked,
    });
    console.log('[SignIn] Remember me:', e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[SignIn] Submitting with remember me:', data.remember);
      
      // Create FormData with all fields including remember
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('remember', data.remember.toString());

      // Call your server action
      await signInAction(formData);
      
    } catch (error) {
      console.error('[SignIn] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGroup
        type="email"
        label="Email"
        className="[&_input]:py-3 [&_input]:px-4 [&_input]:rounded-md [&_input]:border-[hsl(var(--border))] [&_input]:bg-[hsl(var(--input))] [&_input]:text-[hsl(var(--foreground))] [&_input]:placeholder:text-[hsl(var(--muted-foreground))]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon className="text-[hsl(var(--muted-foreground))]" />}
        required
        disabled={loading}
      />

      <InputGroup
        type="password"
        label="Password"
        className="[&_input]:py-3 [&_input]:px-4 [&_input]:rounded-md [&_input]:border-[hsl(var(--border))] [&_input]:bg-[hsl(var(--input))] [&_input]:text-[hsl(var(--foreground))] [&_input]:placeholder:text-[hsl(var(--muted-foreground))]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon className="text-[hsl(var(--muted-foreground))]" />}
        required
        disabled={loading}
      />

      <div className="flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Remember me"
          name="remember"
          checked={data.remember}
          withIcon="check"
          minimal
          radius="md"
          onChange={handleRememberChange}
          disabled={loading}
        />

        <Link
          href="/auth/forgot-password"
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200"
        >
          Forgot Password?
        </Link>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-md py-3 px-4 font-medium text-[hsl(var(--sidebar-primary-foreground))] bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors duration-200 ${
            loading ? "opacity-90 cursor-wait" : "cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
          Remember me: {data.remember ? 'Enabled' : 'Disabled'}
        </div>
      )}
    </form>
  );
}