"use client";

import React from "react";
import { redirect } from "next/navigation";

import { setUserStoreData } from "@/app/storage/storage";

export function AuthCard() {
  const [userData, setUserData] = React.useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value,
    });
  };

  const login = async (_: React.MouseEvent<HTMLButtonElement>) => {
    const { username, password } = userData;
    if (!username || !password) {
      alert("Je hebt je gebruikersnaam en wachtwoord niet ingevuld");
      return;
    }
    
    if (username === "admin" && password === "bb@15$1") {
      setUserStoreData({
        username: username,
        permissionLevel: 1,
        uuid: "admin",
      });
      alert('je bent ingelogd als admin');
      redirect('/authenticated/dashboard');
    }

    if (username === "guest" && password === "guest") {
      setUserStoreData({
        username: username,
        permissionLevel: 0,
        uuid: "guest",
      });
      alert('je bent ingelogd als gast');
      redirect('/authenticated/dashboard');
    }

    alert('Gebruikersnaam of wachtwoord is onjuist');
  };

  return (
    <div>
         <div className="login">
            <div className="login-card">
              <div className="logo"/>
              <div className="input-fields">
                <div className="input">
                  <input
                      name="username"
                      onChange={handleChange}
                      type="text"
                      placeholder="Gebruikersnaam"
                  />
                </div>
                <div className="input">
                  <input
                      name="password"
                      onChange={handleChange}
                      type="password"
                      placeholder="Wachtwoord"
                  />
                </div>
              </div>
              <div className="login-buttons">
                <button
                    id="submit"
                    className="login-button"
                    onClick={login}
                >Login</button>
              </div>
            </div>
          </div>
    </div>
  );
}
