import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PDFTutor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const [data, setData] = useState(null); // Summary data from backend
  const [activeTab, setActiveTab] = useState("summary"); // summary, chat, quiz
  
  // Q&A States
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [asking, setAsking] = useState(false);

  // Quiz States
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setUploadStatus(null);
    setData(null);
    setChatLog([]);
    setQuiz([]);
    setSelectedAnswers({});
    setShowQuizResults(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/pdf/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Could not parse or process note PDF.");
      const resJson = await res.json();
      setData(resJson);
      setUploadStatus('success');
    } catch (err) {
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const userQ = question;
    setChatLog(prev => [...prev, { sender: 'user', text: userQ }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/pdf/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ })
      });
      const resJson = await res.json();
      setChatLog(prev => [...prev, { sender: 'bot', text: resJson.answer }]);
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'bot', text: "Error fetching response from RAG module." }]);
    } finally {
      setAsking(false);
    }
  };

  const handleFetchQuiz = async () => {
    setLoadingQuiz(true);
    setShowQuizResults(false);
    setSelectedAnswers({});
    try {
      const res = await fetch('http://127.0.0.1:8000/api/pdf/quiz');
      const resJson = await res.json();
      setQuiz(resJson.quiz || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionChange = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const getScore = () => {
    let score = 0;
    quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_option) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">PDF AI Tutor</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Upload notes, lecture slides, or syllabi. Get summary notes, ask questions, or practice quizzes.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="file"
            accept=".pdf"
            required
            onChange={handleFileChange}
            id="pdf-upload-input"
            className="hidden"
          />
          <label 
            htmlFor="pdf-upload-input" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 w-full"
          >
            <Upload size={16} className="text-slate-400" />
            <span className="truncate">{file ? file.name : "Select Study Notes PDF File"}</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Parsing notes...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Process Study Material</span>
            </>
          )}
        </button>
      </form>

      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200/30">
          <AlertCircle size={16} />
          <span>Error parsing notes. Make sure backend is running and valid file uploaded.</span>
        </div>
      )}

      {/* RAG content output */}
      {data && (
        <div className="space-y-6">
          
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-850 gap-6">
            {['summary', 'chat', 'quiz'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'quiz' && quiz.length === 0) handleFetchQuiz();
                }}
                className={`
                  pb-3.5 text-xs font-bold uppercase tracking-wider relative transition-colors
                  ${activeTab === tab 
                    ? 'text-sky-500 border-b-2 border-sky-500' 
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }
                `}
              >
                {tab === 'summary' ? 'Summary & Notes' : tab === 'chat' ? 'Ask AI Tutor' : 'Practice Quiz'}
              </button>
            ))}
          </div>

          {/* Active Tab contents */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              
              {/* Abstract */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest block">Executive Summary</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  {data.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Points */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Important Core Concepts</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {data.key_points?.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed list-disc ml-4 font-semibold">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Revision Notes */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span>Quick Revision Tips</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {data.revision_notes?.map((note, i) => (
                      <li key={i} className="text-xs text-slate-655 dark:text-slate-455 leading-relaxed list-decimal ml-4 font-semibold">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {activeTab === "chat" && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-6">
              
              {/* Question Log */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {chatLog.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-10 font-bold">Ask anything about the uploaded notes text...</p>
                ) : (
                  chatLog.map((log, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-3 text-xs max-w-[85%] ${log.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`
                        px-3.5 py-2.5 rounded-xl
                        ${log.sender === 'user' 
                          ? 'bg-sky-500 text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }
                      `}>
                        {log.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Explain the main components of a CPU"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || asking}
                  className="p-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white disabled:opacity-50"
                >
                  {asking ? <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={14} />}
                </button>
              </form>

            </div>
          )}

          {activeTab === "quiz" && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Practice MCQ Exam</h3>
                <button 
                  onClick={handleFetchQuiz}
                  disabled={loadingQuiz}
                  className="text-[10px] font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1.5 rounded-lg border border-sky-100/10"
                >
                  Regenerate Quiz
                </button>
              </div>

              {loadingQuiz ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-6 w-6 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-bold">Creating conceptual quiz questions from text...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.map((q, qIdx) => (
                    <div key={q.id} className="space-y-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{qIdx + 1}. {q.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt.option_id;
                          const showCorrect = showQuizResults && opt.option_id === q.correct_option;
                          const showIncorrect = showQuizResults && isSelected && selectedAnswers[q.id] !== q.correct_option;
                          
                          return (
                            <button
                              key={opt.option_id}
                              type="button"
                              onClick={() => !showQuizResults && handleOptionChange(q.id, opt.option_id)}
                              className={`
                                flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all text-xs font-semibold
                                ${showCorrect 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                  : showIncorrect 
                                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                  : isSelected
                                  ? 'bg-sky-50 text-sky-600 border-sky-300 dark:bg-sky-950/20 dark:text-sky-405 dark:border-sky-900/30'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 dark:border-slate-850 text-slate-700 dark:text-slate-350'
                                }
                              `}
                            >
                              <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0 border border-slate-250/20 dark:border-slate-800 font-extrabold">{opt.option_id}</span>
                              <span className="leading-tight">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResults && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850">
                          <span className="font-bold text-slate-750 dark:text-slate-300 block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Submission and score */}
                  {quiz.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {showQuizResults ? (
                        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-150">
                          You scored: <span className="text-sky-500">{getScore()} / {quiz.length}</span>
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">Please select options for all questions.</span>
                      )}

                      <button
                        onClick={() => setShowQuizResults(!showQuizResults)}
                        disabled={Object.keys(selectedAnswers).length < quiz.length}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                      >
                        {showQuizResults ? 'Re-verify Answers' : 'Submit Quiz'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
