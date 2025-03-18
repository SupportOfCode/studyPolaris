import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Box,
  Button,
  TextField,
  Select,
  InlineGrid,
} from "@shopify/polaris";
import { EditIcon, PlusIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { useTaskStore } from "~/store";
import { createTask, getTaskPro, updateTask } from "~/utils/tasks";

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id === "new") {
    return {
      data: {
        title: "",
        description: "",
        dueDate: "",
        priority: "Low",
        tags: "",
        status: "Not Started",
      },
      page: "new",
    };
  } else {
    const tasks = await getTaskPro({ id: params.id });
    const task = tasks[0];

    const formattedTasks = {
      ...task,
      _id: task?._id.toString(),
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    };
    return {
      data: formattedTasks,
      page: "edit",
    };
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;
  const tags = formData.get("tags") as string;
  const status = formData.get("status") as string;

  if (request.method === "POST") {
    await createTask({
      title,
      description,
      dueDate,
      priority,
      tags,
      status,
    });
  }

  if (request.method === "PUT") {
    await updateTask(params.id || "", {
      title,
      description,
      dueDate,
      priority,
      tags,
      status,
    });
  }

  return redirect("/");
};

export default function Task() {
  const oldTask = useLoaderData<typeof loader>();
  const { task, setTask, editTask, resetTask } = useTaskStore();

  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [errors, setErrors] = useState({ title: "", dueDate: "", tags: "" });

  useEffect(() => {
    setTask(oldTask.data);
    return () => resetTask();
  }, [oldTask, setTask, resetTask]);

  const priorityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];

  const statusOptions = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];

  const handleChange = (field: keyof typeof task) => (value: any) => {
    editTask(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateData = () => {
    let newErrors = { title: "", dueDate: "", tags: "" };
    let isValid = true;

    if (!task.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!(task.dueDate ? task.dueDate : "").trim()) {
      newErrors.dueDate = "Due Date is required";
      isValid = false;
    }

    if (
      (task.tags ? task.tags : "")
        .split(",")
        .map((tag: string) => tag.trim())
        .some((tag: string) => tag.length > 10)
    ) {
      newErrors.tags = "Each tag must be at most 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateData()) {
      return;
    } else {
      const formData = new FormData();
      formData.append("title", task.title);
      formData.append("description", task.description || "");
      formData.append("dueDate", task.dueDate || "");
      formData.append("priority", task.priority);
      formData.append("tags", task.tags || "");
      formData.append("status", task.status);
      fetcher.submit(formData, {
        method: oldTask.page === "new" ? "post" : "put",
      });
    }
  };

  return (
    <Page
      title="Add Task"
      narrowWidth
      secondaryActions={[
        { content: "Cancel", destructive: true, onAction: () => navigate("/") },
      ]}
    >
      <Box
        background="bg-surface"
        padding="600"
        borderRadius="300"
        shadow="400"
      >
        <Layout>
          <Layout.Section>
            <TextField
              label="Title"
              value={task.title}
              onChange={handleChange("title")}
              autoComplete="off"
              requiredIndicator
              error={errors.title}
              name="title"
            />
          </Layout.Section>

          <Layout.Section>
            <TextField
              label="Description"
              name="description"
              value={task.description}
              onChange={handleChange("description")}
              multiline={4}
              autoComplete="off"
            />
          </Layout.Section>

          <Layout.Section>
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={task.dueDate}
              onChange={handleChange("dueDate")}
              autoComplete="off"
              error={errors.dueDate}
            />
          </Layout.Section>

          <Layout.Section>
            <Select
              label="Priority"
              options={priorityOptions}
              value={task.priority}
              onChange={handleChange("priority")}
              name="priority"
            />
          </Layout.Section>

          <Layout.Section>
            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={task.tags}
              onChange={handleChange("tags")}
              autoComplete="off"
              maxLength={20}
              error={errors.tags}
            />
          </Layout.Section>

          <Layout.Section>
            <Select
              label="Status"
              options={statusOptions}
              value={task.status}
              onChange={handleChange("status")}
              name="status"
            />
          </Layout.Section>

          <Layout.Section>
            <InlineGrid columns={{ lg: 3 }} gap={"300"} alignItems="center">
              <Box></Box>
              <Button
                icon={oldTask.page === "new" ? PlusIcon : EditIcon}
                variant="primary"
                tone="success"
                onClick={handleSubmit}
              >
                {oldTask.page === "new" ? "Add" : "Edit"}
              </Button>
              <Box></Box>
            </InlineGrid>
          </Layout.Section>
        </Layout>
      </Box>
    </Page>
  );
}
