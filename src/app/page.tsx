"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 flex items-center justify-center overflow-hidden relative">
      {/* Decorative animated gradient orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-red-300 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 left-20 w-80 h-80 bg-gradient-to-br from-pink-300 to-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Animated heart icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-pink-500 rounded-full p-6 w-24 h-24 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white animate-bounce"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-600 via-pink-600 to-rose-500 bg-clip-text text-transparent leading-tight">
          Link Up
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light">
          Find your perfect match
        </p>

        {/* Loading indicator with dots */}
        <div className="flex justify-center gap-3 items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <span className="text-gray-600 text-sm font-medium">
            Loading your connections...
          </span>
        </div>

        {/* Subtle text */}
        <p className="text-gray-500 text-sm mt-12 opacity-75">
          Getting ready for you...
        </p>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500"></div>
    </div>
  );
}
