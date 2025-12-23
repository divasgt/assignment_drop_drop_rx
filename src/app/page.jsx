"use client"

import { useEffect, useState } from "react"
import { MdEdit, MdDelete } from "react-icons/md"

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [addTaskLoading, setAddTaskLoading] = useState(false)
  const [newTaskFormShown, setNewTaskFormShown] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [saveEditLoading, setSaveEditLoading] = useState(false)
  
  async function fetchTasks() {
    try {
      setLoading(true)

      const res = await fetch("/api/tasks")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to select tasks")
      setTasks(data)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTasks()
  }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle) {
      alert("Please add a title.")
      return
    }
    
    try {
      setAddTaskLoading(true)

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: newTitle, description: newDesc})
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to add task")
      setTasks([data, ...tasks])
      setNewTitle("")
      setNewDesc("")
      setNewTaskFormShown(false)
    } catch(err) {
      alert(err.message)
    } finally {
      setAddTaskLoading(false)
    }
  }
  
  async function deleteTask(id) {
    if (!id) return

    try {
      setDeletingId(id)
      
      const res = await fetch(`/api/tasks?id=${id}`, {method: "DELETE"})
      const result = await res.json()
  
      if (!res.ok) throw new Error(result.error || "Failed to delete task")
      setTasks(tasks.filter(task => task.id !== id))
    } catch(err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function toggleTask(task) {
    try {
      setTogglingId(task.id)
      
      const res = await fetch(`/api/tasks?id=${task.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({is_completed: !task.is_completed})
      })
      const result = await res.json()
  
      if (!res.ok) throw new Error(result.error || "Failed to toggle task")
      
      setTasks(tasks.map(t => t.id===task.id ? result : t))
    } catch(err) {
      alert(err.message)
    } finally {
      setTogglingId(null)
    }
  }

  async function saveEdit(id) {
    try {
      setSaveEditLoading(true)
      
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to save edit.")
        
      setTasks(tasks.map((t) => (t.id === id ? result : t)))
      setEditingId(null)
      setEditTitle("")
      setEditDesc("")
    } catch (err) {
      alert(err.message)
    } finally {
      setSaveEditLoading(false)
    }
  }

  const tasksElements = tasks.map(task => (
    <div
      className="group flex items-start gap-4 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-200/10"
      key={task.id}
    >
      <input
        className="mt-1.5"
        type="checkbox"
        checked={task.is_completed}
        onChange={() => toggleTask(task)}
        disabled={togglingId === task.id}
      />

      <div className="flex-1 flex-col gap-1">
        {task.id === editingId
          ? (
          // Editing UI
          <>
            <input
              className="block w-full mb-2 border border-neutral-200/20 rounded-lg px-3 py-1"
              type="text"
              placeholder="Edit title:"
              value={editTitle}
              onChange={(e) => setEditTitle(e.currentTarget.value)}
              />

            <input
              className="block w-full border border-neutral-200/20 rounded-lg px-3 py-1"
              type="text"
              placeholder="Edit description:"
              value={editDesc}
              onChange={(e) => setEditDesc(e.currentTarget.value)}
            />
          </>
          ) : (
          // Display UI
          <>
            <h2>{task.title}</h2>
            <p className="text-neutral-400 text-sm">{task.description || "a"}</p>
          </>
          )
        }
      </div>

      {/* Edit and Delete buttons */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-100 flex flex-col items-start text-xs gap-2">
        {/* Show edit button, if editing show save and cancel buttons */}
        {!editingId
          ? <button
            className="flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer"
            onClick={() => {
              setEditingId(task.id)
              setEditTitle(task.title)
              setEditDesc(task.description)
            }}
          >
            <MdEdit className=" mt-0.5"/>Edit
          </button>
          : (
            <>
              <button
                className={`flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer ${saveEditLoading && "animate-pulse"}`}
                onClick={() => saveEdit(task.id)}
                disabled={saveEditLoading}
              >
                {saveEditLoading ? "Saving" : "Save"}
              </button>
              <button
                className="flex gap-2 rounded-lg border border-neutral-200/10 bg-neutral-600 px-2 py-1 hover:opacity-80 duration-200 cursor-pointer"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          )
        }

        <button
          className={`flex gap-2 items-center rounded-lg border border-neutral-200/10 bg-neutral-600 hover:bg-red-800 duration-200 px-2 py-1 hover:opacity-80 cursor-pointer ${deletingId===task.id && "animate-pulse"}`}
          onClick={() => deleteTask(task.id)}
          disabled={deletingId === task.id}
        >
          <MdDelete />{deletingId===task.id ? "Deleting" : "Delete"}
        </button>
      </div>
    </div>
  ))
  
  if (loading) return <div className="min-h-screen grid place-items-center p-8 animate-pulse">Loading...</div>
  if (error) return <div className="grid place-items-center p-8">Error: {error}</div>

  return (
  <main className="min-h-screen p-8">
    <h1 className="text-2xl font-bold mb-6 text-center">Task Board</h1>

    {/* Add new task form */}
    <div className="flex items-start gap-4 mb-4">
      <button
        className="rounded-lg border border-neutral-200/10 bg-green-800 px-3 py-1 hover:opacity-90 cursor-pointer"
        onClick={() => setNewTaskFormShown(!newTaskFormShown)}
      >+ New Task</button>
      
      {newTaskFormShown &&
        <form onSubmit={addTask} className="flex items-baseline gap-3">
          <div className="flex flex-col gap-1">
            <input
              className="border border-neutral-200/10 bg-neutral-800 rounded-lg px-3 py-1"
              type="text"
              placeholder="Title*"
              value={newTitle}
              onChange={(e) => setNewTitle(e.currentTarget.value)}
            />
            <input
              className="border border-neutral-200/10 bg-neutral-800 rounded-lg px-3 py-1"
              type="text"
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.currentTarget.value)}
            />
          </div>

          <button
            type="submit"
            className={`rounded-lg border border-neutral-200/10 bg-green-800 px-3 py-1 hover:opacity-90 cursor-pointer`}
            disabled={addTaskLoading}
          >
            <span className={addTaskLoading && "animate-pulse"}>
              {addTaskLoading ? "Adding..." : "Add"}
            </span>
          </button>
        </form>
      }

    </div>

    <div className="grid gap-y-3">
      {tasks.length === 0 
        ? <p className="text-center mt-20">No tasks. Try adding a new task.</p>
        : tasksElements
      }
    </div>
  </main> 
  )
}
