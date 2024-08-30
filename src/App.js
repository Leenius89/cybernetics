import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Header from './components/Header';
import StartPage from './components/StartPage';
import PsycheTest from './components/PsycheTest';
import ResultPage from './components/ResultPage';
import ThreeDModel from './components/ThreeDModel';
import { calculateResults, extractParts } from './utils/scoringAlgorithm';
import questions from './utils/questions';

const App = () => {
  const [stage, setStage] = useState('start');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [testResults, setTestResults] = useState({
    perception: 0,
    intelligence: 0,
    emotion: 0,
    physical: 0,
    hidden: 0
  });
  const [parts, setParts] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const results = calculateResults(answers);
    setTestResults(results);
    setParts(extractParts(results));
  }, [answers]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStart = (name) => {
    setUserName(name);
    setStage('test');
  };

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleTestComplete = () => {
    if (answers.every(answer => answer !== null)) {
      setStage('result');
    } else {
      alert('모든 질문에 답변해주세요.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleDevMode = () => {
    if (!isDevMode) {
      // Generate random 3-letter name
      const randomName = Math.random().toString(36).substring(2, 5).toUpperCase();
      setUserName(randomName);

      // Generate random answers
      const randomAnswers = Array(questions.length).fill(null).map(() => Math.floor(Math.random() * 5) + 1);
      setAnswers(randomAnswers);

      // Calculate results and move to result page
      const results = calculateResults(randomAnswers);
      setTestResults(results);
      setParts(extractParts(results));
      setStage('result');
    }
    setIsDevMode(!isDevMode);
  };

return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} toggleDevMode={toggleDevMode} />
      <main className="container mx-auto p-4">
        {stage === 'start' && (
          <StartPage onStart={handleStart} />
        )}
        {stage === 'test' && (
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <PsycheTest 
                questions={questions} 
                onAnswerChange={handleAnswerChange}
                onComplete={handleTestComplete}
              />
            </div>
            <div className="md:w-1/2 h-[600px] md:h-auto">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <ThreeDModel testResults={testResults} />
                <OrbitControls />
              </Canvas>
            </div>
          </div>
        )}
        {stage === 'result' && (
          <ResultPage 
            testResults={testResults} 
            parts={parts}
            userName={userName}
            onRestart={() => setStage('start')}
          />
        )}
      </main>
    </div>
  );
};

export default App;