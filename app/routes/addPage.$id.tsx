import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
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
import { createTask, getTask, updateTask } from "~/utils/tasks";

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
    const response = await getTask(params.id || "");
    const task = await response.json();

    const formattedTasks = {
      ...task,
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
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
  const _action = formData.get("action") as string;

  if (_action === "createTask") {
    return await createTask({
      title,
      description,
      dueDate,
      priority,
      tags,
      status,
    });
  }

  if (_action === "editTask") {
    return await updateTask(params.id || "", {
      title,
      description,
      dueDate,
      priority,
      tags,
      status,
    });
  }
};

export default function AddPage() {
  const oldTask = useLoaderData<typeof loader>();
  const { addTask, editTask } = useTaskStore();
  const [task, setTask] = useState({
    title: oldTask.data.title,
    description: oldTask.data.description,
    dueDate: oldTask.data.dueDate,
    priority: oldTask.data.priority,
    tags: oldTask.data.tags,
    status: oldTask.data.status,
  });

  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [errors, setErrors] = useState({ title: "", dueDate: "", tags: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleChange = (field: string) => (value: any) => {
    setTask((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateData = () => {
    if (!task.title.trim())
      setErrors((error) => ({
        ...error,
        title: "Title is required",
      }));

    if (!task.dueDate.trim())
      setErrors((error) => ({
        ...error,
        dueDate: "dueDate is required",
      }));

    if (!task.title.trim() || !task.dueDate.trim()) {
      return null;
    }

    if (
      task.tags
        .split(",")
        .map((tag: any) => tag.trim())
        .some((tag: any) => tag.length > 10)
    ) {
      setErrors((error) => ({
        ...error,
        tags: "Each tag must be at most 10 characters",
      }));
    }
  };

  const handleSubmit = () => {
    validateData();

    if (oldTask.page === "new") {
      addTask({
        id: Date.now().toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags,
        status: task.status,
      });
    } else {
      editTask({
        id: Date.now().toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags,
        status: task.status,
      });
    }

    const formData = new FormData();
    fetcher.submit(formData);
    setIsSubmitted(true);
  };

  useEffect(() => {
    if (isSubmitted && fetcher.state === "idle") {
      navigate("/");
    }
  }, [fetcher.state, isSubmitted, navigate]);

  return (
    <Page title="Add Task" narrowWidth>
      <Box
        background="bg-surface"
        padding="600"
        borderRadius="300"
        shadow="400"
      >
        <fetcher.Form
          method={oldTask.page === "new" ? "post" : "put"}
          onSubmit={handleSubmit}
        >
          <input
            type="hidden"
            name="action"
            value={oldTask.page === "new" ? "createTask" : "editTask"}
          />
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
              <InlineGrid columns={{ xs: 4 }} gap={"300"}>
                <Box></Box>
                <Button
                  icon={oldTask.page === "new" ? PlusIcon : EditIcon}
                  submit
                  variant="primary"
                  tone="success"
                >
                  {oldTask.page === "new" ? "Add" : "Edit"}
                </Button>
                <Link to="/">
                  <Button variant="secondary">Cancel</Button>
                </Link>
                <Box></Box>
              </InlineGrid>
            </Layout.Section>
          </Layout>
        </fetcher.Form>
      </Box>
    </Page>
  );
}
