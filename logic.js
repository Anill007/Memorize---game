let timer;
let taskTimes = [10, 0, 60, 0, 180];
let difficultyChoice = [2, 4, 6];
let apiImagesId = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 277, 287, 292, 299, 306, 314, 326,
  609,
];

init(1);

function init(num) {
  function getImg(i) {
    return apiImagesId[i];
  }

  let difficulty = difficultyChoice[num-1];
  let containers = [];
  let clickedContainerIndex = {
    current: null,
    previous: null,
  };
  let isAnimating = false;
  let successfulMatches = 0;
  let generatedNumPairs = [];
  let allContainers = "";

  if (timer?.interval) {
    clearInterval(timer.interval);
    timer = {
      count: taskTimes[difficulty - 2],
      interval: null,
      firstClick: false,
      pause: false,
    };
  } else {
    timer = {
      count: taskTimes[difficulty - 2],
      interval: null,
      firstClick: false,
      pause: false,
    };
  }

  generateRandomNums();
  displayTimeRemaining();
  setGridTemplate();

  // create cards and assign photo and values
  for (let i = 0; i < generatedNumPairs.length; i++) {
    allContainers += `<div class="card-container">
    <div class="card-back" style='background-image:url("https://picsum.photos/id/${getImg(
      generatedNumPairs[i]
    )}/200"); background-size: cover;'>
      <p class="card-value" style="opacity: 0;">${generatedNumPairs[i]}</p>
    </div>
    <div class="card">
    </div>
  </div>`;
  }

  // put cards on table container
  document.querySelector(".table").innerHTML = allContainers;

  // containers are all the cards in the game
  containers = Array.from(document.querySelectorAll(".card-container"));

  // modify containers, properties are required values and card html reference
  containers = containers.map((container, index) => {
    return {
      index,
      element: container,
      flipped: false,
      matched: false,
      value: container.firstElementChild.firstElementChild.innerText,
    };
  });

  // add click listeners to cards
  // start timer on first click
  // events to follow after click inside if condition
  containers.forEach((container) => {
    container.element.addEventListener("click", () => {
      checkTimer();
      if (
        !container.flipped &&
        !container.matched &&
        !isAnimating &&
        !timer.pause
      ) {
        document.querySelector(".play-pause").style.display = "block";
        document.querySelector(".play-pause").src = "img/pause.png";
        container.element.classList.add("flip");
        container.flipped = true;
        clickedContainerIndex.previous = clickedContainerIndex.current;
        clickedContainerIndex.current = container.index;
      }
    });

    // disable events while cards are animating
    // show progress arrow
    container.element.addEventListener("transitionstart", (e) => {
      isAnimating = true;
      document.body.style.cursor = "progress";
      if (e.target.classList.contains("card")) {
      }
    });

    // check game state after animation end
    // hide progress arrow
    container.element.addEventListener("transitionend", (e) => {
      isAnimating = false;
      document.body.style.cursor = "default";
      if (
        e.target.classList.contains("card") &&
        containers[clickedContainerIndex.previous]?.value
      ) {
        checkMatch();
      }
    });
  });

  // check if cards match
  // check if game won on cards match
  // reset values and cards if not matched
  function checkMatch() {
    if (
      containers[clickedContainerIndex.current]?.value ===
      containers[clickedContainerIndex.previous]?.value
    ) {
      containers[clickedContainerIndex.current].matched = true;
      containers[clickedContainerIndex.previous].matched = true;
      clickedContainerIndex = {
        previous: null,
        current: null,
      };
      successfulMatches++;
      isGameWon();
    } else {
      containers[clickedContainerIndex.current]?.element.classList.remove(
        "flip"
      );
      containers[clickedContainerIndex.previous]?.element.classList.remove(
        "flip"
      );
      containers[clickedContainerIndex.current].flipped = false;
      containers[clickedContainerIndex.previous].flipped = false;
      clickedContainerIndex = {
        previous: null,
        current: null,
      };
    }
  }

  // reset timer if game won and show popup
  function isGameWon() {
    if (successfulMatches >= (difficulty * difficulty) / 2) {
      document.querySelector(".win").style.display = "flex";
      resetTimer();
    }
  }

  function showGameLost() {
    document.querySelector(".win").style.display = "flex";
    document.querySelector(".win-content").classList.remove('win-bg');
    document.querySelector(".win-loose-txt").innerText = "You loose!!!";
  }

  // add timer if not present on first click
  // show lost if timer ends before game is won
  function checkTimer() {
    if (!timer.interval && !timer.firstClick && timer.count) {
      timer.firstClick = true;
      timer.interval = setInterval(() => {
        if (!timer.pause) {
          timer.count--;
          document.querySelector(".time-left").innerText = timer.count;
        }
        if (timer.count <= 0) {
          showGameLost();
          resetTimer();
        }
      }, 1000);
    }
  }

  // generate random nums and suffle them to assign values to the cards
  function generateRandomNums() {
    let randNumSingle = [];
    let randNumPair = [];
    for (let i = 0; i < (difficulty * difficulty) / 2; i++) {
      randNumSingle.push(Math.floor(Math.random() * apiImagesId.length));
    }
    randNumPair = randNumSingle.concat(randNumSingle);
    generatedNumPairs = shuffleNums(randNumPair);
  }

  function shuffleNums(randNumPair) {
    let loop = Math.floor(Math.random() * (difficulty * difficulty));
    for (let i = 0; i < loop; i++) {
      let randomIndexA = Math.floor(Math.random() * (difficulty * difficulty));
      let randomIndexB = Math.floor(Math.random() * (difficulty * difficulty));
      let temp = randNumPair[randomIndexA];
      randNumPair[randomIndexA] = randNumPair[randomIndexB];
      randNumPair[randomIndexB] = temp;
    }
    return randNumPair;
  }

  function displayTimeRemaining() {
    document.querySelector(".time-left").innerText = taskTimes[difficulty - 2];
  }

  // update layout based on difficulty
  function setGridTemplate() {
    let gtc = "";
    for (let i = 0; i < difficulty; i++) {
      gtc += "auto ";
    }
    document.querySelector(".table").style.gridTemplateColumns = gtc;
  }
}

// toggle state of timer.pause
// timer.pause is true if game is paused
// show paused alert if paused
// change icon of play/pause button at bottom corner of screen
function toggleTimer() {
  timer.pause = !timer.pause;
  if (timer.pause) {
    document.querySelector(".play-pause").src = "img/play.png";
    document.querySelector(".alert").style.display = "flex";
  } else {
    document.querySelector(".play-pause").src = "img/pause.png";
    document.querySelector(".alert").style.display = "none";
  }
}

// hide alert on cancel
function cancel() {
  document.querySelector(".alert").style.display = "none";
}

// on reset clear timers and reload window
function resetGame() {
  resetTimer();
  window.location.reload();
}

// clear interval and set default timer values
function resetTimer() {
  clearInterval(timer.interval);
  timer = {
    count: 0,
    interval: null,
    firstClick: false,
    pause: false,
  };
}

// open settings modal
function openSettings() {
  if (timer.interval) {
    timer.pause = true;
    document.querySelector(".play-pause").style.display = "block";
    document.querySelector(".play-pause").src = "img/play.png";
    document.querySelector(".choose-lvl").style.display = "flex";
  } else {
    document.querySelector(".choose-lvl").style.display = "flex";
  }
}

function removeLvlSelection() {
  document.querySelector(".choose-lvl").style.display = "none";
}

function playLvl(num) {
  document.querySelector(".play-pause").style.display = "none";
  init(num);
}
