"use client";

import { permissionLevel } from '../../../server/enums/permissions';

interface UserData {
  username: string;
  permissionLevel: number;
  uuid: string;
}

const isWindowDefined = (): boolean => {
  return typeof window === "undefined";
}

export function setUserStoreData(user: UserData) {
  if (isWindowDefined()) return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function returnStore(storeName: string): any {
  if (isWindowDefined()) return;
  const item = localStorage.getItem(storeName);
  if (!item) return false;
  return JSON.parse(item);
}

export function hasUUID(): boolean {
  const data = returnStore("user");
  return data.uuid;
}

export function getUserStoreData(): UserData {
  return returnStore("user");
}

export function getUserPermissions(): number | boolean {
  const user: UserData = getUserStoreData();
  if (!user) return false;
  return user.permissionLevel;
}

export function hasPermission(): boolean {
  const permission: number = getUserPermissions() as number;
  return permission === permissionLevel.ADMIN ? true : false;
}