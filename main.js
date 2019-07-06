/*
	Samy Masadi
	Longest Common Subsequence Project
*/

//////////////////////////////////////
//		Page Global Variables		//
//////////////////////////////////////

var messageTimeline = [];
var indexToEdit;

//////////////////////////////////////
//		LCS Algorithm Functions		//
//////////////////////////////////////

/**
	The function finds the longest common subsequence (LCS) between two arrays.
	@return the length of the LCS
	@param array1 first array to compare
	@param array2 second array to compare
	@param storage array to contain the indices of the common characters
*/
function findLCS(array1, array2, storage) {
	var lcsGraph = [];

	// Initialize first row and column with zeros to avoid needing a bunch of array bound checks later.
	for (let row = 0; row <= array1.length; row++) {
		lcsGraph[row] = [0];
	}
	for (let column = 1; column <= array2.length; column++) {
		lcsGraph[0][column] = 0;
	}

	for (let row = 1; row <= array1.length; row++) {			
		for (let column = 1; column <= array2.length; column++) {
			if (array1[row-1] === array2[column-1]) {				
				// Simply add 1 to value in upper left adjacent cell because it represents 
				// the LCS not including either of the elements being compared.
				lcsGraph[row][column] = lcsGraph[row-1][column-1] + 1;
			}
			else {					
				// Otherwise, copy the max value from above or left cells because they represent
				// the LCS not including array2's element (left)
				// or not including array1's element (above).
				lcsGraph[row][column] = Math.max(lcsGraph[row][column-1], lcsGraph[row-1][column]);
			}
		}
	}
	
	backtrack(lcsGraph, array1, array2, storage);
	return lcsGraph[array1.length][array2.length];
}

/**
	A function to store the indices of the LCS between two arrays.
	The code was separated from findLCS to make it more digestible and organized.
	@param graph the 2D array of LCS values
	@param array1 the first array to compare
	@param array2 the second array to compare
	@param storage array to contain the indices of the common characters
*/
function backtrack(graph, array1, array2, storage) {
	var row = array1.length;
	var column = array2.length;
	var cellValue = graph[row][column];
	while (cellValue > 0) {
		if (array1[row-1] === array2[column-1]) {
			storage[cellValue-1] = [row-1, column-1];
			row--; column--;
			cellValue = graph[row][column];
		}
		else {
			if (graph[row-1][column] >= graph[row][column-1]) {
				row--;
			}
			else {
				column--;
			}
		}
	}
}

/**
	A function that's more sophisticated than .split() for splitting a string into an array of strings.
	This version saves words, punctuation, and spaces as their own independent strings.
	@param string the string to split up
	@param array the array to save split strings to
*/
function strToArr(string, array) {
	// Characters were chosen because they typically appear at the beginning or end of a string.
	var punc = [" ", ",", ".", ":", ";", "?", "!", "\"", "(", ")", "[", "]", "{", "}"];
	var wordStart = 0;
	var wordEnd = 0;
	for (let i = 0; i < string.length; i++) {
		var char = string.substr(i, 1);
		if (punc.indexOf(char) !== -1) {
			if (wordStart !== i) {
				array.push(string.substring(wordStart, wordEnd+1));
			}
			array.push(char);
			wordStart = i+1;
			wordEnd = i+1;
		}
		else {
			wordEnd = i;
			if (wordEnd === string.length-1) {
				array.push(string.substring(wordStart, wordEnd+1));
			}
		}						
	}
}

/**
	A function to tag a string with HTML depending on the LCS results.
	@return the final sting including html tags
	@param arrayOfStrings the sequence of strings to process
	@param lcsResults the indices corresponding to the LCS in the arrayOfStrings
	@param original indicates whether arrayOfStrings is an original or edited sequence
*/
function processString(arrayOfStrings, lcsResults, original) {
	var htmlString = "";
	var tag;
	var lcsColumn;
	if (original) {
		tag = "s";
		lcsColumn = 0;
	}
	else {
		tag = "b";
		lcsColumn = 1;
	}
	var lcsRow = 0;
	for (let i = 0; i < arrayOfStrings.length; i++) {
		if (lcsRow < lcsResults.length && i === lcsResults[lcsRow][lcsColumn]) {
			htmlString += arrayOfStrings[i];
			lcsRow++;
		}
		else {
			htmlString += "<" + tag + ">" + arrayOfStrings[i] + "</" + tag + ">";
		}
	}
	return htmlString;
}

//////////////////////////////////////
//		Web Page Interactivity		//
//////////////////////////////////////

function openMessageForm() {
	document.getElementById("modal-background").style.display = "block";
	document.getElementById("input-container").style.display = "block";
	document.getElementById("input-area").focus();
}

function postInitialMessage() {
	inputString = document.getElementById("input-area").value;
	var messageIndex = messageTimeline.push(inputString) - 1;
	postMessage(inputString, messageIndex);
}

function postMessage(messageString, timelineIndex) {
	var newMessage = document.createElement("p");
	var textNode = document.createTextNode(messageString);
	newMessage.appendChild(textNode);
	newMessage.id = timelineIndex;
	newMessage.addEventListener("click", editMessage);

	var timeline = document.getElementById("timeline-container");
	timeline.insertBefore(newMessage, timeline.childNodes[0]);
	timeline.style.display = "block";
	closeModalView();
}

function closeModalView() {
	document.getElementById("comparison-container").style.display = "none";
	document.getElementById("edit-container").style.display = "none";
	document.getElementById("input-container").style.display = "none";
	document.getElementById("modal-background").style.display = "none";
	document.getElementById("input-area").value = "";
}

function editMessage() {
	indexToEdit = this.id;
	document.getElementById("edit-area").value = messageTimeline[indexToEdit];
	document.getElementById("modal-background").style.display = "block";
	document.getElementById("edit-container").style.display = "block";
	document.getElementById("edit-area").focus();
}

function showChanges() {
	var editedString = document.getElementById("edit-area").value
	var array1 = [];
	var array2 = [];
	strToArr(messageTimeline[indexToEdit], array1);
	strToArr(editedString, array2);
	var results = [];
	findLCS(array1, array2, results);
	dispString1 = processString(array1, results, true);
	dispString2 = processString(array2, results, false);

	document.getElementById("original-string").innerHTML = dispString1;
	document.getElementById("edited-string").innerHTML = dispString2;
	document.getElementById("comparison-container").style.display = "block";
}

function postEditedMessage() {
	var messageToRemove = document.getElementById(indexToEdit);
	messageToRemove.parentNode.removeChild(messageToRemove);

	var editedString = document.getElementById("edit-area").value;
	messageTimeline[indexToEdit] = editedString;
	postMessage(editedString, indexToEdit);
}

function backFromComparison() {
	document.getElementById("comparison-container").style.display = "none";
	document.getElementById("original-string").innerHTML = "";
	document.getElementById("edited-string").innerHTML = "";
}