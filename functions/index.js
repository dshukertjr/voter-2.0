const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


//sanitizes posted questions
exports.sanitizeQuestion = functions.database
	.ref('/questions/{pushId}/meta')
	.onWrite(event => {
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


// // notifying users for comments and stuff
// exports.sanitizeComment = functions.database
// 	.ref('/questions/{questionId}/comments/{commentId}')
// 	.onWrite(event => {
// 		const questionId = event.params.questionId
// 		const commentId = event.params.commentId
// 		const getSomethingPromise = admin.database().ref('/questions/' + questionId).once('value');

// 	     return getSomethingPromise.then(results => {
// 	        const question = results[0];

//           Object.keys(question.comments).map(function(objectKey, index) {
//           	//get the uid of the comment
//           	var uid = question.comments[objectKey].Uid
          	
//           });

//     	}

// 	})








//sends notification when receiving comment to the question the user posted
exports.commentNotification = functions.database.ref('/questions/{questionId}/comments/{commendId}').onWrite(event => {

  // If comment delete, exit the function
  if (!event.data.val()) {
  	return
  }

  const questionId = event.params.questionId
  const comment = event.data.val()
  console.log("comment is ", comment)

  // Get the meta data of this question
  const questionMetaPromise = admin.database().ref(`/questions/${questionId}/meta`).once('value');

  return Promise.all([questionMetaPromise]).then(results => {
    const questionMeta = results[0].val()

    // Check if there are any device tokens.
    if (!questionMeta) return console.log('questionMeta is empty');
    if (!questionMeta.Uid) return console.log('Uid is empty');
    const Uid = questionMeta.Uid

    if(Uid === comment.Uid) return console.log('commented on their own question')


    // Listing all tokens.
	const tokenPromise = admin.database().ref(`/users/private/${Uid}/token`).once('value');

    // Send notifications to all tokens.
	return Promise.all([tokenPromise]).then(results => {
		const token = results[0].val()

		if(!token){
			console.log("empty token")
			return
		}


	    // Notification details.
	    const payload = {
	      notification: {
	        title: '質問にコメントがつきました！',
	        body: `${comment.body}`,
	        icon: '/images/manifest/icon-192x192.png',
	        click_action: `https://choice-share.com/question/${questionId}`
	      }
	    };

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
	      });
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


