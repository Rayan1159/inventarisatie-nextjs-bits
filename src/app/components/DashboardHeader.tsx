"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { HeaderNav } from '@/app/components/SubComponents/HeaderNav';
import { getCategoryKeys } from '@/app/fn/category';

interface DashboardHeaderProps {
  headerNavClassname?: string;
  categoryState: string;
  parentCallback: (childData: string) => void;
}

export function DashboardHeader({
  headerNavClassname,
  parentCallback,
}: DashboardHeaderProps) {
  const [selectValue, setSelectValue] = useState("");
  const [selectItems, setSelectItems] = useState<React.ReactNode[]>([]);

  const selectMenuStyle = {
    backgroundColor: "transparent",
    border: "none",
    padding: "5px",
    borderRadius: "5px",
    color: "white",
  };

  const categoryChangeTrigger = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target.value === "Select category") return;
    parentCallback(event.target.value);
    return;
  };

  const categoriesEmpty = () => {
    return selectItems.length === 0;
  };

  useEffect(() => {
    const fetchSelectItems = async (): Promise<React.ReactNode[]> => {
      const keys = await getCategoryKeys();
      return keys.map((key: { id: number; name: string }) => (
        <option key={key.id}>{key.name}</option>
      ));
    };

    fetchSelectItems().then((items: React.ReactNode[]) => {
      setSelectItems((prevItems) => [...prevItems, ...items]);
    });
  }, []);

  return (
    <div>
      <nav className={headerNavClassname}>
        <HeaderNav>
          <li>
            <Link href="/logout">Logout</Link>
          </li>
          {!categoriesEmpty() ? (
            <li>
              <select
                style={selectMenuStyle}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectValue(e.target.value);
                  categoryChangeTrigger(e);
                }}
              >
                <option>Select category</option>
                {selectItems}
              </select>
            </li>
          ) : (
            <button
              style={{
                background: "red",
                border: "none",
                width: "50%",
                borderRadius: "5px",
                height: "35px",
              }}
            >
              No categories found
            </button>
          )}
        </HeaderNav>
      </nav>
    </div>
  );
}
