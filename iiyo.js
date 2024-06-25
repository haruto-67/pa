// データ
const value_Hz_data = ["100Hz","250Hz","400Hz","600Hz","1.2KHz","2.4KHz","4.8KHz","10KHz","ないかも?"];
const value_Hz = [100,250,400,600,1200,2400,4800,10000]
const Takusuu = 4
let kaitou = Math.floor( Math.random() * Takusuu );//乱数生成→kaitou

let toneValue
let difficultyValue
let frequencyValue

function start() {        //スタートボタン押したら問題に飛ぶ

    let tone = document.getElementsByName("tone");
    toneValue = '';
    for (let i = 0; i < tone.length; i++){
        if (tone.item(i).checked){
            toneValue = tone.item(i).value;
        }
    }

    let difficulty = document.getElementsByName("difficulty");
    difficultyValue = '';
    for (let i = 0; i < difficulty.length; i++){
        if (difficulty.item(i).checked){
            difficultyValue = difficulty.item(i).value;
        }
    }

    let frequency = document.getElementsByName("frequency");
    frequencyValue = [];
    for (let i = 0; i < frequency.length; i++){
        if (frequency.item(i).checked){
            frequencyValue.push(frequency.item(i).value);
        }
    }
    let parameter = {tone:toneValue,difficulty:difficultyValue,frequency:frequencyValue}
    let url = new URLSearchParams(parameter).toString();
    window.location.href = "mondai1.html?"+url;
    // window.onload=fetchAudioFile;
}

function modoru() {        //戻るボタン押したらホーム画面
        window.location.href = "index.html";
}

function kekka(answer) {
    if (answer == kaitou) {
        window.alert("正解");
    } else window.alert("不正解");
}
let Hz = []
let Hz_data = []
let gain = 10
let q = 3

let query = new URLSearchParams(window.location.search)
if (query != null){
    toneValue = query.get("tone")
    frequencyValue = query.get("frequency")
    difficultyValue = query.get("difficulty")

    frequencyValue = frequencyValue ? frequencyValue.split(',') : [];
    for(let i=0; i<frequencyValue.length;i++){
        if(frequencyValue[i]!="8"){
            Hz.push(Number(value_Hz[frequencyValue[i]]))
            if(difficultyValue == "hard"){
                Hz_data.push(value_Hz_data[frequencyValue[i]]+"+5db")
                Hz_data.push(value_Hz_data[frequencyValue[i]]+"+10db")
                Hz_data.push(value_Hz_data[frequencyValue[i]]+"-5db")
                Hz_data.push(value_Hz_data[frequencyValue[i]]+"-10db")
            }else{
                Hz_data.push(value_Hz_data[frequencyValue[i]])
            }
        }else{
            Hz_data.push(value_Hz_data[frequencyValue[i]])
        }
    }

    console.log(Hz_data)
    console.log(Hz)
}


// 選択肢作成 
let flg = 0;
let sentakushi_No = Array(Hz_data.length)// sentakushi_No = [0,1,2,3,4,5,,,]
sentakushi_No.fill(0)
for(let i=0;i<Hz_data.length;i++) {
    sentakushi_No[i]= sentakushi_No[i]+i}

let sentakushi = Array(Takusuu);// sentakushi = [0,0,0,0](takusuuの個数)
sentakushi.fill(0)

while(flg<Takusuu){// せんたくしNoから一個選び、せんたくしNoから削除→選択肢にいれる
    let random2 = Math.floor( Math.random() * sentakushi_No.length ); //0~7の乱数生成
    sentakushi[flg]=sentakushi_No[random2]
    sentakushi_No.splice(random2,1)
    flg += 1;
}
sentakushi.sort();
// 選択肢を順番に解答欄にいれる
flg = 0
while(flg<Takusuu){
    let t = "m"+flg;
    let inputValue = Hz_data[sentakushi[flg]];
    let button = document.getElementById(t);
    button.value = inputValue;
    flg += 1;
}

// 周波数を確定
let f
if(Hz_data[sentakushi[kaitou]] == "ないかも?"){
    f = sentakushi_No[Math.floor( Math.random() * sentakushi_No.length )]
}else{
    f = sentakushi[kaitou]
}
if(difficultyValue == "hard"){
    gain = f % 4
    if(gain == 0){
        gain = 5
    }else if(gain == 1){
        gain = 10
    }else if(gain == 2){
        gain = -5
    }else if(gain == 3){
        gain = -10
    }
    f = Math.floor(f/4)
}

let frequency = Hz[f]

console.log(Hz_data[sentakushi[kaitou]])
console.log(frequency)
console.log(gain)





// 音を流す
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;
let source;
async function fetchAudioFile() {
    const filePath =toneValue; // 音声ファイルのパスを指定
    try {
        let response = await fetch(filePath);
        let arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    } catch (error) {
        console.error('ファイルの読み込み中にエラーが発生しました:', error);
    }
}
// ページのロード時に音声ファイルを読み込む
window.onload = fetchAudioFile;

function play() {
    if (!audioBuffer) {
        console.error('音声ファイルがまだ読み込まれていません。');
        return;
    }
    stop();
    let filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.gain.value = gain;
    filter.Q.value = q;

    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(filter);
    filter.connect(audioContext.destination);
    source.start();
}
function stop(){
    try{
      source.stop();  
    }catch(error){}
}