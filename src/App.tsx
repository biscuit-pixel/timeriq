import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ControlPage } from './routes/ControlPage'
import { OutputPage } from './routes/OutputPage'
import { DebateControlPage } from './routes/DebateControlPage'
import { DebateOutputPage } from './routes/DebateOutputPage'
import { DebateLowerThirdPage } from './routes/DebateLowerThirdPage'
import { DebateOverviewPage } from './routes/DebateOverviewPage'
import { JoinPage } from './routes/JoinPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ControlPage />} />
        <Route path="/output" element={<OutputPage />} />
        <Route path="/debate" element={<DebateControlPage />} />
        <Route path="/debate/output" element={<DebateOutputPage />} />
        <Route path="/debate/lower-third" element={<DebateLowerThirdPage />} />
        <Route path="/debate/overview" element={<DebateOverviewPage />} />
        <Route path="/join" element={<JoinPage />} />
      </Routes>
    </BrowserRouter>
  )
}
