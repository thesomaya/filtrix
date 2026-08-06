import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ComparePage from "./pages/ComparePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AccountSettings from "./pages/AccountSettings";
import { CompareProvider } from "./context/CompareContext";
import "./App.css"


function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/account" element={<AccountSettings />} />
        </Routes>
      </BrowserRouter>
    </CompareProvider>
  );
}

export default App;