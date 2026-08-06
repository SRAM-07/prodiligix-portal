import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logistics from './pages/Logistics';
import OrderDetail from './pages/OrderDetail';
import StampPaper from './pages/StampPaper';
import StampPaperDetail from './pages/StampPaperDetail';
import StampPaperForm from './pages/StampPaperForm';
import CorporateGifting from './pages/CorporateGifting';
import GiftingDetail from './pages/GiftingDetail';
import CorporateGiftingForm from './pages/CorporateGiftingForm';
import Events from './pages/Events';
import EventsDetail from './pages/EventsDetail';
import EventManagementForm from './pages/EventManagementForm';
import ITSolutions from './pages/ITSolutions';
import ITSolutionsDetail from './pages/ITSolutionsDetail';
import RateCalculator from './pages/RateCalculator';
import Reports from './pages/Reports';
import Companies from './pages/Companies';
import Addresses from './pages/Addresses';
import Wallet from './pages/Wallet';
import Users from './pages/Users';
import NewCompany from './pages/NewCompany';
import CompanyDetail from './pages/CompanyDetail';
import ClientDashboard from './pages/ClientDashboard';
import ClientLogistics from './pages/ClientLogistics';
import BookShipment from './pages/BookShipment';
import BulkUpload from './pages/BulkUpload';
import KnowledgeBase from './pages/KnowledgeBase';
import BulkUploadInstructions from './pages/BulkUploadInstructions';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import ITSolutionForm from './pages/ITSolutionForm';


const ADMIN_ROLES = ['super_admin', 'crm_user'];
const SUPER_ADMIN_ROLES = ['super_admin'];
const CLIENT_ROLES = ['company_admin', 'company_crm_user', 'company_user'];
const ALL_ROLES = [...ADMIN_ROLES, ...CLIENT_ROLES];

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin only routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/logistics" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <Logistics />
          </ProtectedRoute>
        } />
        <Route path="/logistics/:id/*" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <OrderDetail />
          </ProtectedRoute>
        } />
        <Route path="/rate-calculator" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <RateCalculator />
          </ProtectedRoute>
        } />
        <Route path="/client/rate-calculator" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <RateCalculator />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/companies" element={
          <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
            <Companies />
          </ProtectedRoute>
        } />
        <Route path="/companies/new" element={
          <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
            <NewCompany />
          </ProtectedRoute>
        } />
        <Route path="/addresses" element={
            <ProtectedRoute><Addresses /></ProtectedRoute>
        } />
        <Route path="/wallet" element={
            <ProtectedRoute><Wallet /></ProtectedRoute>
        } />
        <Route path="/users" element={
            <ProtectedRoute><Users /></ProtectedRoute>
        } />
        <Route path="/companies/:id" element={
          <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
            <CompanyDetail />
          </ProtectedRoute>
        } />
        <Route path="/stamp-paper" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <StampPaper />
          </ProtectedRoute>
        } />
        <Route path="/stamp-paper/new" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <StampPaperForm />
          </ProtectedRoute>
        } />
        <Route path="/stamp-paper/:id" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <StampPaperDetail />
          </ProtectedRoute>
        } />
        <Route path="/gifting" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <CorporateGifting />
          </ProtectedRoute>
        } />
        <Route path="/gifting/new" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <CorporateGiftingForm />
          </ProtectedRoute>
        } />
        <Route path="/gifting/:id" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <GiftingDetail />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <Events />
          </ProtectedRoute>
        } />
        <Route path="/events/new" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <EventManagementForm />
          </ProtectedRoute>
        } />
        <Route path="/events/:id" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <EventsDetail />
          </ProtectedRoute>
        } />
        <Route path="/it-solutions" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <ITSolutions />
          </ProtectedRoute>
        } />
        <Route path="/it-solutions/:id" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <ITSolutionsDetail />
          </ProtectedRoute>
        } />

        {/* Client routes */}
        <Route path="/client-dashboard" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/logistics" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <ClientLogistics />
          </ProtectedRoute>
        } />
        <Route path="/client/logistics/book" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <BookShipment />
          </ProtectedRoute>
        } />
        <Route path="/client/logistics/:id" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <OrderDetail />
          </ProtectedRoute>
        } />
        <Route path="/client/bulk-upload" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <BulkUpload />
          </ProtectedRoute>
        } />
        <Route path="/client/knowledge-base" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <KnowledgeBase />
          </ProtectedRoute>
        } />
        <Route path="/client/bulk-upload-instructions" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <BulkUploadInstructions />
          </ProtectedRoute>
        } />
        <Route path="/client/reports" element={
          <ProtectedRoute allowedRoles={CLIENT_ROLES}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/it-solutions/new" element={
  <ProtectedRoute allowedRoles={ALL_ROLES}>
    <ITSolutionForm />
  </ProtectedRoute>
} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;