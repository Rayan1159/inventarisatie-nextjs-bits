"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

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
