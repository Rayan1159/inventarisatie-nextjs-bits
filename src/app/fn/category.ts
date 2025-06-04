import React from 'react';

import { setNewCategory } from '../requests/inventory';

const baseURL = process.env.env === "DEV" ? "http://localhost:8000" : "http://10.10.2.254:8000";

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
    const data = await fetch(`http://localhost:8000/database/inventory`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ category })
    });
    return data.json();
}

export const loadNewCategory = async (category: string) => {
    const data = await fetch(`http://localhost:8000/database/inventory/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ category })
    });
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
    const response = await fetch(`hhttp://localhost:8000/database/inventory/categories/items/update`, {
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

export const addItemValue = async (category, item, value, id) => {
    try {
        const response = await fetch('http://localhost:8000/database/inventory/categories/values/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category,
                item,
                value,
                id
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update value');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating value:', error);
        throw error;
    }
};

export const deleteCategoryItem = async (category: string, item: string) => {
    return fetch(`http://localhost:8000/database/inventory/categories/values/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ category, item })
    }).then(r => r.json());
}

export const createNewEntry = async (category: string) => {
    console.log(category);
    const response = await fetch(`http://localhost:8000/database/entry/create`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category})
    });
    return response.json();
}