import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import {
  About,
  Contact,
  NotFound,
  ServiceDetail,
  Services,
  Testimonials,
} from "@/pages/SitePages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
