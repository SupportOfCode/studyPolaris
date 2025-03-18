import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  ChoiceList,
  Badge,
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
    tags: ["bug", "payment"],
    status: "In Progress",
  },
  {
    id: "2",
    title: "Update UI components",
    description: "Refactor the button components to use the new design system.",
    dueDate: "2025-03-22",
    priority: "Medium",
    tags: ["UI", "refactor"],
    status: "Pending",
  },
  {
    id: "3",
    title: "Write unit tests",
    description: "Add Jest tests for the user authentication module.",
    dueDate: "2025-03-25",
    priority: "Low",
    tags: ["testing", "auth"],
    status: "Completed",
  },
  {
    id: "4",
    title: "Optimize database queries",
    description: "Improve MongoDB query performance for task retrieval.",
    dueDate: "2025-03-28",
    priority: "High",
    tags: ["database", "performance"],
    status: "In Progress",
  },
  {
    id: "5",
    title: "Integrate i18n",
    description: "Add multilingual support using i18next.",
    dueDate: "2025-04-01",
    priority: "Medium",
    tags: ["i18n", "localization"],
    status: "Pending",
  },
];

export default function TaskTable() {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState("");
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
  const handleQueryClear = useCallback(() => setQueryValue(""), []);
  const handleClearAll = useCallback(() => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setQueryValue("");
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

  const filteredTasks = tasks.filter(
    (task) =>
      (selectedStatus.length === 0 || selectedStatus.includes(task.status)) &&
      (selectedPriority.length === 0 ||
        selectedPriority.includes(task.priority)) &&
      (queryValue === "" ||
        task.title.toLowerCase().includes(queryValue.toLowerCase()))
  );

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
          { title: "Due Date" },
          { title: "Priority" },
          { title: "Status" },
        ]}
      >
        {filteredTasks.map(
          ({ id, title, dueDate, priority, status }, index) => (
            <IndexTable.Row id={id} key={id} position={index}>
              <IndexTable.Cell>{title}</IndexTable.Cell>
              <IndexTable.Cell>{dueDate}</IndexTable.Cell>
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
