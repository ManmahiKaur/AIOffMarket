
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import {
  Dashboard,
  OpportunityFeed,
  PropertyDetails,
  Properties,
  Events,
  Watchlists,
  Alerts,
  AIIntelligence,
  Settings
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="opportunities" element={<OpportunityFeed />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="events" element={<Events />} />
          <Route path="watchlists" element={<Watchlists />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ai-intelligence" element={<AIIntelligence />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
