import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Box,
  InlineGrid,
  Button,
  Text,
  TextField,
  Badge,
  Grid,
  Frame,
  Modal,
} from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { useTaskStore } from "~/store";
import { deleteTask, getAllTasks } from "~/utils/tasks";

export const loader: LoaderFunction = async () => {
  try {
    const response = await getAllTasks();
    const tasks = await response.json();

    const formattedTasks = tasks.map((task: any) => ({
      ...task,
      dueDate: new Date(task.dueDate).toLocaleDateString("vi-VN"),
      tags: task.tags.includes(",")
        ? task.tags.split(",").map((tag: string) => tag.trim())
        : [task.tags],
    }));

    return formattedTasks;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return [];
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const action = formData.get("action") as string;

  if (action === "deleteTask") {
    return await deleteTask(id);
  }
};

export default function Index() {
  const tasks = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [search, setSearch] = useState("");
  const { deleteTask, taskList, setTasks } = useTaskStore();

  useEffect(() => {
    setTasks(tasks);
  }, [tasks, setTasks]);

  console.log(taskList);

  const hanldeDate = (date: any) => {
    const data = date
      .split("/")
      .map((tag: string) => tag.trim())
      .map(Number)
      .reduce((sum: number, num: number) => sum + num, 0);
    return data;
  };

  const handleExpired = (date: string) => {
    const formattedDate = new Date().toLocaleDateString("vi-VN");
    return hanldeDate(date) <= hanldeDate(formattedDate);
  };

  const [modalActive, setModalActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const openModal = (id: string) => {
    setSelectedTask(id);
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
    setSelectedTask(null);
  };

  const handleDelete = async () => {
    if (selectedTask) {
      deleteTask(selectedTask);
      const formData = new FormData();
      formData.append("action", "deleteTask");
      formData.append("id", selectedTask);
      fetcher.submit(formData, { method: "delete" });
      closeModal();
    }
  };

  const filteredTasks = tasks.filter(
    (task: any) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Frame>
      <Page title="Task List" narrowWidth>
        <Box
          background="bg-fill-secondary"
          padding="600"
          borderRadius="300"
          shadow="400"
        >
          <Layout>
            <Layout.Section>
              <Box padding="600">
                <InlineGrid columns={{ xs: 1, sm: 4 }} gap="500">
                  <Link to="/addPage/new">
                    <Button size="large">➕ Add Task</Button>
                  </Link>
                </InlineGrid>
              </Box>
            </Layout.Section>

            {/* Search Bar */}
            <Layout.Section>
              <Box paddingInline="600">
                <TextField
                  value={search}
                  onChange={(value) => setSearch(value)}
                  label=""
                  placeholder="Search..."
                  autoComplete="on"
                />
              </Box>
            </Layout.Section>

            {/* List Items */}
            <Layout.Section>
              {filteredTasks.length === 0 ? (
                <Text as="p" alignment="center" tone="subdued">
                  No tasks found.
                </Text>
              ) : (
                filteredTasks.map((task: any) => (
                  <Box key={task._id}>
                    <Box
                      padding="600"
                      background="bg-surface"
                      borderRadius="300"
                      shadow="300"
                    >
                      <Grid columns={{ xs: 6, sm: 6, lg: 6 }}>
                        <Grid.Cell columnSpan={{ sm: 4, xs: 4, lg: 4 }}>
                          <InlineGrid columns={{ xs: 2, sm: 2 }} gap="600">
                            <Badge
                              tone={
                                task.status === "Completed"
                                  ? "success"
                                  : task.status === "In Progress"
                                  ? "attention"
                                  : "critical"
                              }
                              size="large"
                            >
                              {task.status}
                            </Badge>
                            <Badge
                              tone={
                                task.priority === "Low"
                                  ? "success"
                                  : task.priority === "Medium"
                                  ? "attention"
                                  : "critical"
                              }
                              size="large"
                            >
                              {task.priority}
                            </Badge>
                          </InlineGrid>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, lg: 6 }}>
                          <Text as="p" variant="heading2xl" fontWeight="bold">
                            {task.title}
                          </Text>
                          <Box paddingBlockStart={"400"}>
                            <Text as="p" variant="headingLg" tone="subdued">
                              {task.description}
                            </Text>
                          </Box>
                          <Box paddingBlock={"400"}>
                            {handleExpired(task.dueDate) ? (
                              <Text
                                as="p"
                                variant="bodyMd"
                                tone="subdued"
                                textDecorationLine="line-through"
                              >
                                Due Date: {task.dueDate}
                              </Text>
                            ) : (
                              <Text as="p" variant="bodyMd" tone="subdued">
                                Due Date: {task.dueDate}
                              </Text>
                            )}
                          </Box>
                          <InlineGrid columns={{ xs: 6, sm: 6 }} gap="300">
                            {task.tags.length === 1 && task.tags[0] === ""
                              ? ""
                              : task.tags.map((tag: string, index: number) => (
                                  <Badge key={index} tone="info">
                                    {tag}
                                  </Badge>
                                ))}
                          </InlineGrid>
                        </Grid.Cell>

                        <Grid.Cell
                          columnSpan={{ xs: 4, sm: 4, lg: 4 }}
                        ></Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 2, sm: 2, lg: 2 }}>
                          <InlineGrid
                            columns={{ xs: 2, sm: 2 }}
                            gap="100"
                            alignItems="end"
                          >
                            <Link to={`/addPage/${task._id}`}>
                              <Button
                                icon={EditIcon}
                                variant="secondary"
                                size="large"
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              icon={DeleteIcon}
                              variant="primary"
                              tone="critical"
                              size="large"
                              onClick={() => openModal(task._id)}
                            >
                              Delete
                            </Button>
                          </InlineGrid>
                        </Grid.Cell>
                      </Grid>
                    </Box>
                    <Box minHeight="20px" />
                  </Box>
                ))
              )}
            </Layout.Section>
          </Layout>
        </Box>
      </Page>

      <Modal
        open={modalActive}
        onClose={closeModal}
        title="Are you sure you want to delete this task?"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDelete,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: closeModal,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">This action cannot be undone.</Text>
        </Modal.Section>
      </Modal>
    </Frame>
  );
}
