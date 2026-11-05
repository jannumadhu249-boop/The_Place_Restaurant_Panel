import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Components
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';

// Pages
import Dashboard from './pages/Dashboard';
import Reviews from './pages/Reviews';

// Happy Hours
import HappyHours from './pages/HappyHours/HappyHours';
import CreateHappyHour from './pages/HappyHours/CreateHappyHour';
import EditHappyHour from './pages/HappyHours/EditHappyHour';

// Coupons
import Coupons from './pages/Coupons/Coupons';
import CreateCoupon from './pages/Coupons/CreateCoupon';
import EditCoupon from './pages/Coupons/EditCoupon';

// Campaigns
import Campaign from './pages/Campaigns/Campaign';
import CreateCampaign from './pages/Campaigns/CreateCampaign';
import EditCampaign from './pages/Campaigns/EditCampaign';

// My Wallet
import MyWallet from './pages/MyWallet/MyWallet';
import RequestPayout from './pages/MyWallet/RequestPayout';

// Reports Management
import OrderReport from './pages/ReportsManagement/OrderReport';
import TaxReport from './pages/ReportsManagement/TaxReport';
import TransactionReport from './pages/ReportsManagement/TransactionReport';
import FoodReport from './pages/ReportsManagement/FoodReport';

// Employee Management
import EmployeeRole from './pages/EmployeeManagement/EmployeeRole';
import CreateEmployeeRole from './pages/EmployeeManagement/CreateEmployeeRole';
import EditEmployeeRole from './pages/EmployeeManagement/EditEmployeeRole';
import Employees from './pages/EmployeeManagement/Employees';
import CreateEmployee from './pages/EmployeeManagement/CreateEmployee';
import EditEmployee from './pages/EmployeeManagement/EditEmployee';

// Food Management
import Foods from './pages/FoodManagement/Foods';
import CreateFood from './pages/FoodManagement/CreateFood';
import EditFood from './pages/FoodManagement/EditFood';
import Categories from './pages/FoodManagement/Categories';
import CreateCategory from './pages/FoodManagement/CreateCategory';
import EditCategory from './pages/FoodManagement/EditCategory';
import SubCategories from './pages/FoodManagement/SubCategories';
import CreateSubCategory from './pages/FoodManagement/CreateSubCategory';
import EditSubCategory from './pages/FoodManagement/EditSubCategory';

// Order Management
import Orders from './pages/OrderManagement/Orders';
import ViewOrder from './pages/OrderManagement/ViewOrder';

// Service Options
import DineIn from './pages/ServiceOptions/DineIn';
import Takeaway from './pages/ServiceOptions/Takeaway';
import Tables from './pages/ServiceOptions/Tables';
import Captains from './pages/ServiceOptions/Captains';
import FloorSections from './pages/ServiceOptions/FloorSections';

// Billing
import Billing from './pages/BillingSettlement/Billing';

function getStoredToken() {
  return localStorage.getItem('token') || '';
}

/** Blocks panel routes when there is no auth token — redirects to login (keeps intended path). */
function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated || !getStoredToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Sends already-logged-in users away from login / forgot-password. */
function PublicOnlyRoute({ isAuthenticated, children }) {
  if (isAuthenticated && getStoredToken()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));

  // Keep React state in sync if token is cleared elsewhere (e.g. another tab)
  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(getStoredToken()));
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_user');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes — only when logged out */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <Login onLogin={handleLogin} />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* Panel Main Routes — require token */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="restaurant" element={<Navigate to="/profile" replace />} />
          <Route path="change-password" element={<ChangePassword />} />

          {/* Happy Hours */}
          <Route path="happy-hours" element={<HappyHours />} />
          <Route path="happy-hours/create" element={<CreateHappyHour />} />
          <Route path="happy-hours/edit/:id" element={<EditHappyHour />} />
          <Route path="happy-hour" element={<Navigate to="/happy-hours" replace />} />

          {/* Coupons */}
          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/create" element={<CreateCoupon />} />
          <Route path="coupons/edit/:id" element={<EditCoupon />} />
          <Route path="coupon" element={<Navigate to="/coupons" replace />} />

          {/* Campaigns */}
          <Route path="campaigns" element={<Campaign />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="campaigns/edit/:id" element={<EditCampaign />} />
          <Route path="campaign" element={<Navigate to="/campaigns" replace />} />

          {/* Wallet */}
          <Route path="my-wallet" element={<MyWallet />} />
          <Route path="my-wallet/request-payout" element={<RequestPayout />} />
          <Route path="wallet" element={<Navigate to="/my-wallet" replace />} />
          <Route path="wallet/request-payout" element={<Navigate to="/my-wallet/request-payout" replace />} />

          {/* Reports Management */}
          <Route path="reports/order" element={<OrderReport />} />
          <Route path="reports/tax" element={<TaxReport />} />
          <Route path="reports/transaction" element={<TransactionReport />} />
          <Route path="reports/food" element={<FoodReport />} />

          {/* Reviews */}
          <Route path="reviews" element={<Reviews />} />
          <Route path="review" element={<Navigate to="/reviews" replace />} />

          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/view/:id" element={<ViewOrder />} />

          {/* Service Options */}
          <Route path="service/dine-in" element={<DineIn />} />
          <Route path="service/takeaway" element={<Takeaway />} />
          <Route path="service/tables" element={<Tables />} />
          <Route path="service/captains" element={<Captains />} />
          <Route path="service/floor-sections" element={<FloorSections />} />
          <Route path="dine-in" element={<Navigate to="/service/dine-in" replace />} />
          <Route path="takeaway" element={<Navigate to="/service/takeaway" replace />} />
          <Route path="tables" element={<Navigate to="/service/tables" replace />} />
          <Route path="captains" element={<Navigate to="/service/captains" replace />} />
          <Route path="floor-sections" element={<Navigate to="/service/floor-sections" replace />} />

          {/* Billing */}
          <Route path="billing" element={<Billing />} />
          <Route path="settlement" element={<Navigate to="/billing" replace />} />
          <Route path="billing-settlement/billing" element={<Navigate to="/billing" replace />} />
          <Route path="billing-settlement/settlement" element={<Navigate to="/billing" replace />} />

          {/* Employee Management */}
          <Route path="employee-management/roles" element={<EmployeeRole />} />
          <Route path="employee-management/create-role" element={<CreateEmployeeRole />} />
          <Route path="employee-management/edit-role/:id" element={<EditEmployeeRole />} />
          <Route path="employee-management/employees" element={<Employees />} />
          <Route path="employee-management/create-employee" element={<CreateEmployee />} />
          <Route path="employee-management/edit-employee/:id" element={<EditEmployee />} />

          {/* Food Management */}
          <Route path="food-management/foods" element={<Foods />} />
          <Route path="food-management/create-food" element={<CreateFood />} />
          <Route path="food-management/edit-food/:id" element={<EditFood />} />
          <Route path="food-management/categories" element={<Categories />} />
          <Route path="food-management/create-category" element={<CreateCategory />} />
          <Route path="food-management/edit-category/:id" element={<EditCategory />} />
          <Route path="food-management/sub-categories" element={<SubCategories />} />
          <Route path="food-management/create-sub-category" element={<CreateSubCategory />} />
          <Route path="food-management/edit-sub-category/:id" element={<EditSubCategory />} />
        </Route>

        {/* Catch-all — unauthenticated → login, authenticated → home */}
        <Route
          path="*"
          element={
            isAuthenticated && getStoredToken()
              ? <Navigate to="/" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
