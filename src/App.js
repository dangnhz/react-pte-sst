import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './App.scss';

const App = () => {
	const [questions, setQuestions] = useState([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const activeQuestion = questions[activeIndex];
	const [note, setNote] = useState('');
	const [checkedKeywords, setCheckedKeywords] = useState('');
	const [showKeywords, setShowKeywords] = useState(false);

	useEffect(() => {
		axios
			.get('/data/sst-data.json')
			.then((res) => setQuestions(res.data))
			.catch((err) => console.log(err));
	}, []);

	useEffect(() => {
		let index = localStorage.getItem('active_question_index');

		if (index) {
			setActiveIndex(parseInt(index));
		}
	}, []);

	const checkKeywords = () => {
		const questionKeywords = questions[activeIndex].keywords.split(' ');
		const inputKeywords = note.split(' ').map((word) => word.replace(/[^\w\s]/gi, ''));

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
		setCheckedKeywords(matchingKeywords.join(' '));
		setShowKeywords(true);
	};

	useEffect(() => {
		setNote('');
		setCheckedKeywords('');
		setShowKeywords(false);
		localStorage.setItem('active_question_index', activeIndex);
	}, [activeIndex]);

	return (
		<div className="app">
			<div className="container">
				<div className="sidebar">
					<h1 className="app-title">PTE Summarize Spoken Text</h1>
					{questions?.length > 0 && (
						<div id="pagination" className="pagination">
							<div className="pagination-top">
                
                    <button className="btn-prev" disabled={activeIndex === 0} onClick={() => activeIndex > 0 && setActiveIndex((prevIndex) => prevIndex - 1)}>
                      Previous
                    </button>
                    <span className="active-question-number">{activeIndex + 1}</span>
                    <button
                      className="btn-next"
                      disabled={activeIndex === questions.length - 1}
                      onClick={() => activeIndex < questions.length && setActiveIndex((prevIndex) => prevIndex + 1)}>
                      Next
                    </button>
							</div>
							<div className="pagination-bottom">
								{questions.map((item, index) => (
									<button className={activeIndex === index ? 'active' : ''} key={index} onClick={() => setActiveIndex(index)}>
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

              <div className="description">You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50 - 70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.</div>
							<div className="audio-player">
								<AudioPlayer autoPlay={false} src={activeQuestion.audio} />
							</div>

              <textarea placeholder="Enter text..." className="text-note" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
							<br />
							<button className="btn-check-keywords" onClick={checkKeywords}>
								Check keywords
							</button>

							{showKeywords && (
								<div className="question-box">
									<div className={`question-transcripts ${showKeywords ? 'keywords-showed' : ''}`} dangerouslySetInnerHTML={{ __html: activeQuestion.description }}></div>
									<div className="question-keywords">
										<b>Keywords:</b> <div className="keywords-list" dangerouslySetInnerHTML={{ __html: checkedKeywords }}></div>
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
