import Task from "~/model/Task";
import { connectDB } from "~/utils/db";
import { TaskType } from "./types";

connectDB();

// task;
export const getTask = async (id: string) => {
  try {
    const todo = await Task.findById(id);
    return new Response(JSON.stringify(todo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// getAllTasks
export const getAllTasks = async () => {
  try {
    const todos = await Task.find({});
    return new Response(JSON.stringify(todos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// createTask
export async function createTask(data: TaskType) {
  const { title, description, dueDate, priority, tags, status } = data;

  // Validate dữ liệu đầu vào
  if (!title || !status) {
    return new Response(
      JSON.stringify({ error: "Title and status are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!dueDate) {
    return new Response(JSON.stringify({ error: "dueDate are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const newTodo = await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      tags,
      status,
    });

    return new Response(JSON.stringify({ todo: newTodo }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create todo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// updateTask
export async function updateTask(id: string, data: TaskType) {
  const { title, description, dueDate, priority, tags, status } = data;

  if (!title || !status) {
    return new Response(
      JSON.stringify({ error: "Title and status are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!dueDate) {
    return new Response(JSON.stringify({ error: "dueDate are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

    if (!updatedTodo) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ todo: updatedTodo }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update todo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function deleteTask(id: string) {
  try {
    await Task.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete todo" }),
      {
        status: 500,
      }
    );
  }
}
