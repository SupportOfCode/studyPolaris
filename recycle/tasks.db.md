import Task from "~/model/Task";
import { connectDB } from "~/utils/db";
import { TaskType } from "./types";

connectDB();

// task;
export const getTask = async (id: string) => {
try {
const todo = await Task.findById(id).lean();
return todo;
} catch (error: any) {
throw new Error(error.message || "Failed to fetch todos");
}
};

export const getAllTasks = async () => {
try {
const todos = await Task.find().lean();
return todos;
} catch (error: any) {
throw new Error(error.message || "Failed to fetch todos");
}
};

// createTask
export async function createTask(data: TaskType) {
const { title, description, dueDate, priority, tags, status } = data;

// if (!title || !status || !dueDate) {
// throw new Error("Title and status, dueDate are required");
// }

// if (
// tags
// ?.split(",")
// .map((tag: any) => tag.trim())
// .some((tag: any) => tag.length > 10)
// ) {
// throw new Error("Each tag must be at most 10 characters");
// }

try {
const newTodo = await Task.create({
title,
description,
dueDate: dueDate ? new Date(dueDate) : undefined,
priority,
tags,
status,
});

    return newTodo;

} catch (error: any) {
throw new Error(error.message || "Failed to fetch todos");
}
}

// updateTask
export async function updateTask(id: string, data: TaskType) {
const { title, description, dueDate, priority, tags, status } = data;

// if (!title || !status || !dueDate) {
// throw new Error("Title and status, dueDate are required");
// }

// if (
// tags
// ?.split(",")
// .map((tag: any) => tag.trim())
// .some((tag: any) => tag.length > 10)
// ) {
// throw new Error("Each tag must be at most 10 characters");
// }

try {
const updatedTodo = await Task.findByIdAndUpdate(
id,
{
title,
description,
dueDate: dueDate ? new Date(dueDate) : undefined,
priority,
tags,
status,
},
{ new: true }
);

    return updatedTodo;

} catch (error: any) {
throw new Error(error.message || "Failed to fetch todos");
}
}

export async function deleteTask(id: string) {
try {
await Task.findByIdAndDelete(id);
return null;
} catch (error: any) {
throw new Error(error.message || "Failed to fetch todos");
}
}
