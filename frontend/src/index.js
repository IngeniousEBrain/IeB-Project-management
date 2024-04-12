import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoginScreen from './Screens/LoginScreen';
import HomeScreen from './Screens/HomeScreen';
import RegisterScreen from './Screens/RegisterScreen';
import ResetPasswordScreen from './Screens/ResetPasswordScreen';
import SettingsScreen from './Screens/SettingsScreen';
import NotFoundScreen from './Screens/NotFoundScreen';
import { Provider } from 'react-redux';
import store from './store';
import PrivateRoute from './Components/PrivateRoute';
import SendEmailScreen from './Screens/SendEmailScreen';
import AdminRoute from './Components/AdminComponents/AdminRoute';
import AdminRegisterScreen from './Screens/Adminscreens/AdminRegisterScreen';
import AdminDashboardScreen from './Screens/Adminscreens/AdminDashboardScreen';
import AddProjectScreen from './Screens/AddProjectScreen';
import ClientRoute from './Components/ClientRoute';
import AssignProjectScreen from './Screens/Adminscreens/AssignProjectScreen';
import EmployeeRoute from './Components/EmployeeRoute';
import EmployeeHomeScreen from './Screens/EmployeeScreens/EmployeeHomeScreen';
import AllProjectsScreen from './Screens/Adminscreens/AllProjectsScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path="" element={<App />}>
      <Route path="/" element={<LoginScreen />} />
      <Route path="*" element={<NotFoundScreen />} />
      <Route path="/send-password-reset-mail" element={<SendEmailScreen />} />
      <Route path="/api/user/resetpassword/:id/:token" element={<ResetPasswordScreen />} />
      
      <Route path="" element={<PrivateRoute />}>
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="" element={<ClientRoute />}>
        <Route path="/client" element={<HomeScreen />} />
        <Route path="/create-project" element={<AddProjectScreen />} />
      </Route>
      <Route path="" element={<EmployeeRoute />}>
        <Route path="/employee" element={<EmployeeHomeScreen />} />
      </Route>
      <Route path="" element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="/admin/allprojects" element={<AllProjectsScreen />} />
        <Route path="/admin/assign" element={<AssignProjectScreen />} />
        <Route path="/admin/register" element={<AdminRegisterScreen />} />
        <Route path="/admin/client-register" element={<RegisterScreen />} />
      </Route>
    </Route> 
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
