import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logistics from './pages/Logistics';
import OrderDetail from './pages/OrderDetail';
import StampPaper from './pages/StampPaper';
import StampPaperDetail from './pages/StampPaperDetail';
import CorporateGifting from './pages/CorporateGifting';
import Events from './pages/Events';
import ITSolutions from './pages/ITSolutions';
import RateCalculator from './pages/RateCalculator';
import Reports from './pages/Reports';
import ClientDashboard from './pages/ClientDashboard';
import ClientLogistics from './pages/ClientLogistics';
import BookShipment from './pages/BookShipment';
import BulkUpload from './pages/BulkUpload';
import BulkUploadInstructions from './pages/BulkUploadInstructions';
import GiftingDetail from './pages/GiftingDetail';
import EventsDetail from './pages/EventsDetail';
import ITSolutionsDetail from './pages/ITSolutionsDetail';
import ForgotPassword from './pages/ForgotPassword';
import CorporateGiftingForm from './pages/CorporateGiftingForm';
import EventManagementForm from './pages/EventManagementForm';
import StampPaperForm from './pages/StampPaperForm';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/logistics/:id/*" element={<OrderDetail />} />
        <Route path="/stamp-paper" element={<StampPaper />} />
        <Route path="/stamp-paper/:id" element={<StampPaperDetail />} />
        <Route path="/gifting" element={<CorporateGifting />} />
        <Route path="/events" element={<Events />} />
        <Route path="/it-solutions" element={<ITSolutions />} />
        <Route path="/rate-calculator" element={<RateCalculator />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client/logistics" element={<ClientLogistics />} />
        <Route path="/client/logistics/book" element={<BookShipment />} />
        <Route path="/client/bulk-upload" element={<BulkUpload />} />
        <Route path="/client/bulk-upload-instructions" element={<BulkUploadInstructions />} />
        <Route path="/gifting/:id" element={<GiftingDetail />} />
        <Route path="/events/:id" element={<EventsDetail />} />
        <Route path="/it-solutions/detail" element={<ITSolutionsDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gifting/new" element={<CorporateGiftingForm />} />
        <Route path="/events/new" element={<EventManagementForm />} />
        <Route path="/stamp-paper/new" element={<StampPaperForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;