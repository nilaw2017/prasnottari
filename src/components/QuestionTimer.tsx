"use client";
import { useState, useEffect } from "react";

const QuestionTimer = ({
  onTimeUp,
  setTimePerQuestion,
  isAnswered,
  resetTimer,
}: {
  onTimeUp: () => void;
  setTimePerQuestion: (time: number) => void;
  isAnswered: boolean;
  resetTimer: () => void;
}) => {
  const [seconds, setSeconds] = useState(10); // 10 seconds for each question

  useEffect(() => {
    if (!isAnswered && seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds((prev) => prev - 1);
        setTimePerQuestion(10 - seconds);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0 && !isAnswered) {
      onTimeUp();
    }
  }, [seconds, isAnswered, onTimeUp, setTimePerQuestion]);

  // Reset the timer when isAnswered changes to false (new question)
  useEffect(() => {
    setSeconds(10);
  }, [isAnswered]); // Changed from [resetTimer] to [isAnswered]

  return <div className="text-lg">Time Left: {seconds}s</div>;
};

export default QuestionTimer;
