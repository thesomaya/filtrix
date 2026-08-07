import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ComparePage from "./pages/ComparePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AccountSettings from "./pages/AccountSettings";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAttributeGroups from "./pages/admin/AdminAttributeGroups";
import AdminAttributes from "./pages/admin/AdminAttributes";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptionPlans from "./pages/admin/AdminSubscriptionPlans";
import AdminPayments from "./pages/admin/AdminPayments";
import { CompareProvider } from "./context/CompareContext";
import "./App.css"


function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes have their own sidebar layout, no storefront navbar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="attribute-groups" element={<AdminAttributeGroups />} />
            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subscription-plans" element={<AdminSubscriptionPlans />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Storefront routes keep the navbar */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/account" element={<AccountSettings />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </CompareProvider>
  );
}

export default App;
