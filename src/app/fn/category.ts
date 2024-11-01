import { setNewCategory } from "../requests/inventory";
import React from "react";

export const categoryNewRow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log('new row');
};

export const addNewCategory = (name: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!name) return;
    event.preventDefault();

    const fixedData = {
        field: name
    }

    setNewCategory(JSON.stringify(fixedData)).then(r => console.log(r));
    return; 
}

export const getInventoryItems = async () => {
    const data = await fetch('http://localhost:8000/database/inventory');
    return data.json();
}

export const loadNewCategory = async (category: string) => {
    const data = await fetch(`http://localhost:8000/database/inventory/${category}`);
    return data.json();
}

export const getCategories = async() => {
    const data: Promise<Response[]> = await fetch('http://localhost:8000/database/inventory/categories/all');
    return data.map((category: {
        id: number;
        name: string;
    }) => {
        return category.name;
    });
}