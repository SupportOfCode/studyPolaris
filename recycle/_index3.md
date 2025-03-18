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
  const searchQuery = url.searchParams.get("search") || "";

  try {
    const tasks = await getTaskPro({ title: searchQuery });
    const formattedTasks = tasks.map((task: any) => ({
      ...task,
      _id: task._id.toString(),
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "N/A",
      // tags: task.tags
      //   ? task.tags.split(",").map((tag: string) => tag.trim())
      //   : [],
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

  // demo code haven't done
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [taggedWith, setTaggedWith] = useState("");

  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const handleStatusChange = useCallback(
    (value: string[]) => setSelectedStatus(value),
    []
  );
  const handlePriorityChange = useCallback(
    (value: string[]) => setSelectedPriority(value),
    []
  );
  const handleQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );
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

  const handleQueryClear = useCallback(() => setQueryValue(""), []);
  const handleClearAll = useCallback(() => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setQueryValue("");
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

  const filteredTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.dueDate);
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;

    return (
      (selectedStatus.length === 0 || selectedStatus.includes(task.status)) &&
      (selectedPriority.length === 0 ||
        selectedPriority.includes(task.priority)) &&
      (queryValue === "" ||
        task.title.toLowerCase().includes(queryValue.toLowerCase())) &&
      (!startDate || taskDate >= startDate) &&
      (!endDate || taskDate <= endDate) &&
      (taggedWith === "" ||
        task.tags.toLowerCase().includes(taggedWith.toLowerCase()))
    );
  });

  ////////////////////////////////

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
          queryValue={queryValue}
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
          {filteredTasks.map(
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
