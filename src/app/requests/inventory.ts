import { get } from "https";

let baseurl: string;
const env: string = "dev";

(async () => {
    baseurl = env === "dev" ? "http://localhost:8000" : "https://10.10.2.16:8000";
})();

export const setNewCategory = async (category: string) => {
    const response = await fetch(`${baseurl}/database/inventory/categories/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category }),
    });
    return response.json();
}

export const getCategoryKeys = async (category: string) => {
    const response = await fetch(`${baseurl}/database/inventory/categories/keys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category }),
    });
    return response.json();
}

export const deleteCategory = async (category: string) => {
    const response = await fetch(`${baseurl}/inventory/delete/category`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
    });
    return response.json();
}

export const categoryExists = async (category: string): Promise<{
      json: () => Promise<{
        exists: boolean;
      }>;
      keys: () => Promise<[{
        id: number,
        name: string
      }]>;
    }> => {
    const response = await fetch(`${baseurl}/database/inventory/categories/exists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category }),
    });
    return {
        json: () => response.json(),
        keys: () => getCategoryKeys(category)
    } 
}
