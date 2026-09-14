import React from "react";
import ImprovedTable from "./ImprovedTable";
import "./ImprovedTable.css";

const testData = [
  {
    name: "Arun",
    age: 21,
    salary: 35000,
    department: "CSE",
  },
  {
    name: "Priya",
    age: 22,
    salary: 38000,
    department: "IT",
  },
  {
    name: "Kavin",
    age: 250,
    salary: 180000,
    department: "CSE",
  },
  {
    name: "Divya",
    age: null,
    salary: 36000,
    department: "ECE",
  },
  {
    name: "Ravi",
    age: 23,
    salary: 40000,
    department: "IT",
  },
  {
    name: "Ravi",
    age: 23,
    salary: 40000,
    department: "IT",
  },
];

function App() {
  return (
    <div className="app-container">
      <ImprovedTable data={testData} />
    </div>
  );
}

export default App;
