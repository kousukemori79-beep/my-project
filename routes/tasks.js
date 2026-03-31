const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const TASKS_FILE = path.join(__dirname, "..", "data", "tasks.json");

function readTasks() {
  const data = fs.readFileSync(TASKS_FILE, "utf-8");
  return JSON.parse(data).tasks;
}

function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks }, null, 2) + "\n");
}

// GET /tasks - List all tasks, with optional status filter
router.get("/", (req, res) => {
  let tasks = readTasks();
  const { status } = req.query;
  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  res.json({ tasks });
});

// GET /tasks/:id - Get a single task
router.get("/:id", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json({ task });
});

// POST /tasks - Create a new task
router.post("/", (req, res) => {
  const { title, description } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  const tasks = readTasks();
  const now = new Date().toISOString();
  const task = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description ? String(description).trim() : "",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json({ task });
});

// PUT /tasks/:id - Update a task
router.put("/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, description, status } = req.body;
  const validStatuses = ["pending", "in_progress", "done"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  const task = tasks[index];
  if (title !== undefined) task.title = String(title).trim();
  if (description !== undefined) task.description = String(description).trim();
  if (status !== undefined) task.status = status;
  task.updatedAt = new Date().toISOString();

  tasks[index] = task;
  writeTasks(tasks);
  res.json({ task });
});

// DELETE /tasks/:id - Delete a task
router.delete("/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const [removed] = tasks.splice(index, 1);
  writeTasks(tasks);
  res.json({ deleted: removed });
});

module.exports = router;
