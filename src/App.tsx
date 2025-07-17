import { useEffect, useState } from "react";

export default function App() {
  type Mode = 'work' | 'break' | 'long';

  const [mode, setMode] = useState<Mode>('work');

  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);

  const [secondsLeft, setSecondsLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  //const [cycleCount, setCycleCount] = useState(0); // Optional for later

  const alertSound = new Audio("/pomo/alert.mp3");
  const [muted, setMuted] = useState(false);

  // mode set
  useEffect(() => {
    setIsRunning(false);
    if (mode === 'work') setSecondsLeft(workDuration);
    else if (mode === 'break') setSecondsLeft(breakDuration);
    else if (mode === 'long') setSecondsLeft(longBreakDuration);
  }, [mode, workDuration, breakDuration, longBreakDuration]);

  // main timer logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const nextMode = mode === 'work' ? 'break' : 'work';
          const nextPhase =
            nextMode === 'work' ? workDuration : breakDuration;

          if (!muted) {
            let count = 0;
            const playRepeated = () => {
              alertSound.currentTime = 0;
              alertSound.play().catch((e) => console.warn("Sound failed:", e));
              count++;
              if (count < 3) {
                setTimeout(playRepeated, 4000); // 4 second gap
              }
            };
            playRepeated();
          }

          setMode(nextMode); // this will also reset the timer via your mode effect
          setIsRunning(false);
          return nextPhase;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (s: number): string =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-base-200 text-base-content">
      <h1 className="text-5xl font-bold mb-6">Pluto Pomo</h1>
      <div className="text-7xl font-mono mb-6">{formatTime(secondsLeft)}</div>
      <div className="join mb-6">
        
        <button
          className={`btn join-item ${mode === 'work' ? 'btn-active btn-primary' : ''}`}
          onClick={() => setMode('work')}
        >
          Work
        </button>
        <button
          className={`btn join-item ${mode === 'break' ? 'btn-active btn-accent' : ''}`}
          onClick={() => setMode('break')}
        >
          Break
        </button>
        <button
          className={`btn join-item ${mode === 'long' ? 'btn-active btn-secondary' : ''}`}
          onClick={() => setMode('long')}
        >
          Long Break
        </button>
      </div>

      <div className="flex gap-4">
        <button
          className="btn btn-success"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(mode === 'break' ? breakDuration : workDuration);
          }}
        >
          Reset
        </button>
      </div>
      
      <p className="mt-4 text-lg">
        {mode === 'work' ? "Work Time 🚀" : mode === 'break' ? "Break Time 🌿" : "Long Break 💤"}
      </p>


      {/* Settings Button and Modal Trigger */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="btn btn-sm btn-outline" onClick={() => {
          const el = document.getElementById('settings_modal') as HTMLDialogElement;
          el?.showModal();
        }}>
          ⚙️ Settings
        </button>

        <button
          className={`btn btn-sm ${muted ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => setMuted(!muted)}
        >
          {muted ? '🔇 Mute' : '🔊 Sound'}
        </button>
      </div>

      <dialog id="settings_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Settings</h3>

          {/* Modal Inputs */}
          <div className="form-control mt-4">
            <label className="label">Work Duration (minutes)</label>
            <input
              type="number"
              min={1}
              defaultValue={workDuration / 60}
              className="input input-bordered"
              onChange={(e) => setWorkDuration(Number(e.target.value) * 60)}
            />
          </div>

          <div className="form-control mt-2">
            <label className="label">Break Duration (minutes)</label>
            <input
              type="number"
              min={1}
              defaultValue={breakDuration / 60}
              className="input input-bordered"
              onChange={(e) => setBreakDuration(Number(e.target.value) * 60)}
            />
          </div>

          <div className="form-control mt-2">
            <label className="label">Long Break Duration (minutes)</label>
            <input
              type="number"
              min={1}
              defaultValue={longBreakDuration / 60}
              className="input input-bordered"
              onChange={(e) => setLongBreakDuration(Number(e.target.value) * 60)}
            />
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

    </div>
    
  );
}