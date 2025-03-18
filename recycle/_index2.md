import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  useFetcher,
  Link,
} from "@remix-run/react";
import {
  Page,
  IndexTable,
  Card,
  useIndexResourceState,
  TextField,
  Button,
  Badge,
  Modal,
  InlineGrid,
  Box,
} from "@shopify/polaris";
import { EditIcon, PlusIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import { deleteTaskPro, getTaskPro } from "~/utils/tasks";
import { TaskType } from "~/utils/types";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("search") || "";

  try {
    const tasks = await getTaskPro({ title: searchQuery });
    const formattedTasks = tasks.map((task: any) => ({
      ...task,
      _id: task._id.toString(),
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "N/A",
      tags: task.tags
        ? task.tags.split(",").map((tag: string) => tag.trim())
        : [],
    }));
    return formattedTasks;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return [];
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const ids = formData.getAll("ids") as string[];

  if (request.method === "DELETE") {
    return await deleteTaskPro(ids);
  }
};

export default function Index() {
  const tasks = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [modalActive, setModalActive] = useState(false);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tasks, {
      resourceIDResolver: (task) => String(task._id),
    });

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      setSearchParams(params);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, setSearchParams]);

  const handleDelete = async () => {
    if (selectedResources.length > 0) {
      const formData = new FormData();
      selectedResources.forEach((id) => formData.append("ids", id));
      fetcher.submit(formData, { method: "delete" });
      setModalActive(false);
    }
  };

  console.log("tasks", tasks);

  return (
    <Page title="Task List">
      <Card>
        <TextField
          label="Search Tasks"
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Type to search..."
          autoComplete="on"
        />
      </Card>

      <Card>
        <InlineGrid columns={{ xs: 3, sm: 3, lg: 3 }}>
          <Link to="/task/new">
            <Button size="large" icon={PlusIcon}>
              Add Task
            </Button>
          </Link>
          <Box></Box>
          <Button
            disabled={selectedResources.length === 0}
            onClick={() => setModalActive(true)}
          >
            Delete tasks
          </Button>
        </InlineGrid>
      </Card>

      <Card>
        <IndexTable
          resourceName={{ singular: "task", plural: "tasks" }}
          itemCount={tasks.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Title" },
            { title: "Description" },
            { title: "Status" },
            { title: "Priority" },
            { title: "Due Date" },
            { title: "Tags" },
            { title: "Actions" },
          ]}
        >
          {tasks.map(
            (
              {
                _id,
                title,
                description,
                status,
                priority,
                dueDate,
                tags,
              }: TaskType,
              index: number
            ) => (
              <IndexTable.Row
                id={_id ?? ""}
                key={_id}
                position={index}
                selected={selectedResources.includes(_id ?? "")}
              >
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>
                  {description || "No description"}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge
                    tone={
                      status === "Completed"
                        ? "success"
                        : status === "In Progress"
                        ? "attention"
                        : "critical"
                    }
                  >
                    {status}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge
                    tone={
                      priority === "Low"
                        ? "success"
                        : priority === "Medium"
                        ? "attention"
                        : "critical"
                    }
                  >
                    {priority}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{dueDate}</IndexTable.Cell>
                <IndexTable.Cell>
                  {Array.isArray(tags) && tags.length > 0
                    ? tags.map((tag, i) => (
                        <Badge key={i} tone="info">
                          {tag}
                        </Badge>
                      ))
                    : "No tags"}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Link to={`/task/${_id}`}>
                    <Button icon={EditIcon}>Edit</Button>
                  </Link>
                </IndexTable.Cell>
              </IndexTable.Row>
            )
          )}
        </IndexTable>
      </Card>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={`Are you sure you want to delete ${selectedResources.length} task(s)?`}
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDelete,
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setModalActive(false) },
        ]}
      >
        <Modal.Section>
          <p>This action cannot be undone.</p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
