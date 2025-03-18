import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  ChoiceList,
  Badge,
  TextField,
} from "@shopify/polaris";
import type { IndexFiltersProps } from "@shopify/polaris";
import { useState, useCallback } from "react";

const tasks = [
  {
    id: "1",
    title: "Fix checkout bug",
    description: "Resolve the payment gateway issue on checkout page.",
    dueDate: "2025-03-20",
    priority: "High",
    tags: "bug, payment",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Update UI components",
    description: "Refactor the button components to use the new design system.",
    dueDate: "2025-03-22",
    priority: "Medium",
    tags: "UI, refactor",
    status: "Pending",
  },
  {
    id: "3",
    title: "Write unit tests",
    description: "Add Jest tests for the user authentication module.",
    dueDate: "2025-03-25",
    priority: "Low",
    tags: "testing, auth",
    status: "Completed",
  },
  {
    id: "4",
    title: "Optimize database queries",
    description: "Improve MongoDB query performance for task retrieval.",
    dueDate: "2025-03-28",
    priority: "High",
    tags: "database, performance",
    status: "In Progress",
  },
  {
    id: "5",
    title: "Integrate i18n",
    description: "Add multilingual support using i18next.",
    dueDate: "2025-04-01",
    priority: "Medium",
    tags: "i18n, localization",
    status: "Pending",
  },
];

export default function TaskTable() {
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

  const filteredTasks = tasks.filter((task) => {
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

  return (
    <LegacyCard>
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
                  { label: "Pending", value: "Pending" },
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
      <IndexTable
        resourceName={{ singular: "task", plural: "tasks" }}
        itemCount={filteredTasks.length}
        headings={[
          { title: "Title" },
          { title: "Description" },
          { title: "Due Date" },
          { title: "Tags" },
          { title: "Priority" },
          { title: "Status" },
        ]}
      >
        {filteredTasks.map(
          (
            { id, title, description, tags, dueDate, priority, status },
            index
          ) => (
            <IndexTable.Row id={id} key={id} position={index}>
              <IndexTable.Cell>{title}</IndexTable.Cell>
              <IndexTable.Cell>{description}</IndexTable.Cell>
              <IndexTable.Cell>{dueDate}</IndexTable.Cell>
              <IndexTable.Cell>{tags}</IndexTable.Cell>
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
            </IndexTable.Row>
          )
        )}
      </IndexTable>
    </LegacyCard>
  );
}
