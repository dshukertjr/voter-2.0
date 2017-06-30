const functions = require('firebase-functions');


exports.sanitizePost = functions.database
	.ref('/questions/{pushId}/meta')
	.onWrite(event => {
		var question = event.data.val()
		if(question == null) {
			return
		}

		question.sanitized = true
		var includes = false
		if(sanitize(question.question)) includes = true;
		else if(sanitize(question.choice1)) includes = true;
		else if(sanitize(question.choice2)) includes = true;
		else if(question.choice3) if(sanitize(question.choice3)) includes = true;
		else if(question.choice4) if(sanitize(question.choice4)) includes = true;
		else if(question.choice5) if(sanitize(question.choice5)) includes = true;
		// question.choice1 = sanitize(question.choice1)
		// question.choice2 = sanitize(question.choice2)
		// if(question.choice3) question.choice3 = sanitize(question.choice3)
		// if(question.choice4) question.choice4 = sanitize(question.choice4)
		// if(question.choice5) question.choice5 = sanitize(question.choice5)
		if(includes) return event.data.adminRef.parent.remove()
	})


function sanitize(s){
	var sanitizedText = s
	// sanitizedText = sanitizedText.replace(/\bbad\b/ig, "good")
	return sanitizedText.includes("デリヘル")
	// return sanitizedText
}