// frontend/src/TodoForm.tsx
import React, { useState } from "react";
import styles from "./TodoForm.module.css"; // Use CSS Modules

interface TodoFormProps {
    onCreateTodo: (title: string, description: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onCreateTodo }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title) {
            onCreateTodo(title, description);
            setTitle(""); // Clear form after submit
            setDescription("");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="New to-do title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Add To-Do</button>
        </form>
    );
};

export default TodoForm;
