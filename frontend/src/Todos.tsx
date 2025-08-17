// frontend/src/Todos.tsx
import React, { useState, useEffect } from "react";
import TodoForm from "./TodoForm"; // Import our new form
import styles from "./Todos.module.css"; // Use CSS Modules

interface ToDo {
    id: number;
    title: string;
    description: string;
    is_completed: boolean;
    owner_id: number;
}

interface TodosProps {
    token: string;
}

const API_URL = "http://localhost:8000";

const Todos: React.FC<TodosProps> = ({ token }) => {
    const [todos, setTodos] = useState<ToDo[]>([]);

    // Fetch todos on component mount and whenever the token changes
    useEffect(() => {
        fetchTodos();
    }, [token]);

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/todos/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setTodos(data);
            }
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        }
    };

    const createTodo = async (title: string, description: string) => {
        try {
            const response = await fetch(`${API_URL}/todos/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });
            if (response.ok) {
                fetchTodos(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to create todo:", error);
        }
    };

    const deleteTodo = async (todoId: number) => {
        try {
            const response = await fetch(`${API_URL}/todos/${todoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                fetchTodos(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    const handleDoubleClick = (todoId: number) => {
        if (window.confirm("Are you sure you want to delete this to-do?")) {
            deleteTodo(todoId);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Your To-Dos</h2>
            <ul className={styles.todoList}>
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className={styles.todoItem}
                        onDoubleClick={() => handleDoubleClick(todo.id)}
                    >
                        <div className={styles.todoContent}>
                            <h3 className={styles.todoTitle}>{todo.title}</h3>
                            <p className={styles.todoDescription}>
                                {todo.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            <TodoForm onCreateTodo={createTodo} />
        </div>
    );
};

export default Todos;
