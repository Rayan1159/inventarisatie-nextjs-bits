"use client";

import { useEffect } from "react";

import { redirect } from "next/navigation";

export default function logout() {
  useEffect(() => {
    const isLoggedIn = () => {
      const user = JSON.parse(localStorage.getItem("user")!);
      if (!user) redirect("/");
      return user.username != null;
    };
    if (!isLoggedIn()) redirect("/");
    localStorage.removeItem("user");
    redirect("/");
  });
}
