import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ControlPage } from './routes/ControlPage'
import { OutputPage } from './routes/OutputPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ControlPage />} />
        <Route path="/output" element={<OutputPage />} />
      </Routes>
    </BrowserRouter>
  )
}
