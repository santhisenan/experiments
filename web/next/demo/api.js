const baseUrl = "http://localhost:3001";

export const getAllTodos = async () => {
  const res = await fetch(`${baseUrl}/tasks`);
  const todos = await res.json();
  return todos;
};
