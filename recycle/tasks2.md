import Task from "~/model/Task";
import { connectDB } from "~/utils/db";
import { TaskType } from "./types";

connectDB();

//task
export const getTaskPro = async (params?: { id?: string; title?: string }) => {
  try {
    if (params?.id) {
      const task = await Task.findById(params.id).lean();
      return task ? [task] : [];
    }

    if (params?.title) {
      const tasks = await Task.find({
        title: { $regex: params.title, $options: "i" },
      }).lean();
      return tasks;
    }

    return await Task.find().lean();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch tasks");
  }
};

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

export async function deleteTaskPro(ids: string[]) {
  try {
    await Task.deleteMany({ _id: { $in: ids } });
    return null;
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete tasks");
  }
}

// delete taks
export async function deleteTask(id: string) {
  try {
    await Task.findByIdAndDelete(id);
    return null;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch todos");
  }
}
