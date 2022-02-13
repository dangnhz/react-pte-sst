import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./App.scss";

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeQuestion = questions[activeIndex];
  const [note, setNote] = useState("");
  const [checkedKeywords, setCheckedKeywords] = useState("");
  const [showKeywords, setShowKeywords] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charsCount, setCharsCount] = useState(0);
  const [userId, setUserId] = useState(1299);
  const [countDown, setCountDown] = useState(undefined);
  const [isInteractWithDOM, setIsInteractWithDOM] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_JSON)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    let index = localStorage.getItem("active_question_index");

    if (index) {
      setActiveIndex(parseInt(index));
    }
  }, []);

  const checkKeywords = () => {
    setIsSubmitting(true);
    const questionKeywords = questions[activeIndex].keywords.split(" ");
    const inputKeywords = note
      .split(" ")
      .map((word) => word.replace(/[^\w\s]/gi, "").toLowerCase());

    let matchingKeywords = [];

    for (let word of questionKeywords) {
      let matched = inputKeywords.includes(word);

      if (matched) {
        word = `<span class="matched-keyword green">${word}</span>`;
      } else {
        word = `<span class="unmatched-keyword red">${word}</span>`;
      }
      matchingKeywords.push(word);
    }
    setCheckedKeywords(matchingKeywords.join(" "));
    setShowKeywords(true);

    let payload = new FormData();
    payload.append("question_id", activeQuestion.id);
    payload.append("question_cat", 17);
    payload.append("word_count", wordCount);
    payload.append("user_string", note);
    payload.append("user_id", userId);

    axios
      .post(
        "https://api.masterpte.com.au/api/webservices/practice_result_listening",
        payload
      )
      .then((res) => {
        setResults(res.data.result);
        setIsSubmitting(false);
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.log(err);
      });
  };

  useEffect(() => {
    setResults(null);
    setNote("");
    setCheckedKeywords("");
    setShowKeywords(false);
    localStorage.setItem("active_question_index", activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    setTimeout(() => {
      const bodyEl = document.querySelector("body");
      const buttons = document.querySelectorAll("button");

      bodyEl.addEventListener("click", () => setIsInteractWithDOM(true));

      buttons.forEach((button) => {
        button.addEventListener("click", () => setIsInteractWithDOM(true));
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let myTimeout = useRef();

  let myInterval = useRef();

  useEffect(() => {
    if (isInteractWithDOM) {
      clearTimeout(myTimeout.current);
      clearInterval(myInterval.current);

      setCountDown(6);

      myInterval.current = setInterval(() => {
        setCountDown((prev) => prev - 1);
      }, 1000);

      try {
        myTimeout.current = setTimeout(() => {
          audioRef.current.audio.current.play();
          clearInterval(myInterval.current);
        }, 6000);
      } catch (error) {
        console.log(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleOnChange = (e) => {
    let text = e.target.value;
    let spaces = text.match(/\S+/g);
    let count = spaces ? spaces.length : 0;
    setWordCount(count);
    setCharsCount(text.length);
    setNote(text);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="sidebar">
          <h1 className="app-title">PTE Summarize Spoken Text</h1>
          {questions?.length > 0 && (
            <div id="pagination" className="pagination">
              <div className="pagination-top">
                <button
                  className="btn-prev"
                  disabled={activeIndex === 0}
                  onClick={() =>
                    activeIndex > 0 &&
                    setActiveIndex((prevIndex) => prevIndex - 1)
                  }
                >
                  Previous
                </button>
                <span className="active-question-number">
                  {activeIndex + 1}
                </span>
                <button
                  className="btn-next"
                  disabled={activeIndex === questions.length - 1}
                  onClick={() =>
                    activeIndex < questions.length &&
                    setActiveIndex((prevIndex) => prevIndex + 1)
                  }
                >
                  Next
                </button>
              </div>
              <div className="pagination-bottom">
                {questions.map((item, index) => (
                  <button
                    className={activeIndex === index ? "active" : ""}
                    key={index}
                    onClick={() => setActiveIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="main-content">
          {questions.length > 0 && (
            <div className="question">
              <div className="description">
                You will hear a short lecture. Write a summary for a fellow
                student who was not present at the lecture. You should write 50
                - 70 words. You have 10 minutes to finish this task. Your
                response will be judged on the quality of your writing and on
                how well your response presents the key points presented in the
                lecture.
              </div>
              <div className="audio-player">
                <ReactAudioPlayer
                  ref={audioRef}
                  autoPlay={false}
                  autoPlayAfterSrcChange={false}
                  volume
                  src={activeQuestion.audio}
                />
              </div>
              <div className={`count-down ${countDown === 0 ? "hidden" : ""}`}>
                The audio will play after <span style={{ color: "#F8176D", fontWeight: "bold" }}> {countDown ? countDown : "x"} </span> seconds
              </div>
              <textarea
                placeholder="Enter text..."
                className="text-note"
                value={note}
                onChange={handleOnChange}
              ></textarea>
              <br />
              <br />
              <div className="word-user-input">
                <div>
                  <span style={{ marginRight: "3rem" }}>
                    Words: <span style={{ color: "#F8176D", fontWeight: "bold" }}>{wordCount}</span>
                  </span>
                  <span>
                    Chars: <span style={{ color: "#F8176D", fontWeight: "bold" }}>{charsCount}</span>
                  </span>
                </div>
                <div className="user-id-input">
                  <label htmlFor="user-id">User ID: </label>
                  <input
                    id="user-id"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn-check-keywords"
                onClick={checkKeywords}
                disabled={note === ""}
              >
                {isSubmitting ? "Submitting" : "Submit"}
                {isSubmitting && <span className="spinner"></span>}
              </button>

              <div className="results">
                <div className="score">
                  Content: {isSubmitting && <div className="spinner-2"></div>}
                  {!isSubmitting && !results && "N/A"}
                  {results && (
                    <span
                      className="score-number"
                      style={{ color: "#F8176D", fontWeight: "bold" }}
                    >
                      {Number.parseFloat(results.context).toFixed(2)} / 2
                    </span>
                  )}
                </div>
                <div className="score">
                  Grammar: {isSubmitting && <div className="spinner-2"></div>}
                  {!isSubmitting && !results && "N/A"}
                  {results && (
                    <span
                      className="score-number"
                      style={{ color: "#F8176D", fontWeight: "bold" }}
                    >
                      {Number.parseFloat(results.grammar).toFixed(2)} / 2
                    </span>
                  )}
                </div>
                <div className="score">
                  Spelling: {isSubmitting && <div className="spinner-2"></div>}
                  {!isSubmitting && !results && "N/A"}
                  {results && (
                    <span
                      className="score-number"
                      style={{ color: "#F8176D", fontWeight: "bold" }}
                    >
                      {Number.parseFloat(results.spelling).toFixed(2)} / 2
                    </span>
                  )}
                </div>
                <div className="score">
                  Form: {isSubmitting && <div className="spinner-2"></div>}
                  {!isSubmitting && !results && "N/A"}
                  {results && (
                    <span
                      className="score-number"
                      style={{ color: "#F8176D", fontWeight: "bold" }}
                    >
                      {Number.parseFloat(results.form).toFixed(2)} / 2
                    </span>
                  )}
                </div>
                <div className="score">
                  Marks: {isSubmitting && <div className="spinner-2"></div>}
                  {!isSubmitting && !results && "N/A"}
                  {results && (
                    <span
                      className="score-number"
                      style={{ color: "#F8176D", fontWeight: "bold" }}
                    >
                      {Number.parseFloat(results.marks).toFixed(2)} / 90
                    </span>
                  )}
                </div>
              </div>

              {showKeywords && (
                <div className="question-box">
                  <div
                    className={`question-transcripts ${
                      showKeywords ? "keywords-showed" : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: activeQuestion.description,
                    }}
                  ></div>
                  <div className="question-keywords">
                    <b>Keywords:</b>
                    <div
                      className="keywords-list"
                      dangerouslySetInnerHTML={{ __html: checkedKeywords }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
