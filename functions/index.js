const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);



//calculates the stats of questions
exports.calcStats = functions.database
	.ref('/answers/{questionId}/{userId}')
	.onCreate(event => {

	  const questionId = event.params.questionId

	  // Get the meta data of this question
	  const questionMetaPromise = admin.database().ref(`/answers/${questionId}`).once('value')

	  return Promise.all([questionMetaPromise]).then(results => {
	    const answers = results[0].val()


	    var stats = {
	    	choice1: {
	    		count: 0
	    	},
	    	choice2: {
	    		count: 0
	    	},
	    	choice3: {
	    		count: 0
	    	},
	    	choice4: {
	    		count: 0
	    	},
	    	choice5: {
	    		count: 0
	    	}
	    }

		Object.keys(answers).map(function(objectKey, index) {
			var choice = answers[objectKey].choice
			stats["choice" + choice].count++
		})

		const total = stats.choice1.count + stats.choice2.count + stats.choice3.count + stats.choice4.count + stats.choice5.count

		stats.choice1.percent = Math.round(stats.choice1.count * 100 / total)
		stats.choice2.percent = Math.round(stats.choice2.count * 100 / total)
		stats.choice3.percent = Math.round(stats.choice3.count * 100 / total)
		stats.choice4.percent = Math.round(stats.choice4.count * 100 / total)
		stats.choice5.percent = Math.round(stats.choice5.count * 100 / total)


		return event.data.adminRef.root.child(`questions/${questionId}/stats`).set(stats)


	  })

	})


// //calculates the stats of questions
// exports.calcStats = functions.database
// 	.ref('/answers/{questionId}/{userId}')
// 	.onCreate(event => {

// 	  const questionId = event.params.questionId

// 	  // Get the meta data of this question
// 	  const questionMetaPromise = admin.database().ref(`/questions/${questionId}/answers`).once('value')

// 	  return Promise.all([questionMetaPromise]).then(results => {
// 	    const answers = results[0].val()

// 		return event.data.adminRef.root.child(`answers/${questionId}`).set(answers)

// 	  })

// 	})





//sanitizes posted questions
exports.sanitizeQuestion = functions.database
	.ref('/questions/{pushId}/meta')
	.onCreate(event => {
		var question = event.data.val()
		if(question == null) {
			return
		}

		var includes = false
		if(sanitize(question.question)) includes = true;
		else if(sanitize(question.choice1)) includes = true;
		else if(sanitize(question.choice2)) includes = true;
		else if(question.choice3) if(sanitize(question.choice3)) includes = true;
		else if(question.choice4) if(sanitize(question.choice4)) includes = true;
		else if(question.choice5) if(sanitize(question.choice5)) includes = true;
		if(includes) return event.data.adminRef.parent.remove()
	})


//sanitizes posted comments
exports.sanitizeComment = functions.database
	.ref('/questions/{pushId}/comments/{commentId}')
	.onWrite(event => {
		var comment = event.data.val()
		if(comment == null) {
			return
		}

		var includes = false
		if(sanitize(comment.body)) includes = true;
		if(includes) return event.data.adminRef.remove()
	})





//sends notification when receiving comment to the question the user posted
exports.commentNotification = functions.database.ref('/questions/{questionId}/comments/{commendId}').onCreate(event => {

  // If comment delete, exit the function
  if (!event.data.val()) {
  	return
  }

  const questionId = event.params.questionId
  const comment = event.data.val()

  // Get the meta data of this question
  const questionMetaPromise = admin.database().ref(`/questions/${questionId}/meta`).once('value')

  return Promise.all([questionMetaPromise]).then(results => {
    const questionMeta = results[0].val()

    // Check if there are any device tokens.
    if (!questionMeta) return console.log('questionMeta is empty')
    if (!questionMeta.Uid) return console.log('Uid is empty')
    const Uid = questionMeta.Uid

    if(Uid === comment.Uid) return console.log('commented on their own question')


    // Listing all tokens.
	const tokenPromise = admin.database().ref(`/users/private/${Uid}/token`).once('value')

    // Send notifications to all tokens.
	return Promise.all([tokenPromise]).then(results => {
		const token = results[0].val()

		if(!token){
			console.log("empty token")
			return
		}


	    // Notification details.
	    const payload = {
	      data: {
	        title: '質問にコメントがつきました！',
	        body: `${comment.body}`,
	        tag: `${questionId}`,
	        click_action: `https://choice-share.com/question/${questionId}`
	      }
	    }

	    // Listing all tokens.
	    // const tokens = Object.keys(tokensSnapshot.val());

	    // Send notifications to all tokens.
	    return admin.messaging().sendToDevice(token, payload).then(response => {
	      // For each message check if there was an error.
	      const tokensToRemove = [];
	      response.results.forEach((result, index) => {
	        const error = result.error;
	        if (error) {
	          console.error('Failure sending notification to', token, error);
	          // Cleanup the tokens who are not registered anymore.
	          if (error.code === 'messaging/invalid-registration-token' ||
	              error.code === 'messaging/registration-token-not-registered') {
	            // tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
	          }
	        }
	      })
	      return Promise.all(tokensToRemove);
	    }).catch(response =>{
	    	console.log('failed sending notification')
	    })
    })
  })
})



function sanitize(s){
	prohibitedWords = [
		"風俗",
		"ふうぞく",
		"フウゾク",
		"セックス",
		"sex",
		"SEX",
		"Sex",
		"せっくす",
		"デリヘル",
		"でりへる",
		"ピンサロ",
		"ぴんさろ",
		"いちゃキャバ",
		"イチャキャバ",
		"いちゃきゃば",
		"おっぱぶ",
		"おっパブ",
		"オッパブ",
		"まんこ",
		"マンコ",
		"ちんこ",
		"チンコ",
		"ちんちん",
		"チンチン",
		"まんげ",
		"マン毛",
		"まん毛",
		"ちん毛",
		"チン毛",
		"ちんげ",
		"キンタマ",
		"金玉",
		"きんたま",
		"精子",
		"ざーめん",
		"ザーメン",
		"勃起",
		"ボッキ",
		"あなる",
		"アナル",
		"おナニー",
		"おなにー",
		"オナニー",
		"フェラ",
		"ふぇら",
		"包茎",
		"処女",
		"ヤリマン",
		"やりまん",
		"ヤリチン",
		"やりちん",
		"乱交",
		"ローター",
		"ろーたー",
		"スカトロ",
		"すかとろ",
		"中出し",
		"なかだし",
		"中田氏",
		"てこき",
		"手コキ",
		"fuck",
		"Fuck",
		"FUCK",
		"shit",
		"Shit",
		"SHIT",
		"bitch",
		"Bitch",
		"BITCH",
		"死ね",
		"殺す"
	]

	var contains = false
	// prohibitedWords.forEach(function(word, index){
	for(var i = 0; i < prohibitedWords.length; i++){
		var word = prohibitedWords[i]
		if(s.includes(word)){
			contains = true
			break
		}
	}
	return contains
}


