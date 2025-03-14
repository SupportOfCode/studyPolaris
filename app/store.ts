import { create } from "zustand";
import { TaskType } from "./utils/types";

interface TaskStore {
  taskList: TaskType[];
  setTasks: (taskList: TaskType[]) => void;
  addTask: (task: TaskType) => void;
  editTask: (task: TaskType) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  taskList: [],
  setTasks: (taskList) => set({ taskList }),
  addTask: (task) => set((state) => ({ taskList: [...state.taskList, task] })),
  editTask: (task) =>
    set((state) => ({
      taskList: state.taskList.map((t) => (t.id === task.id ? task : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ taskList: state.taskList.filter((t) => t.id !== id) })),
}));
