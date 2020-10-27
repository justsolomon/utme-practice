const allQuestions = JSON.parse(localStorage['questions']);
const timeInfo = JSON.parse(localStorage['timeInfo']);

let attempted = 0;
let passed = 0;
let failed = 0;
let count = 0;

let subjectSummary = [];

for (let i = 0; i < allQuestions.length; i++) {
	subjectSummary.push({
		subject: allQuestions[i].subject,
		total: allQuestions[i].data.length,
		attempted: 0,
		passed: 0,
		failed: 0
	})
	allQuestions[i].data.forEach(question => {
		if (question.selectedAnswer !== undefined) {
			attempted += 1;
			subjectSummary[i].attempted += 1;
			if (question.selectedAnswer === question.answer){
				passed += 1;
				subjectSummary[i].passed += 1;
			} else {
				failed += 1;
				subjectSummary[i].failed += 1;
			}
		}
	})
}

//show percentage progress bar
const percentageBar = document.querySelector('.score-bar-inner');
const percentage = `${Math.round((passed / 160) * 100)}%`;
percentageBar.style.width = percentage;
percentageBar.innerHTML = `<p>${percentage}</p>`;

document.querySelector('.jamb-score').textContent = `${Math.round((passed / 160) * 400)} / 400`;

//for time analysis table
let timeDetails = Object.keys(timeInfo);
timeDetails.forEach(detail => {
	document.querySelector(`.${detail}`).textContent = timeInfo[detail];
})

//for subject score table
let totalQuestions = 0;
let totalAttempted = 0;
let totalPassed = 0;
let totalFailed = 0;
let tableMarkup = '';
subjectSummary.forEach(sub => {
	let subject = sub.subject;
	tableMarkup += `
		<tr>
			<td class='table-subject'>${subject.replace(subject[0], subject[0].toUpperCase())}</td>
			<td>${sub.total}</td>
			<td>${sub.attempted}</td>
			<td>${sub.passed}</td>
			<td>${sub.failed}</td>
		</tr>
	`
	totalQuestions += sub.total;
	totalAttempted += sub.attempted;
	totalPassed += sub.passed;
	totalFailed += sub.failed;
})

document.querySelector('.subject-score-table').insertAdjacentHTML('beforeend', `
		${tableMarkup}
		<tr>
			<td></td>
			<td>${totalQuestions}</td>
			<td>${totalAttempted}</td>
			<td>${totalPassed}</td>
			<td>${totalFailed}</td>
		</tr>
	`);


function displayCorrections() {
	document.querySelector('.results-summary').style.display = 'none';

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
					<h1>Exam Questions Correction</h1>
					<div class='selected-subjects'>
						<ul class='list'>
							${listMarkup}
						</ul>
					</div>

					<div class='current-question'>
						<div class='question'></div>
						<div class='options'></div>
					</div>

					<div class='answers-div'>
						<p class='selected-answer'></p>
						<p class='correct-answer'></p>
					</div>

					<div class='action-buttons'>
						<button class='previous-button'>Previous</button>
						<button class='next-button'>Next</button>
					</div>
					
					<div class='question-boxes-div'></div>
					<div class='action-buttons'>
						<button class='view-results'>View Results</button>
						<button class="new-exam-button">
							<a href="exam.html">Start Another Exam</a>
						</button>
					</div>
				</div>
			`

			document.body.innerHTML = markup;

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
			function nextOrPrevious(index) {
				const currentSubject = document.querySelector('.current').textContent.toLowerCase();
				const subjectData = allQuestions.filter(question => question.subject === currentSubject);
				showDefaultQuestion(subjectData[0], index)
				renderSelectedOption(subjectData[0], document.querySelector('.question').querySelector('span').classList.value);
			}

			//previous
			document.querySelector('.previous-button').addEventListener('click', function() {
				const indexSpan = document.querySelector('.question').querySelector('span');
				let currentIndex = Number(indexSpan.textContent.replace('.', ''))-1;
				nextOrPrevious(currentIndex);
			})

			//next
			document.querySelector('.next-button').addEventListener('click', function() {
				const indexSpan = document.querySelector('.question').querySelector('span');
				let currentIndex = Number(indexSpan.textContent.replace('.', ''))+1;
				nextOrPrevious(currentIndex);
			})

			document.querySelector('.view-results').addEventListener('click', function() {
				window.location.reload();
			})
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
			const questionSubject = document.querySelector('.current').textContent.toLowerCase();
			const question = allQuestions.filter(sub => sub.subject === questionSubject)[0];
			
			//show selected question
			showDefaultQuestion(question, box.textContent)
			indexSpan = document.querySelector('.question').querySelector('span');
			renderSelectedOption(question, indexSpan.classList.value)
		})
	})
}

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

function renderSelectedOption(question, id) {
	const optionObject = question.data.filter(que => que.id == id)[0];
	const option = optionObject.selectedAnswer;

	const allOptions = document.querySelectorAll('.option-input');
	allOptions.forEach(option => {
		if (option.id !== optionObject.answer) option.insertAdjacentHTML('afterend', `<span class='emoji-sign'>❌</span>`);
		else option.insertAdjacentHTML('afterend', `<span class='emoji-sign'>✔️</span>`)
	})

	if (option !== undefined) {
		document.getElementById(option).checked = true;
		document.querySelector('.selected-answer').textContent = `Selected Answer: Option ${option.toUpperCase()}`
	} else {
		document.querySelector('.selected-answer').textContent = `Selected Answer: None`;
	}
	document.querySelector('.correct-answer').textContent = `Correct Answer: Option ${optionObject.answer.toUpperCase()}`
}

function renderAllSelected() {
	const subject = document.querySelector('.current').textContent.toLowerCase();
	const question = allQuestions.filter(sub => sub.subject === subject)[0];

	setTimeout(function() {
		renderSelectedOption(question, document.querySelector('.question').querySelector('span').classList.value)
	}, 100);
}

document.querySelector('.explanation-button').addEventListener('click', displayCorrections)