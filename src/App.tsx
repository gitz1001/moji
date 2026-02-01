import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TestPage, TrainPage, HistoryPage, SettingsPage, PracticePage, ReaderPage, PaceRunner, RecoveryRush } from './pages'

function App() {
  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('moji_theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/test" replace />} />
        <Route path="test" element={<TestPage />} />
        <Route path="train" element={<TrainPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/library/:id" element={<ReaderPage />} />
        <Route path="practice/pace-runner" element={<PaceRunner />} />
        <Route path="practice/recovery-rush" element={<RecoveryRush />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/test" replace />} />
      </Route>
    </Routes>
  )
}

export default App
