const functions = require('firebase-functions');


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