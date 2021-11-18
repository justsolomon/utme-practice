/////////////////////
// Exam Page Scripts
/////////////////////

//show greeting
const greetingDiv = document.querySelector('.greeting');
greetingDiv.innerHTML = `
	<p class='greeting-text'>${localStorage['greeting']}</p>
	<p class='close-greeting'>✕</p>
`
document.querySelector('.close-greeting').addEventListener('click', function() {
	greetingDiv.style.display = 'none';
});

//relating to the exam session
const subjectParams = {
		'English Language': 'english',
		'Mathematics': 'mathematics',
		'Commerce': 'commerce',
		'Accounting': 'accounting',
		'Biology': 'biology',
		'Physics': 'physics',
		'Chemistry': 'chemistry',
		'Literature in English': 'englishlit',
		'Government': 'government',
		'Christian Religious Knowledge': 'crk',
		'Geography': 'geography',
		'Economics': 'economics',
		'Islamic Religious Knowledge': 'irk',
		'Civic Education': 'civiledu',
		'Insurance': 'insurance',
		'Current Affairs': 'currentaffairs',
		'History': 'history'
}

const subjects = document.querySelectorAll('.subject');
selectedSubjects = [];

subjects.forEach(subject => {
	subject.addEventListener('click', function() {
		if (selectedSubjects.length !== 4 && selectedSubjects.includes(subject.textContent)) {
			subject.classList.toggle('selected');
			selectedSubjects.splice(selectedSubjects.indexOf(subject.textContent), 1)
		}
		else if (selectedSubjects.length !== 4) {
			subject.classList.toggle('selected');
			document.querySelectorAll('.selected').forEach(selected => {
				if (!selectedSubjects.includes(selected.textContent)) selectedSubjects.push(selected.textContent);
			})
		}
		else if (selectedSubjects.length === 4 && selectedSubjects.includes(subject.textContent)) {
			subject.classList.toggle('selected');
			selectedSubjects.splice(selectedSubjects.indexOf(subject.textContent), 1)
		}
	})
})


///////////////////////
//to get sample data in
//case API fucks up
///////////////////////

// async function renderQuestions() {
// 	allQuestions = await getQuestions();
// }

// function getQuestions() {
// 	return fetch('https://gist.githubusercontent.com/Solomon403/75d9fd2f92677a47591eb8d96b9840df/raw/5d469a1ae2488580bd85566a7efa069588ea0fd9/utmeQuestions.json')
// 			.then(res => res.json())
// 			.catch(err => console.log(err))
// }

// let allQuestions = [];

function getQuestions(subject) {
	return fetch(`https://questions.aloc.ng/api/v2/m?subject=${subject}`, {
       				headers: {
         				'Accept': 'application/json',
         				'Content-Type': 'application/json',
         				'AccessToken': 'ALOC-e7db7b28842dcfea6a42'
       				},
       				method: "GET",
   			})
			.then(res => res.json())
			.catch(err => console.log(err))
}

async function renderQuestions(subject) {
	data = await getQuestions(subjectParams[subject]);
	allQuestions.push(data)
}

function getAllQuestions() {
	selectedSubjects.forEach(subject => {
		renderQuestions(subject)
	})
}

const allQuestions = [];

function displayAllQuestions() {
	getAllQuestions();
	const changeDisplayInterval = setInterval(function() {
		if(allQuestions.length === 4) {
			document.querySelector('.subjects').style.display = 'none';

			//loop for compiling list of subjects
			let listMarkup = '';
			allQuestions.forEach(question => {
				subject = question.subject;
				listMarkup += `
					<li class='subject'>${subject.replace(subject[0], subject[0].toUpperCase())}</li>
				`
			})

			markup = `
				<div class='exam-session'>
					<div class='header'>
						<div class='time'>
							<p class='start-time'>Start: <span>${new Date().toLocaleTimeString()}</span></p>
							<p class='stop-time'>Stop: <span>${new Date(new Date().getTime()+7200000).toLocaleTimeString()}</span></p>
						</div>
						<p class='active-time'></p>
					</div>
					
					<div class='selected-subjects'>
						<ul class='list'>
							${listMarkup}
						</ul>
					</div>

					<div class='current-question'>
						<div class='question'></div>
						<div class='options'></div>
					</div>

					<div class='action-buttons'>
						<button class='previous-button'>Previous</button>
						<button class='next-button'>Next</button>
					</div>
					
					<div class='question-boxes-div'></div>

					<div class='action-buttons'>
						<button class='submit-exam-button'>Submit Exam</button>
					</div>
				</div>
			`

			document.body.innerHTML = markup;

			//for countdown timer
			const time = new Date().getTime()+7200000;
			const countdown = setInterval(function() {
				getTime(countdown, time);
			}, 1000)


			//set first subject to default current subject
			const defaultCurrent = document.querySelector('.subject');
			defaultCurrent.classList.toggle('current');
			const defaultData = allQuestions.filter(question => question.subject === defaultCurrent.textContent.toLowerCase())
			displaySelectedQuestions(defaultData[0]);
			//show default question
			showDefaultQuestion(defaultData[0], 1)


			//to change current subject on click
			document.querySelectorAll('.subject').forEach(subject => {
				subject.addEventListener('click', function() {
					document.querySelector('.current').classList.toggle('current');
					subject.classList.toggle('current');

					const subjectData = allQuestions.filter(question => question.subject === subject.textContent.toLowerCase())
					displaySelectedQuestions(subjectData[0]);
					showDefaultQuestion(subjectData[0], 1);
				})
			})

			//to show previous/next question
			function nextOrPrevious(index, questionId) {
				const currentSubject = document.querySelector('.current').textContent.toLowerCase();
				const subjectData = allQuestions.filter(question => question.subject === currentSubject);
				const originalIndex = Number(document.querySelector('.question').querySelector('span').textContent.replace('.', ''))-1;
				saveToStorage(document.querySelectorAll('.option-input'), subjectData[0], originalIndex, questionId)
				showDefaultQuestion(subjectData[0], index)
				renderSelectedOption(subjectData[0], document.querySelector('.question').querySelector('span').classList.value);
			}

			//previous
			document.querySelector('.previous-button').addEventListener('click', function() {
				const indexSpan = document.querySelector('.question').querySelector('span');
				let currentIndex = Number(indexSpan.textContent.replace('.', ''))-1;
				nextOrPrevious(currentIndex, indexSpan.classList.value);
			})

			//next
			document.querySelector('.next-button').addEventListener('click', function() {
				const indexSpan = document.querySelector('.question').querySelector('span');
				let currentIndex = Number(indexSpan.textContent.replace('.', ''))+1;
				nextOrPrevious(currentIndex, indexSpan.classList.value);
			})

			//to quit exam
			document.querySelector('.submit-exam-button').addEventListener('click', function() {
				let timeLeft = document.querySelector('.active-time').textContent;
				let timeLeftStrip = timeLeft.replace('h ', '').replace('m ', '').replace('s', '').padEnd(5, '0');
				let timeSpent = String(16060 - timeLeftStrip).padStart(5, '0');
				timeSpent = timeSpent.replace(timeSpent[0], `${timeSpent[0]}h `);
				timeSpent = timeSpent.replace(timeSpent[4], `${timeSpent[4]-1}m `);
				timeSpent = timeSpent.replace(timeSpent[8], `${timeSpent[8]}s`);
				const timeInfo = {
					'start-time': document.querySelector('.start-time').querySelector('span').textContent,
					'end-time': document.querySelector('.stop-time').querySelector('span').textContent,
					'time-spent': timeSpent,
					'time-left': timeLeft
				}

				localStorage['timeInfo'] = JSON.stringify(timeInfo);
				
				if (!localStorage['questions']) localStorage['questions'] = JSON.stringify(allQuestions);

				if (window.confirm('Are you sure you want to submit this exam?')) window.location.assign('results.html')
			})

			clearInterval(changeDisplayInterval);
		};
	}, 1000)
}

function displaySelectedQuestions(subject) {
	const questions = subject.data;
	let boxesMarkup = '';
	
	for(let i = 0; i < questions.length; i++) {
		boxesMarkup += `
			<li id='${questions[i].id}' class='question-box ${subject.subject}'>${i+1}</li>
		`
	}

	document.querySelector('.question-boxes-div').innerHTML = `
		<ul class='boxes-list'>
			${boxesMarkup}
		</ul>
	`

	renderAllSelected();

	//to change question being displayed
	document.querySelectorAll('.question-box').forEach(box => {
		box.addEventListener('click', function() {
			// const questionSubject = box.classList.value.replace('question-box ', '').replace(' answered', '');
			const questionSubject = document.querySelector('.current').textContent.toLowerCase();
			const question = allQuestions.filter(sub => sub.subject === questionSubject)[0];

			//save to storage first
			let indexSpan = document.querySelector('.question').querySelector('span');
			const originalIndex = Number(indexSpan.textContent.replace('.', ''))-1;
			saveToStorage(document.querySelectorAll('.option-input'), question, originalIndex, indexSpan.classList.value);
			
			//show selected question
			showDefaultQuestion(question, box.textContent)
			indexSpan = document.querySelector('.question').querySelector('span');
			renderSelectedOption(question, indexSpan.classList.value)
		})
	})
}

function renderAllSelected() {
	const subject = document.querySelector('.current').textContent.toLowerCase();
	const question = allQuestions.filter(sub => sub.subject === subject)[0];
	const boxes = document.querySelectorAll('.question-box');

	setTimeout(function() {
		renderSelectedOption(question, document.querySelector('.question').querySelector('span').classList.value)
	}, 100);
	boxes.forEach(box => {
		const option = question.data.filter(que => que.id == box.id)[0].selectedAnswer;
		if (option !== undefined && box !== null) box.classList.add('answered');
	})
}

//show default question/display next and previous
function showDefaultQuestion(question, index) {
	let section;
	const sectionText = question.data[index-1].section;
	if (sectionText !== '') section = 'english-section';
	document.querySelector('.question').innerHTML = `
		<span class='${question.data[index-1].id}'>${index}.</span>
		<div>
			<span class=${section}>${sectionText}</span>
			<p>${question.data[index-1].question}</p>
		</div>
	`

	const optionsDiv = document.querySelector('.options');
	const optionIds = Object.keys(question.data[index-1].option);
	const optionValues = Object.values(question.data[index-1].option);
	let markup = '';
	
	for(let i = 0; i < 4; i++) {
		markup += `
			<label for='${optionIds[i]}'>
				<input type='radio' class='option-input' id='${optionIds[i]}' value='${optionIds[i]}' name='option' />
				<span>${optionIds[i].toUpperCase()}. ${optionValues[i]}</span>
			</label>
		`
	}

	optionsDiv.innerHTML = markup;
}

function getTime(countdown, time) {
	const now = new Date().getTime();
	const countDownTime = time;
	
	let distance = countDownTime - now;
	let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  	let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  	document.querySelector('.active-time').innerHTML = `${hours}h ${minutes}m ${seconds}s`;
  	if (distance < 0) {
  		clearInterval(countdown);
  		alert('Time up!');
  		window.location.assign('results.html');
  	}
}

function saveToStorage(options, question, optionIndex, boxId) {
	let index;
	const box = document.getElementById(boxId);
	for (i = 0; i < allQuestions.length; i++) {
		if (allQuestions[i].subject === question.subject) {
			index = i;
		}
	}
	for (i = 0; i < options.length; i++) {
		if(options[i].checked) {
			allQuestions[index].data[optionIndex].selectedAnswer = options[i].value;
			localStorage['questions'] = JSON.stringify(allQuestions);
			if (box !== null) box.classList.add('answered');
		}
	}
}

function renderSelectedOption(question, id) {
	const option = question.data.filter(que => que.id == id)[0].selectedAnswer;
	if (option !== undefined) document.getElementById(option).checked = true;
}

const startExamButton = document.querySelector('.start-exam-button');

startExamButton.addEventListener('click', function() {
	if (selectedSubjects.length === 4) {
		document.querySelector('.loader-icon').style.display = 'inline-block';
		displayAllQuestions();
	};
})
