"use client";

import { useEffect, useState, useCallback } from "react";
import { usePoints } from "@/context/PointsContext";
import QuestionTimer from "@/components/QuestionTimer";
import Results from "@/components/Result";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Subject {
  name: string;
  questions: Question[];
}

const Quiz = ({ params }: { params: { subject: string } }) => {
  const { subject } = params;
  const { points, setPoints } = usePoints();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [unattemptedQuestions, setUnattemptedQuestions] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/data/questions.json"); // Moved to public folder
        const data: { subjects: Subject[] } = await response.json();
        const subjectData = data.subjects.find(
          (s) => s.name.toLowerCase() === subject,
        );
        // Initialize all result states here to prevent stale data
        if (subjectData) {
          setQuestions(subjectData.questions);
          setUnattemptedQuestions(subjectData.questions.length);
          setCorrectAnswers(0);
          setWrongAnswers(0);
          setPoints(0);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };
    fetchQuestions();
  }, [subject]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    // Use functional update for time calculation
    setTotalTimeSpent((prev) => prev + timePerQuestion);

    if (option === questions[currentQuestionIndex].answer) {
      setPoints((prev) => prev + 4);
      setCorrectAnswers((prev) => prev + 1);
      setUnattemptedQuestions((prev) => prev - 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
      setUnattemptedQuestions((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimePerQuestion(0); // Reset the time for the next question
    } else {
      setShowResults(true);
    }
  };

  const handleTimeUp = useCallback(() => {
    setIsAnswered(true); // Consider the question unattempted if time runs out
    setUnattemptedQuestions(unattemptedQuestions + 1); // Increment the unattempted questions count
    setTotalTimeSpent(totalTimeSpent + 10);
    handleNext(); // Automatically go to the next question
  }, [unattemptedQuestions, totalTimeSpent, handleNext]);

  const handleSetTime = useCallback((time: number) => {
    setTimePerQuestion(time);
  }, []);

  // Add loading state
  if (questions.length === 0) {
    return <div className="p-6 text-center">Loading questions...</div>;
  }

  // Calculate the percentage score
  const percentage = Math.round((correctAnswers / questions.length) * 100);
  const averageTimePerQuestion = (totalTimeSpent / questions.length).toFixed(2);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {!showResults ? (
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 relative">
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 transition-all duration-300"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>

          {/* Question Number */}
          <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>

          {/* Question Text */}
          <h3 className="text-xl font-bold text-center mb-6 p-4 bg-blue-500 text-white rounded-lg">
            {questions[currentQuestionIndex]?.question}
          </h3>

          {/* Timer */}
          <QuestionTimer
            onTimeUp={handleTimeUp}
            setTimePerQuestion={handleSetTime}
            isAnswered={isAnswered}
            resetTimer={() => {}}
          />

          {/* Options */}
          <div className="mt-6 space-y-4">
            {questions[currentQuestionIndex]?.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition duration-300 focus:outline-none ${
                  isAnswered &&
                  option === questions[currentQuestionIndex].answer
                    ? "bg-green-500 text-white"
                    : isAnswered && option === selectedOption
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 focus:bg-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="mt-8 w-full py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              {currentQuestionIndex === questions.length - 1
                ? "Submit"
                : "Next Question"}
            </button>
          )}
        </div>
      ) : (
        <Results
          score={points}
          totalQuestions={questions.length}
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
          unattemptedQuestions={unattemptedQuestions}
          percentage={percentage}
          timeSpent={totalTimeSpent}
          averageTimePerQuestion={Number(averageTimePerQuestion)}
        />
      )}
    </div>
  );
};

export default Quiz;
