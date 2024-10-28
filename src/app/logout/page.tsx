"use client";

import {
    useEffect
} from "react";

import { getUserStoreData } from "@/app/storage/storage";
import { redirect } from "next/navigation";

export default function logout() {
    useEffect(() => {
        const isLoggedIn = () => {
            const user = getUserStoreData();
            return user.username != null;
        }

        if (!isLoggedIn()) {
            alert("Je bent niet ingelogd");
            redirect('/');   
        }

        localStorage.removeItem("user");
        alert("Je bent uitgelogd");
        redirect('/');
    });
    return null;
}