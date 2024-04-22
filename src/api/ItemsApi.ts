import axios from "axios";

const apiUrl = "http://localhost:3000/items";

export const fetchItems = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch items:", error);
    throw error;
  }
};

export const updateItem = async (id: string, item: any) => {
  console.log(item);
  try {
    const response = await axios.put(`${apiUrl}/${id}`, item);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to update item:", error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    await axios.delete(`${apiUrl}/${id}`);
  } catch (error) {
    console.error("Failed to delete item:", error);
    throw error;
  }
};

export const addItem = async (item: any) => {
  try {
    const response = await axios.post(apiUrl, item);
    return response.data;
  } catch (error) {
    console.error("Failed to add item:", error);
    throw error;
  }
};
