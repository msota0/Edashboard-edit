import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
// import { useHistory } from "react-router-dom"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import TableComponent from './components/table/TableCompnent.jsx'; // Import your TableComponent here
// import LandingPage from './components/landing/LandingPage.jsx'; // Assuming you have a LandingPage component

// function Root() {
//   const navigate = useNavigate();
//   const [tableData, setTableData] = useState(null);

//   const handleFormSubmit = (jsonData) => {
//     setTableData(jsonData);
//     navigate('/table');
//   };

//   return (
//     <div>
//       {/* <button onClick={() => navigate(-1)}>go back</button> */}
//       <Routes>
//         <Route path="/" element={<LandingPage onSubmit={handleFormSubmit} />} />
//         <Route path="/table" element={<TableComponent data={tableData} />} />
//       </Routes>
//     </div>
//   );
// }

function App() {
  return (
    < TableComponent />
  );
}

export default App;