import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Home } from "@/pages/Home";
import {
  About,
  Contact,
  NotFound,
  ServiceDetail,
  Services,
  Testimonials,
} from "@/pages/SitePages";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminLeadsPage } from "@/pages/admin/AdminLeadsPage";
import { AdminServicesPage } from "@/pages/admin/AdminServicesPage";
import { AdminServiceEditPage } from "@/pages/admin/AdminServiceEditPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { AdminMediaPage } from "@/pages/admin/AdminMediaPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="services/:id" element={<AdminServiceEditPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="eyelash-services" element={<Navigate to="/eyelash-extensions" replace />} />
          <Route
            path="eyelash-extensions"
            element={<ServiceDetail slug="eyelash-extensions" />}
          />
          <Route path="eyelash-lifts" element={<ServiceDetail slug="eyelash-lifts" />} />
          <Route path="eyelash-tinting" element={<ServiceDetail slug="eyelash-tinting" />} />
          <Route path="eyebrow-tinting" element={<ServiceDetail slug="eyebrow-tinting" />} />
          <Route path="waxing" element={<ServiceDetail slug="waxing" />} />
          <Route path="facial" element={<ServiceDetail slug="facial" />} />
          <Route path="about" element={<About />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="client-testimonials" element={<Navigate to="/testimonials" replace />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
