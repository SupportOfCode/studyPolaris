import Task from "~/model/Task";
import { connectDB } from "~/utils/db";
import { TaskType } from "./types";

connectDB();

//get task pro
export const getTaskPro = async (params?: {
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  tag?: string;
}) => {
  try {
    const filter: any = {};

    if (params?.id) {
      const task = await Task.findById(params.id).lean();
      return task ? [task] : [];
    }

    if (params?.title) {
      filter.title = { $regex: params.title, $options: "i" };
    }

    if (params?.status) {
      filter.status = params.status;
    }

    if (params?.priority) {
      filter.priority = params.priority;
    }

    if (params?.fromDate || params?.toDate) {
      filter.dueDate = {};
      if (params.fromDate) {
        filter.dueDate.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        filter.dueDate.$lte = new Date(params.toDate);
      }
    }

    if (params?.tag) {
      filter.tags = { $regex: `\\b${params.tag}\\b`, $options: "i" };
    }

    return (await Task.find(filter).lean()).reverse();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch tasks");
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
