const question = document.getElementById("question")
const choices = Array.from(document.getElementsByClassName("choice-text"))
const progressText = document.getElementById('progressText')
const questionCounterText = document.getElementById('questionCounter')
const scoreText = document.getElementById("score")
const progressBarFull = document.getElementById("progressBarFull")
const loader = document.getElementById("loader")
const game = document.getElementById("game")

let currentQuestion = {}
let acceptingAnswers = true
let score = 0
let questionCounter = 0
let availableQuestions = {}

let questions = []
let reloads = sessionStorage.getItem('reloads') ? parseInt(sessionStorage.getItem('reloads')) : 0

const fetchQuestions = () => {

    const fetchTimeout = setTimeout(() => {
        if(reloads < 3){
            reloads++
            sessionStorage.setItem('reloads', reloads)
            window.location.reload()
        }else{
            console.error('Max reload attempts reached. Unable to fetch questions.')
        }
    }, 10000);



fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
    .then(res => {
        clearTimeout(fetchTimeout);
        return res.json()
    })
    .then(loadedQuestions => {
        // console.log(loadedQuestions)
        if(!loadedQuestions.results || loadedQuestions.results.length === 0){
            throw new Error("No Questions received")
        }

        reloads = 0 // resetting to 0, if loadedQuestions received
        sessionStorage.setItem('reloads', reloads)


        questions = loadedQuestions.results.map(loadedQuestion => {
            const formattedQuestion = {
                question: loadedQuestion.question
            }

            const answerChoices = [...loadedQuestion.incorrect_answers]
            formattedQuestion.answer = Math.floor(Math.random() * 3) + 1
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            )

            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice" + (index + 1)] = choice
            })

            return formattedQuestion
        })


        startGame()
    }).catch(err => {
        clearTimeout(fetchTimeout)
        console.error("Error fetching questions:", err)

        if(reloads < 3){
            reloads++
            sessionStorage.setItem('reloads', reloads)
            window.location.reload()
        } else{
            console.error("Max reload attempts reached. Unable to fetch questions.");
        }

    });
}

fetchQuestions()

//CONSTANTS
const CORRECT_BONUS = 10
const MAX_QUESTIONS = 3

startGame = () => {
    questionCounter = 0
    score = 0
    availableQuestions = [...questions]
    console.log(availableQuestions)
    getNewQuestion()
    game.classList.remove('hidden')
    loader.classList.add('hidden')
}

getNewQuestion = () => {

    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        // go to the end page
        localStorage.setItem("mostRecentScore", score)
        return window.location.assign("end.html")
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`
    // update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    const questionIndex = Math.floor(Math.random() * availableQuestions.length)
    currentQuestion = availableQuestions[questionIndex]
    question.innerText = currentQuestion.question

    choices.forEach(choice => {
        const number = choice.dataset["number"]
        choice.innerText = currentQuestion["choice" + number]
    })

    availableQuestions.splice(questionIndex, 1)
    acceptingAnswers = true
}

console.log(currentQuestion)
choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return

        acceptingAnswers = false
        const selectedChoice = e.target
        const selectedAnswer = selectedChoice.dataset["number"]

        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect'

        if (classToApply == 'correct') {
            incrementScore(CORRECT_BONUS)
        }

        selectedChoice.parentElement.classList.add(classToApply)
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply)
            getNewQuestion()
        }, 1000)
    })
})

incrementScore = num => {
    score += num
    scoreText.innerText = score
}