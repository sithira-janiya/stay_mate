import React from "react";
import "./App.css";
import Test from "./components/Test"; // ✅ no .jsx in import
console.log(Test); 

function App() {
  return (
    <div className="App">
      <h1>Hello from App</h1>
      <Test />   {/* ✅ capitalized */}
    </div>
  );
}

export default App;
