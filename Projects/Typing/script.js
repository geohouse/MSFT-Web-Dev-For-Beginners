// all of our quotes
const quotes = [
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
  "Nothing clears up a case so much as stating it to another person.",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
];

// List of words for the current quote and the index of the word the player is
// currently typing
let words = [];
let wordIndex = 0;

//Starting time
let startTime = Date.now();

const quoteElement = document.querySelector("#quote");
const messageElement = document.querySelector("#message");
const typedValueElement = document.querySelector("#typed-value");

console.log("running");

document.querySelector("#start").addEventListener("click", () => {
  console.log("clicked");
  // get a quote
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  // parse quote into array of words
  words = quote.split(" ");
  // reset word index for tracking
  wordIndex = 0;
  console.log({ wordIndex });
  // UI updates
  //Create array of span elements
  const spanWords = words.map((word) => `<span>${word} </span>`);
  console.log("span words is");
  console.log(spanWords);
  // convert into string and set as innerHTML for quote display
  quoteElement.innerHTML = words.join(" "); //spanWords.join("");
  // Highlight the first word
  quoteElement.childNodes[0].className = "highlight";
  // clear any other messages
  messageElement.innerText = "";

  // setup (or clear) the textbox
  typedValueElement.value = "";
  // set focus
  typedValueElement.focus();
  // start timer
  startTime = new Date().getTime();
});

typedValueElement.addEventListener("input", () => {
  // get current word
  const currentWord = words[wordIndex];
  // get current value
  const typedValue = typedValueElement.value;

  if (typedValue === currentWord && wordIndex === words.length - 1) {
    // end of sentence and display success
    const elapsedTime = new Date().getTime() - startTime;
    const message = `CONGRATULATIONS! You finished in ${
      elapsedTime / 1000
    } seconds. That's ${
      (words.length * 60) / (elapsedTime / 1000)
    } words per minute.`;
    messageElement.innerText = message;
  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    // end of word; clear for the new word
    typedValueElement.value = "";
    //move to next word
    wordIndex++;
    //reset the class name for all elements in quote
    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }
    // highlight the new word
    quoteElement.childNodes[wordIndex].className = "highlight";
  } else if (currentWord.startsWith(typedValue)) {
    //currently correct; highlight the next word
    typedValueElement.className = "";
  } else {
    //error state
    typedValueElement.className = "error";
  }
});
