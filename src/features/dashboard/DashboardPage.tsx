import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUser,
  toggleTaskForUser,
  updateTaskForUser,
} from "../../db/tasksRepo";
import type { Task, User } from "../../types/models";

type DashboardPageProps = {
  user: User;
  onLogout: () => void;
};

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );

  const loadTasks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextTasks = await listTasksForUser(user.id);
      setTasks(nextTasks);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unable to load tasks.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [user.id]);

  const onCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await createTaskForUser(user.id, title, description);
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to create task.";
      setError(message);
    }
  };

  const onToggleTask = async (task: Task) => {
    setError("");
    try {
      await toggleTaskForUser(user.id, task.id, !task.completed);
      await loadTasks();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to update task.";
      setError(message);
    }
  };

  const onDeleteTask = async (taskId: string) => {
    setError("");
    try {
      await deleteTaskForUser(user.id, taskId);
      await loadTasks();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to delete task.";
      setError(message);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
  };

  const onSaveEdit = async (taskId: string) => {
    setError("");
    try {
      await updateTaskForUser(
        user.id,
        taskId,
        editingTitle,
        editingDescription,
      );
      cancelEditing();
      await loadTasks();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save task edits.";
      setError(message);
    }
  };

  return (
    <main className="dashboard-layout" data-testid="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Todo Trainer</p>
          <h1>{user.username}&apos;s dashboard</h1>
          <p className="subtitle">
            {completedCount} of {tasks.length} tasks complete
          </p>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={onLogout}
          data-testid="logout-button"
        >
          Logout
        </button>
      </header>

      <section className="panel" data-testid="create-task-panel">
        <h2>Create task</h2>
        <form onSubmit={onCreateTask} className="task-form">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write tests for auth flow"
            data-testid="input-task-title"
          />

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details"
            rows={3}
            data-testid="input-task-description"
          />

          <button type="submit" data-testid="create-task-button">
            Add task
          </button>
        </form>
      </section>

      <section className="panel" data-testid="tasks-list-panel">
        <h2>Your tasks</h2>

        {error ? (
          <p className="error-message" data-testid="task-error">
            {error}
          </p>
        ) : null}
        {isLoading ? <p data-testid="tasks-loading">Loading tasks...</p> : null}
        {!isLoading && tasks.length === 0 ? (
          <p data-testid="tasks-empty">No tasks yet. Create your first one.</p>
        ) : null}

        <ul className="tasks-list" data-testid="tasks-list">
          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            return (
              <li
                key={task.id}
                className="task-item"
                data-testid={`task-item-${task.id}`}
              >
                <div className="task-item-top">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task)}
                      data-testid={`task-toggle-${task.id}`}
                    />
                    <span
                      className={
                        task.completed ? "task-title completed" : "task-title"
                      }
                    >
                      {task.title}
                    </span>
                  </label>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => startEditing(task)}
                      data-testid={`task-edit-${task.id}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => onDeleteTask(task.id)}
                      data-testid={`task-delete-${task.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="task-description">
                  {task.description || "No description"}
                </p>

                {isEditing ? (
                  <div
                    className="edit-panel"
                    data-testid={`task-edit-panel-${task.id}`}
                  >
                    <label>
                      Edit title
                      <input
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        data-testid={`task-edit-title-${task.id}`}
                      />
                    </label>

                    <label>
                      Edit description
                      <textarea
                        value={editingDescription}
                        onChange={(event) =>
                          setEditingDescription(event.target.value)
                        }
                        rows={3}
                        data-testid={`task-edit-description-${task.id}`}
                      />
                    </label>

                    <div className="task-actions">
                      <button
                        type="button"
                        onClick={() => onSaveEdit(task.id)}
                        data-testid={`task-save-${task.id}`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={cancelEditing}
                        data-testid={`task-cancel-${task.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
