"use client";

/* eslint-disable */
const CLIENT_ID = "com.kingschat";
// const REDIRECT_URI = "http://localhost:3000/api/kingschat/callback";
const REDIRECT_URI = "https://nmt-rsvp.netlify.app/api/kingschat/callback";
const SCOPES = ["conference_calls"];

import Image from "next/image";
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
  return (
    <a
      className={`${poppins.className} cursor-pointer inline-flex items-center justify-center w-full sm:w-auto rounded-md px-6 py-3 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900`}
      onClick={() => window.open(getLoginUrl(), "_self")}
    >
      <Image src={logo} alt="Kingschat logo" className="w-8 h-8 mr-2" />
      Login with KingsChat to RSVP
    </a>
  );
}
