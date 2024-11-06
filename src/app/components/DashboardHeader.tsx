"use client"

import { HeaderNav } from "@/app/components/SubComponents/HeaderNav";
import { getCategoryKeys } from "@/app/requests/inventory";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardHeaderProps {
  headerNavClassname?: string;
  categoryState: string;
  parentCallback?: (childData: string) => void;
}

export function DashboardHeader({ headerNavClassname, parentCallback }: DashboardHeaderProps) {
  const [selectValue, setSelectValue] = useState("");
  const [selectItems, setSelectItems] = useState<React.ReactNode[]>([]);

  const selectMenuStyle = {
    backgroundColor: "transparent",
    border: "none",
    padding: "5px",
    borderRadius: "5px",
    color: "white",
  }

  const categoryChangeTrigger = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (parentCallback) {
      parentCallback(event.target.value);
      return;
    }
  }

  useEffect(() => {
    const fetchSelectItems = async (): Promise<React.ReactNode[]> => {
      const keys = await getCategoryKeys();
      return keys.map((key: { id: number, name: string }) => (
        <option key={key.id}>{key.name}</option>
      ));
    }

    fetchSelectItems().then((items: React.ReactNode[]) => {
      setSelectItems(prevItems => [...prevItems, ...items]);
    });
  }, []);

  return (
    <div>
      <nav className={headerNavClassname}>
        <HeaderNav>
          <li>
            <Link href="/logout">Logout</Link>
          </li>
          <li> 
            <select 
              style={selectMenuStyle} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectValue(e.target.value)
                categoryChangeTrigger(e)
              }}
             >
              <option>Select category</option> 
              {selectItems}
            </select>
          </li>
        </HeaderNav>
      </nav>
    </div>
  );
}
