import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import Footer from "./components/Footer";
import About from "./components/About";

function App() {
  const [showAddTask, setShowAddTask] = useState(false)
  const [tasks, setTasks] = useState([])

  useEffect(() => { //cant add async directly here
    const getTasks = async () => {
      const tasksFromServer = await fetchTasks()
      setTasks(tasksFromServer)
    }
    
    getTasks()

  }, []) //no dependencies

  //get tasks form JSON server
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/tasks")
    const data = await res.json()

    return data
  }

  //get single tasks form JSON server
  const fetchTask = async (id) => {
    const res = await fetch(`http://localhost:5000/tasks/${id}`)
    const data = await res.json()

    return data
  }

  //add task
  const addTask = async (task) => {
    //JSON server automatically adds ID
    const res = await fetch(`http://localhost:5000/tasks`, {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(task)
    })

    const newTask = await res.json()

    setTasks([...tasks, newTask])
  }

  //Delete task from server, have to pass this down
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'DELETE'
    })

    setTasks(tasks.filter((task) => (task.id !== id)))
  }

  //Toggle reminder and save to JSON server
  const toggleReminder = async (id) => {
    const taskToToggle = await fetchTask(id)
    const updateTask = {...taskToToggle, reminder: !taskToToggle.reminder}

    const res = await fetch(`http://localhost:5000/tasks/${id}`,{
      method: "PUT", //update
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(updateTask)
    })

    const data = await res.json()

    setTasks(
      tasks.map((task) => ( 
        task.id === id ? 
        { ...task, reminder: data.reminder} : 
        task)))
  }



  return (
    <Router>
    <div className="container">
      <Header onAdd={() => setShowAddTask(!showAddTask)} showAddTask={showAddTask}/>
      <Routes>
        <Route path="/" element={
          //fragment
          <> 
            {showAddTask && <AddTask onAdd={addTask} />}
            { tasks.length > 0 ? 
            <Tasks tasks={tasks} onDelete={deleteTask} onToggle={toggleReminder}/> : 
            "No Tasks"}
          </>
        } />
        <Route path="/about" element={<About/>} />
      </Routes>
      <Footer />
    </div>
    </Router>
  );
}

export default App;
