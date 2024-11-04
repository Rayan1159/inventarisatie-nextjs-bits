import { permissionLevel } from '../../../server/enums/permissions';
interface UserData {
  username: string;
  permissionLevel: number;
  uuid: string;
}

export function setUserStoreData(user: UserData) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function returnStore(storeName: string): any {
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
  const permissionLevel = getUserPermissions();
  return permissionLevel === 1 ? true : false;
}