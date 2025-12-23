"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
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
      console.log(tasks)
    }
  }
  
  useEffect(() => {
    fetchTasks()
  }, [])
  

  const tasksElements = tasks.map(task => (
    <div
      className="flex items-baseline gap-4 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-200/10"
      key={task.id}
    >
      <input
        type="checkbox"
        checked={task.is_completed}
        onChange={null}
      ></input>

      <div>
        <h2>{task.title}</h2>
        <p className="text-neutral-400 text-sm">{task.description || "a"}</p>
      </div>
    </div>
  ))
  
  if (loading) return <div className="grid place-items-center p-8 animate-pulse">Loading...</div>
  if (error) return <div className="grid place-items-center p-8">Error: {error}</div>
  return (
  <main className="min-h-screen p-8">
    <h1 className="text-2xl font-bold mb-6 text-center">Task Board</h1>
    <div className="grid gap-y-3">
      {tasksElements}
    </div>
  </main> 
  )
}
