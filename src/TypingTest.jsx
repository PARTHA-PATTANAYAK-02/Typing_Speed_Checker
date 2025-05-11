import React, { useState, useEffect, useRef } from "react";

export default function TypingTest() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [isInputActive, setIsInputActive] = useState(false);
  const [bestWpm, setBestWpm] = useState(localStorage.getItem("bestWpm") || 0);
  const [duration, setDuration] = useState(0); // Time duration
  const timer = useRef(null);

  // Handle the sentence based on selected duration
  useEffect(() => {
    const loadText = async () => {
      const res = await import("./sentences.json");
      const data = res.default;
      if (duration === 0) {
        setText("Welcome to Typing Speed checker. Please select the time.");
      } else if (duration === 15) {
        setText(data.short[Math.floor(Math.random() * data.short.length)]);
      } else if (duration === 30) {
        setText(data.medium[Math.floor(Math.random() * data.medium.length)]);
      } else {
        setText(data.long[Math.floor(Math.random() * data.long.length)]);
      }
    };

    loadText();
  }, [duration]);

  // Timer logic
  useEffect(() => {
    if (started && timeLeft > 0) {
      timer.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setStarted(false);
      if (wpm > bestWpm) {
        localStorage.setItem("bestWpm", wpm);
        setBestWpm(wpm);
      }
    }
    return () => clearTimeout(timer.current);
  }, [started, timeLeft]);

  // Update WPM and Accuracy
  useEffect(() => {
    if (!started || input.length === 0) return;

    const words = input.trim().split(/\s+/).length;
    const mins = (duration - timeLeft) / 60;
    setWpm(Math.round(words / mins));

    const correct = input.split("").filter((ch, i) => ch === text[i]).length;

    setAccuracy(Math.round((correct / input.length) * 100));
  }, [input]);

  const handleInput = (e) => {
    if (!started) setStarted(true);
    setInput(e.target.value);
  };

  const restart = () => {
    setInput("");
    setTimeLeft(duration);
    setStarted(false);
    setWpm(0);
    setAccuracy(100);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // Select duration
  const selectDuration = (d) => {
    setDuration(d);
    setInput("");
    setTimeLeft(d);
    setStarted(false);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen p-6`}
    >
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span
          className={`float-left px-2 py-2 rounded text-white ${
            isInputActive ? "bg-green-600" : "bg-red-600"
          } `}
        >
          Input {isInputActive ? "Active" : "Inactive"}
        </span>
        <button
          onClick={toggleTheme}
          className="float-right px-4 py-2 rounded bg-indigo-500 text-white cursor-pointer"
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

        <h1 className="text-3xl flex justify-center font-bold">
          Typing Speed Checker
        </h1>

        <div className="flex justify-center gap-4 mb-4">
          {[15, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => selectDuration(d)}
              className={`px-4 py-2 rounded cursor-pointer  ${
                duration === d
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>

        <div
          className={`border rounded p-4 font-mono text-lg text-left ${
            darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
          }`}
        >
          {text.split("").map((char, i) => {
            let className = "";
            if (i < input.length) {
              className = char === input[i] ? "text-green-500" : "text-red-500";
            }
            return (
              <span key={i} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          className={`w-full p-3 border rounded mt-3 resize-none focus:outline-none ${
            darkMode
              ? "bg-gray-900 text-white placeholder-gray-400 "
              : "bg-white text-black placeholder-gray-600 "
          }
          ${isInputActive ? "border-green-700" : "border-red-700"}`}
          rows="5"
          value={input}
          onChange={handleInput}
          disabled={timeLeft === 0 || duration === 0}
          placeholder="Start typing here..."
          onFocus={() => setIsInputActive(true)}
          onBlur={() => setIsInputActive(false)}
        />

        <div className="flex justify-around items-center mt-4 text-lg">
          <p>⏳ Time: {timeLeft}s</p>
          <p>📈 WPM: {wpm}</p>
          <p>🎯 Accuracy: {isNaN(accuracy) ? 0 : accuracy}%</p>
        </div>

        <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 mt-4 rounded-full overflow-hidden">
          <div
            style={{
              width: `${((duration - timeLeft) / duration) * 100}%`,
              transition: "all 1s linear",
            }}
            className={`h-full bg-blue-500 rounded-full ${
              ((duration - timeLeft) / duration) * 100 > 80
                ? "bg-orange-500"
                : "bg-blue-500"
            }`}
          />
        </div>

        <button
          onClick={restart}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
        >
          🔁 Restart
        </button>

        <p className="font-semibold mt-6">🏅 Best WPM (Saved): {bestWpm}</p>
      </div>
    </div>
  );
}
