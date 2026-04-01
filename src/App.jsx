import { useState, useEffect } from 'react';
import './App.css';

const MESSAGES = [
  { threshold: 0, text: "Let's waste some time! You have endless potential... to procrastinate." },
  { threshold: 10, text: "Ah, the sweet embrace of doing absolutely nothing." },
  { threshold: 25, text: "Are you sure you shouldn't be working right now?" },
  { threshold: 50, text: "Halfway through! Your future self is already crying." },
  { threshold: 75, text: "The deadline is approaching. The panic is setting in." },
  { threshold: 90, text: "WARNING: High levels of guilt detected. Productivity critically low!" },
  { threshold: 100, text: "Time's up! You successfully accomplished nothing. Congratulations?" }
];

function App() {
  const [plannedTimeParams, setPlannedTimeParams] = useState({ value: 10, unit: 'minutes' });
  const [plannedTimeSecs, setPlannedTimeSecs] = useState(600);
  const [timePassed, setTimePassed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Derived state
  const isFinished = timePassed >= plannedTimeSecs && timePassed > 0;
  
  // Calculate Motivation
  // Motivation goes from 100 to 0 (fluctuates slightly but generally goes down)
  const progressPercent = plannedTimeSecs > 0 ? (timePassed / plannedTimeSecs) * 100 : 0;
  const baseMotivation = Math.max(0, 100 - progressPercent);
  const fluctuation = isRunning && !isFinished ? Math.sin(timePassed) * 5 : 0;
  const motivation = Math.min(100, Math.max(0, baseMotivation + fluctuation));

  // Calculate Guilt (exponential-ish feeling)
  const guilt = Math.min(100, Math.pow(progressPercent / 100, 1.5) * 100);

  // Calculate Productivity Loss (abstract currency)
  const productivityLoss = (timePassed * 1.5).toFixed(2);
  
  // Find current message
  const currentMessage = [...MESSAGES].reverse().find(m => progressPercent >= m.threshold) || MESSAGES[0];

  useEffect(() => {
    let interval = null;
    if (isRunning && !isFinished) {
      interval = setInterval(() => {
        setTimePassed(prev => {
          if (prev + 1 >= plannedTimeSecs) {
            setIsRunning(false);
            return plannedTimeSecs;
          }
          return prev + 1;
        });
      }, 1000); // For dramatic effect, we use real seconds. Although we could speed it up by dividing by a factor.
    } else if (!isRunning && timePassed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timePassed, plannedTimeSecs, isFinished]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  const handleStart = () => {
    if (timePassed === 0) {
      const secs = plannedTimeParams.unit === 'minutes' ? plannedTimeParams.value * 60 : plannedTimeParams.value;
      setPlannedTimeSecs(secs);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimePassed(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <h1>Procrastination Simulator</h1>
        <button 
          className="theme-toggle" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="main-content">
        <section className="setup-section glass-panel">
          <h2>Setup your session</h2>
          <div className="input-group">
            <label>I plan to waste:</label>
            <input 
              type="number" 
              min="1" 
              value={plannedTimeParams.value}
              onChange={(e) => setPlannedTimeParams({...plannedTimeParams, value: parseInt(e.target.value) || 1})}
              disabled={timePassed > 0 || isRunning}
            />
            <select 
              value={plannedTimeParams.unit} 
              onChange={(e) => setPlannedTimeParams({...plannedTimeParams, unit: e.target.value})}
              disabled={timePassed > 0 || isRunning}
            >
              <option value="seconds">Seconds (Demo)</option>
              <option value="minutes">Minutes</option>
            </select>
          </div>
          
          <div className="controls">
            {timePassed === 0 ? (
              <button className="btn primary" onClick={handleStart}>Start Wasting Time</button>
            ) : (
              <>
                <button className="btn primary" onClick={handlePause} disabled={isFinished}>
                  {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
                </button>
                <button className="btn secondary" onClick={handleReset}>Reset Life Choices</button>
              </>
            )}
          </div>
        </section>

        {(timePassed > 0 || isFinished) && (
          <section className="dashboard glass-panel">
            <div className="time-display">
              <div className="donut-wrapper">
                <h3>Time Wasted</h3>
                <div className="time-huge">{formatTime(timePassed)}</div>
                <div className="time-total">/ {formatTime(plannedTimeSecs)}</div>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card motivation">
                <div className="metric-header">Motivation</div>
                <div className="metric-value">{motivation.toFixed(1)}%</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${motivation}%`, backgroundColor: 'var(--success-color)'}}></div>
                </div>
              </div>

              <div className="metric-card guilt">
                <div className="metric-header">Guilt Accumulation</div>
                <div className="metric-value">{guilt.toFixed(1)}%</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${guilt}%`, backgroundColor: 'var(--danger-color)'}}></div>
                </div>
              </div>

              <div className="metric-card productivity">
                <div className="metric-header">Productivity Lost</div>
                <div className="metric-value currency">-${productivityLoss}</div>
                <div className="trend-down">📉 Stonks going down</div>
              </div>
            </div>

            <div className={`message-box ${progressPercent > 75 ? 'critical' : ''}`}>
              <div className="message-icon">⚠️</div>
              <div className="message-text">"{currentMessage.text}"</div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
