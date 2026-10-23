import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Components
import Restaurant from './components/Restaurant';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Panel Main Routes */}
        <Route path="/" element={<Layout onLogout={() => setIsAuthenticated(false)} />}>
          <Route index element={<Dashboard />} />
          <Route path="restaurant" element={<Restaurant />} />
          <Route path="profile" element={<Profile />} />
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

          {/* Reviews */}
          <Route path="reviews" element={<Reviews />} />
          <Route path="review" element={<Navigate to="/reviews" replace />} />

          {/* Orders */}
          <Route path="orders" element={<Orders />} />

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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
