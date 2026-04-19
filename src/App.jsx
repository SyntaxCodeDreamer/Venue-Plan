import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminConsole from './pages/AdminConsole';
import FanApp from './pages/FanApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<AdminConsole />} />
        <Route path="/fan" element={<FanApp />} />
      </Routes>
    </BrowserRouter>
  );
}
