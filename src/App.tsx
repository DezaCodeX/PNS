import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";

const Chatbot = lazy(() =>
  import("@/components/chatbot").then((module) => ({ default: module.Chatbot })),
);
const Home = lazy(() => import("./home/Home").then((module) => ({ default: module.Home })));
const AboutUs = lazy(() =>
  import("./pages/AboutUs").then((module) => ({ default: module.AboutUs })),
);
const AdminLogin = lazy(() =>
  import("./admin/auth/pages/AdminLogin").then((module) => ({ default: module.AdminLogin })),
);
const CreateAdminAccount = lazy(() =>
  import("./admin/auth/pages/CreateAdminAccount").then((module) => ({
    default: module.CreateAdminAccount,
  })),
);
const ForgotPassword = lazy(() =>
  import("./admin/auth/pages/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  })),
);
const AdminPanel = lazy(() =>
  import("./pages/AdminPanel").then((module) => ({ default: module.AdminPanel })),
);
const Rooms = lazy(() => import("./pages/Rooms").then((module) => ({ default: module.Rooms })));
const Dining = lazy(() => import("./pages/Dining").then((module) => ({ default: module.Dining })));
const Gallery = lazy(() =>
  import("./pages/Gallery").then((module) => ({ default: module.Gallery })),
);
const Legal = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Legal })));

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className="luxury-button luxury-button-hover mt-6 inline-flex px-4 py-2">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/create-account" element={<CreateAdminAccount />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy-policy" element={<Legal path="/privacy-policy" />} />
          <Route path="/terms-and-conditions" element={<Legal path="/terms-and-conditions" />} />
          <Route
            path="/refund-cancellation-policy"
            element={<Legal path="/refund-cancellation-policy" />}
          />
          <Route path="/contact" element={<Home contactOpen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
    </>
  );
}
