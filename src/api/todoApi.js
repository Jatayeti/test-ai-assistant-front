import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/todos";

export const fetchTodos = async () => {
    try {
        const { data } = await axios.get(API_URL);
        return data;
    } catch (error) {
        console.error("Error getting todos:", error);
    }
};

export const addTodo = async (title, description) => {
    try {
        const { data } = await axios.post(API_URL, { title, description });
        return data;
    } catch (error) {
        console.error("Error creating todo:", error);
    }
};

export const updateTodo = async (id, completed) => {
    try {
        await axios.put(`${API_URL}/${id}`, { completed });
    } catch (error) {
        console.error("Error updating todo:", error);
    }
};

export const editTodo = async (id, title, description) => {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
        });
    } catch (error) {
        console.error("Error editing todo:", error);
    }
};

export const deleteTodo = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Error deleting todo:", error);
    }
};
