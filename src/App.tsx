import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TestPage, TrainPage, HistoryPage, SettingsPage } from './pages'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/test" replace />} />
        <Route path="test" element={<TestPage />} />
        <Route path="train" element={<TrainPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/test" replace />} />
      </Route>
    </Routes>
  )
}

export default App
