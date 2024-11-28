"use client"

import { HeaderNav } from "@/app/components/SubComponents/HeaderNav";
import { getCategoryKeys } from "@/app/fn/category";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, Modal, TextField } from "@mui/material";

interface DashboardHeaderProps {
  headerNavClassname?: string;
  categoryState: string;
  parentCallback: (childData: string) => void;
}

export function DashboardHeader({ headerNavClassname, parentCallback }: DashboardHeaderProps) {
  const [selectValue, setSelectValue] = useState("");
  const [selectItems, setSelectItems] = useState<React.ReactNode[]>([]);

  const [open, setOpen] = useState({
    modal: {
      open: false
    }
  });

  const selectMenuStyle = {
    backgroundColor: "transparent",
    border: "none",
    padding: "5px",
    borderRadius: "5px",
    color: "white",
  }

  const inventoryInterfaceStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, 
    height: 250,
    background: "white",
    border: '1px solid #000',
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
  };

  const categoryChangeTrigger = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === "Select category") return;
    parentCallback(event.target.value);
    return;
  }

  const categoriesEmpty = () => {
    return selectItems.length === 0;
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


  const handleOpen = (modal: string) => setOpen({
    ...open,
    modal: {
      open: true
    }
  })

  const handleClose = (modal: string) => setOpen({
    ...open,
    modal: {
      open: false
    }
  })
  

  return (
    <div>
      <nav className={headerNavClassname}>
        <Modal
            open={open.modal.open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
         <Box sx={inventoryInterfaceStyle}>
          <TextField
              fullWidth
              label={"Category name"}
              name={"category"}
              variant="outlined"
            ></TextField>
            <Button style={{
              marginTop: 20,
              width: 300
             }} variant="contained">Add</Button>
         </Box>
        </Modal>
        <HeaderNav>
          <li>
            <Link href="/logout">Logout</Link>
          </li>
          {!categoriesEmpty() ? 
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
         : <button style={{
            background: "red",
            border: "none",
            width: "50%",
            borderRadius: "5px",
            height: "35px",
         }}
         onClick={() => handleOpen("modal")}>Add first category</button>}
        </HeaderNav>
      </nav>
    </div>
  );
}
