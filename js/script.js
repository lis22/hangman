//global variables
var word;
var charArray=[];
var wrongCount=0;
var correctLettersCount=0;

//images from: http://javascript.about.com/library/blhang3.htm
var imgSource = [
  ['./images/hang0.gif'],
  ['./images/hang1.gif'],
  ['./images/hang2.gif'],
  ['./images/hang3.gif'],
  ['./images/hang4.gif'],
  ['./images/hang5.gif'],
  ['./images/hang6.gif'],
  ['./images/hang7.gif'],
  ['./images/hang8.gif'],
  ['./images/hang9.gif'],
  ['./images/hang10.gif'],
];

$(function(){

  $(".revealLetters").append('<ul id="letterList"> </ul>');

  //reset needed for firefox reload see https://bugzilla.mozilla.org/show_bug.cgi?id=654072
  resetButtons()
  getRandomWord();
  createLetters();

  /*Starts a new game when user clicks new game and resets needed variables and components */
  $('.newGameBtn').click(function(e) {
    resetButtons();
    wrongCount=0;
    correctLettersCount=0;
    getRandomWord();
    $(".img-responsive").attr("src", imgSource[wrongCount]);
    $(".btn-toolbar").hide();
    $('.newGameBtn').css('visibility', 'hidden');
    $('#letterList li').remove();
    setFeedback("Pick a letter below that you think is in the word</br>10 wrong guesses and the game is over", "#FFD180");
  });

  /*When a letter button is clicked gets the value and calls methods to check if
  the letter is in the word and updates the view  */
  $(".btn-toolbar > .btn-group > button.btn").on("click", function() {
    var guess = this.innerHTML;
    var posArray = checkGuess(guess);
    updateView(posArray, guess,this);
  })

}); //end document.ready()

/*Makes a request for a random word from the setgetgo API from this page
http://randomword.setgetgo.com/ */
function getRandomWord() {
  var requestStr = "http://randomword.setgetgo.com/get.php";

  $.ajax({
    type: "GET",
    url: requestStr,
    dataType: "jsonp",
    jsonpCallback: 'WordComplete'
  });
}

/* When it gets back the random word it stores it and checks that it is not too long or
too short. If it is too long or too short, it gets another random word. When the word
is an appropriate length it creates an array of letters and calls a method to display
the number of letters on the board*/
function WordComplete(data) {

  word = data.Word.trim().toUpperCase();
  console.log(word);

  wordLength = word.length;

  if (wordLength > 8|| wordLength < 4)
  getRandomWord();

  else {
    charArray = word.split("");
    $(".btn-toolbar").show();
    createLetters()
  }
}

/*Creates the number of underscores that is in the secret word on the board */
function createLetters() {
  for(var i=0; i< charArray.length;i++)
  $('#letterList').append("<li>" + " _ " + "</li>");
}

/*Given the position the letter is in and the letter itself, it places the
letter(s) in the correct spot(s) on the page */
function revealLetters(pos,letter) {
  for(var i=0; i< pos.length;i++)
  $("#letterList li").eq(pos[i]).text(letter);
}

/*Sets all the letter buttons to be clickable and removes previous class
buttons had to give them colors of red or green for wrong or right */
function resetButtons() {
  $('.btn-group').each(function()
  {
    $('.btn').prop('disabled', false);

    if($('.btn').hasClass("btn-success")) {
      $('.btn').removeClass("btn-success");
      $('.btn').addClass('btn-default');
    }

    if($('.btn').hasClass("btn-danger")) {
      $('.btn').removeClass("btn-danger");
      $('.btn').addClass('btn-default');
    }
  })
}

/*Given the text and color for the background, sets the feedback div */
function setFeedback(text, color) {
  $(".actualFeedback").html(text);
  $(".answerFeedback").css({"background-color": color});
}

/*Checks if the letter selected is in the secret word. If it is then it places
the position of the letter onto an array and keeps track of how many letters correct.
It returns the position array. It will return empty if the letter was not in the word. */
function checkGuess(guess){
  var posArray = [];

  for(var i=0; i<charArray.length; i++) {
    if(guess==charArray[i]) {
      posArray.push(i);
      correctLettersCount++;
    }
  }
  return posArray;
}

/*Given the array of positions which either is empty or has positions of where the
letter is in the secret word, the guess itself, and the button context, it determines if
the game is over, if there are letters to reveal or if the letter was wrong.
Then it applies appropriate updates to the view */
function updateView(posArray, guess,context) {

  //disables the letter chosen so it cannot be clicked again
  $(context).prop('disabled', true);


  //Tests if the letter has position(s)
  if(posArray.length >0 ) {
    $(context).removeClass('btn-default');
    $(context).addClass('btn-success');
    revealLetters(posArray, guess);
    setFeedback(guess + " is in the word!</br> " + getTriesLeft(), "#dff0d8");

      //Tests if won game
      if(correctLettersCount == charArray.length) {
        revealLetters(posArray, guess);
        setFeedback("You won! Great job!</br>Click 'New Game' to play again", "#dff0d8");
        gameOver();
      }
  }

  //The letter was wrong
  else {
    $(context).removeClass('btn-default');
    $(context).addClass('btn-danger');

    //Tests if more guesses are allowed or if the game is over
    if(wrongCount < 9) {
      ++wrongCount;
      //advances the hangman image
      $(".img-responsive").attr("src", imgSource[wrongCount]);
      setFeedback(guess + " is not in the word. </br>  " + getTriesLeft(), "#f2dede");
    }
    else {
      setFeedback("Game Over. The word was " + word.toLowerCase()+"</br>Click 'New Game' to play again", "#f2dede");
      gameOver();
    }
  }
}

/*Determines how many tries the user has left and returns a message */
function getTriesLeft() {
  var triesLeft = 10-wrongCount;
  var text;

  if (triesLeft ==1)
    text = triesLeft + " wrong guess left!";
  else
    text = triesLeft + " wrong guesses left!";
  return text;
}

/*Disables all alphabet buttons. Used when the game is over */
function disableButtons() {
  $('.btn-group').each(function(){
    $('.btn-group .btn').prop('disabled', true);
  })
}

/*When the game is over this calls the disable button function to disable the letter
buttons and to reveal the new game button */
function gameOver() {
  disableButtons();
  $('.newGameBtn').css('visibility', 'visible');
}
