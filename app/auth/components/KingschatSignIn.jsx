"use client";

/* eslint-disable */
const CLIENT_ID = "com.kingschat";
// const REDIRECT_URI = "http://localhost:3000/api/kingschat/callback";
const REDIRECT_URI = "https://nmt-rsvp.netlify.app/api/kingschat/callback";

const SCOPES = ["conference_calls"];

import Image from "next/image";
import { useState } from "react";
import logo from "../../assets/logo/kingschat.png";
import { Poppins } from "next/font/google";

const getLoginUrl = () => {
  const encodedScopes = encodeURIComponent(JSON.stringify(SCOPES));
  const encodedRedirect = encodeURIComponent(REDIRECT_URI);
  return `https://accounts.kingsch.at/?client_id=${CLIENT_ID}&scopes=${encodedScopes}&post_redirect=true&redirect_uri=${encodedRedirect}`;
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function KingsChatSignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    window.open(getLoginUrl(), "_self");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`${poppins.className} cursor-pointer text-neutral-700 w-full inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="flex flex-row items-center">
          <Image src={logo} alt="Kingschat logo" className="w-8 h-8 mr-2" />
          <svg
            className="mr-2 h-4 w-4 animate-spin text-slate-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Redirecting to KingsChat...
        </div>
      ) : (
        <>
          <Image src={logo} alt="Kingschat logo" className="w-8 h-8 mr-2" />
          Login with KingsChat
        </>
      )}
    </button>
  );
}
