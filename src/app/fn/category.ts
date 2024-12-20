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

export const getInventoryItems = async (category: string) => {
    if (category === "Select category") {
        console.log('not looking for items here')
        return;
    }
    const data = await fetch('http://localhost:8000/database/inventory', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ category })
    });
    return data.json();
}

export const loadNewCategory = async (category: string) => {
    const data = await fetch(`http://localhost:8000/database/inventory/${category}`);
    return data.json();
}

export const getCategoryKeys = async () => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/all`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

export const getCategoryInventoryKeys = async (category: string) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/content/keys`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
    });
    return response.json();
}

export const setCategoryColumns = async (category: string, items: Record<string, any>) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/items/update`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category, items})
    });
    return response.json();
}   

export const addColumnValue = async (category: string, column: string) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/column/add`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category, column})
    });
    return response.json();
}

export const getCategoryValues = async (category: string) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/values`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category})
    });
    return response.json();
}

export const setCategoryItems = async (category: string, items: Record<string, any>) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/items/update`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category, items})
    });
    return response.json();
}   

export const addItemValue = async (category: string, item: string, value: string) => {
    const response = await fetch(`http://localhost:8000/database/inventory/categories/values/update`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category, item, value})
    });
    return response.json();
}