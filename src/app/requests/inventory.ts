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

export const getCategoryKeys = async () => {
    const response = await fetch(`${baseurl}/database/inventory/categories/keys`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
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