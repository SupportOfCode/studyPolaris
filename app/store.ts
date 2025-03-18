import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TaskType } from "~/utils/types";

interface TaskStore {
  task: TaskType;
  setTask: (task: TaskType) => void;
  editTask: (field: keyof TaskType, value: any) => void;
  resetTask: () => void;
}

export const useTaskStore = create<TaskStore>()(
  immer((set) => ({
    task: {
      title: "",
      description: "",
      dueDate: "",
      priority: "Low",
      tags: "",
      status: "Not Started",
    },

    setTask: (task) => {
      set((state) => {
        state.task = task;
      });
    },

    editTask: (field, value) => {
      set((state) => {
        state.task[field] = value;
      });
    },

    resetTask: () => {
      set((state) => {
        state.task = {
          title: "",
          description: "",
          dueDate: "",
          priority: "Low",
          tags: "",
          status: "Not Started",
        };
      });
    },
  }))
);
