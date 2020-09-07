/** 
 * メインモジュール
 * 
 */
function doPost(e) {
  // 中身の処理は別メソッドで実装
  var replyToken= JSON.parse(e.postData.contents).events[0].replyToken;
  if (typeof replyToken === 'undefined') {
    return;
  }
  var url = 'https://api.line.me/v2/bot/message/reply';
  var channelToken = 'PT7BRbtGKh2u9DimTb3zgK5yQgsLRVw9XxyfbQtNkwxM0ywLimb6yKLt60TuQQx1PZYM0reWvwgMQX61W7PWzuIwm487Cfr5FO6Usg3NrPVTJcPYoMSVDrXuIWnoxIPpuI3wvJROUHIHm+Y6E+bo4gdB04t89/1O/w1cDnyilFU=';

  var input = JSON.parse(e.postData.contents).events[0];
  console.log(JSON.parse(e.postData.contents).events);
  if(input.type == 'message') {
    var inputText = input.message.text;
  } else if(input.type == 'postback') {
    console.log(input.postback.data);
    
  }
  // ＝＝＝＝＝＝ ここから編集可 ＝＝＝＝＝＝＝

  var messages = [];
  
  if(input.type == 'message' && input.message.type == 'text') {
    messages = replyControl(inputText);
  } else if(input.type == 'postback') {
    messages = postbackControl(input.postback.data);
  }
  console.log(messages);
  // ＝＝＝＝＝＝ ここまで編集可 ＝＝＝＝＝＝＝
  
  if(messages.length == 0) {
    console.info('返信設定なし');
    return;
  }
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

/** 
 * ポストバックイベントに対する返信
 * @param inputPostback 入力内容データ
 * @return messages 返信内容オブジェクト
 */
function postbackControl(inputPostback) {
  // 共通
  var message = []; // メッセージオブジェクト
  var messages = []; // メッセージオブジェクト配列
  
  if(inputPostback.match('back')) {
    textMessage = "キャンセル";
    message = setMessage('text', textMessage);
    messages.push(message);  
  } else if(inputPostback.match('正解の文字列')) {
    textMessage = "正解のパターン\n送信メッセージでは文字列・画像・動画で任意の演出が可能";
    message = setMessage('text', textMessage);
    messages.push(message);
  } else {
    textMessage = "不正解のパターン";
    message = setMessage('text', textMessage);
    messages.push(message);
  }
  // ===変更可能部分ここまで===
  return messages;
}

/** 
 * メッセージに対する返信
 * @param inputText 入力内容テキスト
 * @return messages 返信内容オブジェクト
 */
function replyControl(inputText) {
  // 共通
  var message = []; // メッセージオブジェクト
  var messages = []; // メッセージオブジェクト配列
  // テキスト type = 'text'
  var textMessage = '';
  // 画像 type = 'image'
  var imageUrl = '';
  var previewImageUrl = '';
  // 動画 type = 'video'
  var videoUrl = '';
  var previewVideoImageUrl = '';

  // ===変更可能部分ここから===
  
  // テキスト中で改行する場合、改行コード「\n」※ダブルクォーテーションで囲むこと
  if(inputText.match('使い方')) {
    textMessage = "このBOTについて\n・このBOTは本丸の馬が作成しました。";
    message = setMessage('text', textMessage);
    messages.push(message);
    
    // 2件以上に分割した返信内容も可能　配列messagesへメッセージオブジェクト(message)をpushする
    textMessage = "できること\n・「望月」 馬が嘶きます\n・「[ダイス数]d[ダイス種類]」 ダイスが振れます（修正値対応なし）\n・「pic」 画像の返信サンプル 出目祈願\n・「動画」 動画の返信サンプル\n「YorN」 はい/いいえ形式のテンプレートを表示します";
    message = setMessage('text', textMessage);
    messages.push(message);
    
    textMessage = "・『パスワード\n{任意の文字列}』と入力すると、入力確認のテンプレートを使用できます。\n謎解きのパスワード入力に使えるかと。\n任意の文字列に『正解の文字列』と入れた時とそれ以外とで分岐";
    message = setMessage('text', textMessage);
    messages.push(message);
  } 
  // メッセージを送信する場合
  else if(inputText.match('望月')) {
    textMessage = 'ﾋﾋｰﾝ';
    message = setMessage('text', textMessage);
    messages.push(message);
  }
  // 画像を送信する場合、type = 'image'に加えて画像のURL・プレビュー画像のURLを設定する　
  // 参考：https://developers.line.biz/ja/reference/messaging-api/#image-message
  else if(inputText.match('pic')) {
    // Driveの画像を設定する場合のURL：https://drive.google.com/uc?export=view&id={id}
    imageUrl = 'https://drive.google.com/uc?export=view&id=15UIJsRWH9GdCUsECV1GgnX-0Bw7gq_ap';
    previewImageUrl = 'https://drive.google.com/uc?export=view&id=1F3f569fMoOgyE3enKbdNyr3-5Eb3CtR9';
    message = setMessage('image', imageUrl, previewImageUrl);
    messages.push(message);
  }
  // 動画を送信する場合、type = 'video'に加えて動画のURL・プレビュー画像のURLを設定する
  else if(inputText.match('動画')) {
    videoUrl = 'https://drive.google.com/uc?export=view&id=1X5zxycuG6xXzFW535kSlpdg0KTOszQQx';
    previewVideoImageUrl = 'https://drive.google.com/uc?export=view&id=1f5ecwFmj5s1A0-saER0T5ipUZ2d5chBl';
    message = setMessage('video', videoUrl, previewVideoImageUrl);
    messages.push(message);
  }
  // はい/いいえ(ポストバックイベント、メッセージ)
  else if(inputText.match('YorN')) {
  
    message = setMessage('confirm1', '確認用テキスト\n選択するとメッセージが送信されます', '「はい」を押した場合', '「いいえ」を押した場合');
    messages.push(message);
  }
  // 入力確認付き(ポストバックイベント)
  else if(inputText.match(/パスワード\n/)) {
    var inputPassword = inputText.replace(/パスワード\n/, '');
    var templateText = 'あなたが入力したパスワードは「' + inputPassword + '」です。\n間違いはありませんか？'
    message = setMessage('confirm2', templateText, 'はい', inputPassword,'いいえ', 'back');
    messages.push(message);
  }
  
  // ダイスボット（別メソッド）
  var diceStr = inputText.substr(0,8);
  if(diceStr.match(/^[0-9]/) || diceStr.match(/D/i)) {
    textMessage = diceBot(diceStr);
    message = setMessage('text', textMessage);
    messages.push(message);
  }

  // ===変更可能部分ここまで===

  return messages;
}

/** 
 * メッセージオブジェクト生成
 * @param type 区分　※必須
 * @param p1 パラメータ1
 * @param p2 パラメータ2
 * @param p3 パラメータ3
 * @param p4 パラメータ4
 * @param p5 パラメータ5
 * @return message メッセージオブジェクト（1件）
 */
function setMessage(type, p1, p2, p3, p4, p5) {
  var message;
  if(type == 'text') {
    message = {
      'type': type,
      'text': p1,
    };
  } else if(type == 'image') {
    message = {
      'type': type,
      'originalContentUrl': p1,
      'previewImageUrl': p2,
    };
  } else if(type == 'video') {
    message = {
      'type': type,
      'originalContentUrl': p1,
      'previewImageUrl': p2,
      'trackingId': '',
    };
  } else if(type == 'confirm1') {
    // アクションテンプレート（メッセージ）
    message = {
      "type": "template",
      "altText": "this is a confirm message template",
      "template": {
        "type": "confirm",
        "text": p1,
        "actions": [
          {
            "type": "message",
            "label": "はい",
            "text": p2
          },
          {
            "type": "message",
            "label": "いいえ",
            "text": p3
          }
        ]
      }
    }
  } else if(type == 'confirm2') {
    // アクションテンプレート（ポストバックアクション）
    message = {
      "type": "template",
      "altText": "this is a confirm postback template",
      "template": {
        "type": "confirm",
        "text": p1,
        "actions": [
          {
            "type":"postback",
            "label":"はい",
            "displayText":p2,
            "data":p3
          },
          {
            "type":"postback",
            "label":"いいえ",
            "displayText":p4,
            "data":p5
          }
        ]
      }
    }
  }
  return message;
}


/** 
 * ダイスボット
 * @param diceStr コマンドテキスト（最大8文字）
 * @return replyMessage 結果テキスト
 */
function diceBot(diceStr) {
  var num = 0; // ダイスの個数
  var nSided = 0; // ｎ面ダイス

  if(diceStr.match(/d4/i)) {
    // 4面ダイス
    num = diceStr.substr(0, diceStr.search(/d4/i));
    nSided = 4;
  } else if (diceStr.match(/d8/i)) {
    // 8面ダイス
    num = diceStr.substr(0, diceStr.search(/d8/i));
    nSided = 8;
  } else if (diceStr.match(/d10/i)) {
    // 10面ダイス
    num = diceStr.substr(0, diceStr.search(/d10/i));
    if (diceStr.match(/d100/i)) {
      // 100面ダイス
      nSided = 100;
    } else {
      nSided = 10;
    }
  } else if (diceStr.match(/d12/i)) {
    // 12面ダイス
    num = diceStr.substr(0, diceStr.search(/d12/i));
    nSided = 12;
  } else if (diceStr.match(/d20/i)) {
    // 20面ダイス
    num = diceStr.substr(0, diceStr.search(/d20/i));
    nSided = 20;
  } else {
    var tmp = diceStr.slice(diceStr.search(/d/i)+1, diceStr.search(/d/i)+2);
    if(!tmp || tmp.match(/[^0-9]/) || diceStr.match(/d6/i)) {
      // 6面ダイス(指定がない場合でも振れる)
      num = diceStr.substr(0, diceStr.search(/d/i));
      nSided = 6;
      if(diceStr.match(/d66/i)) {
        // D66の場合はダイス2個
        num = 2;
      }
    } else {
      return '';
    }
  }
  if(!num) {
    num = 1;
  }
  if(!isNaN(num)) {
    var diceResult;
    var resultArray = [];
    var diceResults = '[';
    var roll = 0;
    // ダイスの個数分繰り返し
    for(var i = 0; i < num; i++) {
      diceResult = Math.floor(Math.random() * nSided) + 1;
      // 出目を配列に格納
      resultArray.push(diceResult);
      roll += diceResult;
    }
    
    if(diceStr.match(/d66/i)) {
      // D66なら並べ替え
      resultArray = resultArray.sort();
      roll = resultArray[0].toString() + resultArray[1].toString();
    }
    diceResults += resultArray.toString();
    diceResults += '] = ';
  } 

  replyMessage = diceResults + roll;
  return replyMessage;
}
