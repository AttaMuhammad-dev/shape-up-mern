import React,{lazy,Suspense} from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

// 👇 YEH LINE UNCOMMENT/ADD KAREIN (ZAROORI HAI) 👇
import './index.css'; 
// 👆 Iske bina Dark Mode nahi chalega 👆

// Import Components
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// ... baaki saara code waisa hi rahega ...
import Home from "./pages/Home";
const Register=lazy(()=>import('./pages/Register.jsx'));
import Login from "./pages/Login";
const Profile=lazy(()=>import('./pages/Profile.jsx'));
const Workouts=lazy(()=>import('./pages/Workouts.jsx'));
const NutritionChecker=lazy(()=>import('./pages/NutritionChecker.jsx'));
const BMRCalculator=lazy(()=>import('./pages/BMRCalculator.jsx'));
const Features=lazy(()=>import('./pages/Features.jsx'));
const About=lazy(()=>import('./pages/About.jsx'));
import NotFound from "./pages/NotFound";
const Dashboard=lazy(()=>import('./pages/Dashboard.jsx'));
const NotificationsPage=lazy(()=>import('./pages/NotificationsPage.jsx')); 
const Privacy=lazy(()=>import('./pages/Privacy.jsx'));
const Settings=lazy(()=>import('./pages/Settings.jsx')); 

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* ... routes same rahenge ... */}
      <Route index={true} path="/" element={<Home />} />
      <Route path="/pages/features" element={<Features />} />
      <Route path="/pages/privacy" element={<Privacy/>} />
      <Route path="/pages/about" element={<About />} />
      <Route path="/pages/workouts" element={<Workouts />} />
      <Route path="/pages/nutrition-checker" element={<NutritionChecker />} />
      <Route path="/pages/bmr-calculator" element={<BMRCalculator />} />

      <Route path="" element={<PublicRoute />}>
        <Route path="/pages/login" element={<Login />} />
        <Route path="/pages/register" element={<Register />} />
      </Route>

      <Route path="" element={<PrivateRoute />}>
        <Route path="/pages/profile/*" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/pages/settings" element={<Settings />} /> 
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div role="status" className="p-5 text-center">Loading Shape Up…</div>}><RouterProvider router={router} /></Suspense>
    </Provider>
  </React.StrictMode>
);