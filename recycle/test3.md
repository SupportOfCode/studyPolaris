import {
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  IndexFilters,
  IndexFiltersMode,
  ChoiceList,
} from "@shopify/polaris";
import { useState } from "react";

export default function SimpleIndexTableExample() {
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
      description:
        "Refactor the button components to use the new design system.",
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

  const resourceName = {
    singular: "task",
    plural: "tasks",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tasks);

  const [queryValue, setQueryValue] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [mode, setMode] = useState<IndexFiltersMode>(IndexFiltersMode.Default);

  // Lọc dữ liệu theo Priority, Status và Search Title
  const filteredTasks = tasks.filter(
    (task) =>
      (priorityFilter.length === 0 || priorityFilter.includes(task.priority)) &&
      (statusFilter.length === 0 || statusFilter.includes(task.status)) &&
      (queryValue === "" ||
        task.title.toLowerCase().includes(queryValue.toLowerCase()))
  );

  const rowMarkup = filteredTasks.map(
    ({ id, title, description, dueDate, priority, tags, status }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{description}</IndexTable.Cell>
        <IndexTable.Cell>{dueDate}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={
              priority === "High"
                ? "critical"
                : priority === "Medium"
                ? "attention"
                : "success"
            }
          >
            {priority}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {tags.map((tag, i) => (
            <Badge key={i} tone="info">
              {tag}
            </Badge>
          ))}
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
  );

  return (
    <>
      <IndexFilters
        queryValue={queryValue}
        queryPlaceholder="Search tasks..."
        onQueryChange={(value) => setQueryValue(value)}
        onQueryClear={() => setQueryValue("")}
        onClearAll={() => {
          setPriorityFilter([]);
          setStatusFilter([]);
          setQueryValue("");
        }}
        selected={
          priorityFilter.length > 0 ||
          statusFilter.length > 0 ||
          queryValue !== ""
            ? 1
            : 0
        }
        mode={mode}
        setMode={setMode}
        tabs={[{ content: "All Tasks", id: "all-tasks" }]}
        filters={[
          {
            key: "priority",
            label: "Priority",
            filter: (
              <ChoiceList
                title="Priority"
                allowMultiple
                choices={[
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                ]}
                selected={priorityFilter}
                onChange={(selected) => setPriorityFilter(selected)}
              />
            ),
          },
          {
            key: "status",
            label: "Status",
            filter: (
              <ChoiceList
                title="Status"
                allowMultiple
                choices={[
                  { label: "Pending", value: "Pending" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Completed", value: "Completed" },
                ]}
                selected={statusFilter}
                onChange={(selected) => setStatusFilter(selected)}
              />
            ),
          },
        ]}
      />
      <IndexTable
        resourceName={resourceName}
        itemCount={filteredTasks.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Title" },
          { title: "Description" },
          { title: "Due Date" },
          { title: "Priority" },
          { title: "Tags" },
          { title: "Status" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </>
  );
}
