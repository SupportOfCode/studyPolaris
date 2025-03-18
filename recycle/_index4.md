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
  useSetIndexFiltersMode,
  IndexFiltersMode,
  ChoiceList,
  IndexFilters,
} from "@shopify/polaris";
import type { IndexFiltersProps } from "@shopify/polaris";
import { EditIcon, PlusIcon } from "@shopify/polaris-icons";
import { useState, useEffect, useCallback } from "react";
import { deleteTaskPro, getTaskPro } from "~/utils/tasks";
import { TaskType } from "~/utils/types";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "";
  const tags = url.searchParams.get("tags") || "";
  const status = url.searchParams.get("status") || "";
  const priority = url.searchParams.get("priority") || "";
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";

  const query: Record<string, any> = {};
  if (title) query.title = title;
  if (tags) query.tag = tags;
  if (fromDate) query.fromDate = fromDate;
  if (toDate) query.toDate = toDate;
  if (status && status !== "undefined") query.status = status;
  if (priority && priority !== "undefined") query.priority = priority;

  try {
    const tasks = await getTaskPro(query);
    const formattedTasks = tasks.map((task: any) => ({
      ...task,
      _id: task._id.toString(),
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "N/A",
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
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [taggedWith, setTaggedWith] = useState(searchParams.get("tag") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [modalActive, setModalActive] = useState(false);

  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const handleStatusChange = useCallback(
    (value: string[]) => setSelectedStatus(value),
    []
  );
  const handlePriorityChange = useCallback(
    (value: string[]) => setSelectedPriority(value),
    []
  );
  const handleQueryChange = useCallback((value: string) => setTitle(value), []);
  const handleFromDateChange = useCallback(
    (value: string) => setFromDate(value),
    []
  );
  const handleToDateChange = useCallback(
    (value: string) => setToDate(value),
    []
  );
  const handleTaggedWithChange = useCallback(
    (value: string) => setTaggedWith(value),
    []
  );

  const handleQueryClear = useCallback(() => setTitle(""), []);
  const handleClearAll = useCallback(() => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setTitle("");
    setFromDate("");
    setToDate("");
    setTaggedWith("");
  }, []);

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (selectedStatus.length > 0) {
    appliedFilters.push({
      key: "status",
      label: `Status: ${selectedStatus.join(", ")}`,
      onRemove: () => setSelectedStatus([]),
    });
  }
  if (selectedPriority.length > 0) {
    appliedFilters.push({
      key: "priority",
      label: `Priority: ${selectedPriority.join(", ")}`,
      onRemove: () => setSelectedPriority([]),
    });
  }
  if (fromDate || toDate) {
    appliedFilters.push({
      key: "dueDate",
      label: `Due Date: ${fromDate || "..."} → ${toDate || "..."}`,
      onRemove: () => {
        setFromDate("");
        setToDate("");
      },
    });
  }
  if (taggedWith) {
    appliedFilters.push({
      key: "taggedWith",
      label: `Tagged with: ${taggedWith}`,
      onRemove: () => setTaggedWith(""),
    });
  }

  // const filteredTasks = tasks.filter((task: any) => {
  //   const taskDate = new Date(task.dueDate);
  //   const startDate = fromDate ? new Date(fromDate) : null;
  //   const endDate = toDate ? new Date(toDate) : null;

  //   return (
  //     (selectedStatus.length === 0 || selectedStatus.includes(task.status)) &&
  //     (selectedPriority.length === 0 ||
  //       selectedPriority.includes(task.priority)) &&
  //     (title === "" ||
  //       task.title.toLowerCase().includes(title.toLowerCase())) &&
  //     (!startDate || taskDate >= startDate) &&
  //     (!endDate || taskDate <= endDate) &&
  //     (taggedWith === "" ||
  //       task.tags.toLowerCase().includes(taggedWith.toLowerCase()))
  //   );
  // });

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tasks, {
      resourceIDResolver: (task) => String(task._id),
    });

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (title) {
        params.set("title", title);
      } else {
        params.delete("title");
      }

      if (taggedWith) {
        params.set("tags", taggedWith);
      } else {
        params.delete("tags");
      }

      if (fromDate) {
        params.set("fromDate", fromDate);
      } else {
        params.delete("fromDate");
      }

      if (toDate) {
        params.set("toDate", toDate);
      } else {
        params.delete("toDate");
      }

      if (selectedStatus) {
        params.set("status", selectedStatus[0]);
      } else {
        params.delete("status");
      }

      if (selectedPriority) {
        params.set("priority", selectedPriority[0]);
      } else {
        params.delete("priority");
      }

      setSearchParams(params);
    }, 500);
    return () => clearTimeout(handler);
  }, [
    title,
    taggedWith,
    fromDate,
    toDate,
    selectedStatus,
    selectedPriority,
    setSearchParams,
  ]);

  const handleDelete = async () => {
    if (selectedResources.length > 0) {
      const formData = new FormData();
      selectedResources.forEach((id) => formData.append("ids", id));
      fetcher.submit(formData, { method: "delete" });
      setModalActive(false);
    }
  };

  return (
    <Page title="Task List">
      <Card>
        <InlineGrid columns={{ xs: 3, sm: 3, lg: 3 }}>
          <Link to="/task/new">
            <Button size="large" icon={PlusIcon} fullWidth>
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
        <IndexFilters
          queryValue={title}
          queryPlaceholder="Search tasks"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          selected={0}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
          tabs={[]}
          filters={[
            {
              key: "status",
              label: "Status",
              filter: (
                <ChoiceList
                  title="Status"
                  choices={[
                    { label: "Not Started", value: "Not Started" },
                    { label: "In Progress", value: "In Progress" },
                    { label: "Completed", value: "Completed" },
                  ]}
                  selected={selectedStatus}
                  onChange={handleStatusChange}
                  allowMultiple
                />
              ),
              pinned: true,
            },
            {
              key: "priority",
              label: "Priority",
              filter: (
                <ChoiceList
                  title="Priority"
                  choices={[
                    { label: "Low", value: "Low" },
                    { label: "Medium", value: "Medium" },
                    { label: "High", value: "High" },
                  ]}
                  selected={selectedPriority}
                  onChange={handlePriorityChange}
                  allowMultiple
                />
              ),
              pinned: true,
            },
            {
              key: "dueDate",
              label: "Due Date",
              filter: (
                <>
                  <TextField
                    type="date"
                    label="From"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    autoComplete="off"
                  />
                  <TextField
                    type="date"
                    label="To"
                    value={toDate}
                    onChange={handleToDateChange}
                    autoComplete="off"
                  />
                </>
              ),
              pinned: true,
            },
            {
              key: "taggedWith",
              label: "Tagged with",
              filter: (
                <TextField
                  label="Tagged with"
                  value={taggedWith}
                  onChange={handleTaggedWithChange}
                  autoComplete="off"
                  labelHidden
                />
              ),
              pinned: true,
            },
          ]}
          mode={mode}
          setMode={setMode}
        />
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
                  {/* {Array.isArray(tags) && tags.length > 0
                    ? tags.map((tag, i) => (
                        <Badge key={i} tone="info">
                          {tag}
                        </Badge>
                      ))
                    : "No tags"} */}

                  {(tags?.split(",") ?? []).length > 0 &&
                  (tags?.split(",") ?? [])[0] !== ""
                    ? (tags?.split(",") ?? [])
                        .map((tag: string) => tag.trim())
                        .map((tag, i) => (
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
