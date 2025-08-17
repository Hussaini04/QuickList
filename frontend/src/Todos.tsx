// frontend/src/Todos.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import TodoForm from "./TodoForm"; // Import our form
import styles from "./Todos.module.css"; // Use CSS Modules

const API_URL = "http://localhost:8000";

interface ToDo {
    id: number;
    title: string;
    description: string;
    is_completed: boolean;
    owner_id: number;
}

// NOTE: We no longer need TodosProps because we will get the token from Redux.
// interface TodosProps {
//     token: string;
// }

// The `Todos` component no longer accepts `token` as a prop.
const Todos: React.FC = () => {
    // We get the token directly from our Redux store using the useSelector hook.
    // This is the core change that connects this component to our central state.
    const token = useSelector((state: RootState) => state.auth.token);

    // The `useState` hook for the todo list remains, as this is local UI state.
    const [todos, setTodos] = useState<ToDo[]>([]);

    // This effect runs whenever the `token` from Redux changes.
    useEffect(() => {
        // We only try to fetch todos if a token exists.
        if (token) {
            fetchTodos();
        }
    }, [token]);

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/todos/`, {
                headers: {
                    // We now use the `token` variable from the Redux store.
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
                    // We now use the `token` variable from the Redux store.
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
                    // We now use the `token` variable from the Redux store.
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

    // The rest of the return statement (JSX) is unchanged.
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
