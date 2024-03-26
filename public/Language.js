import {GetQuiz, UpdateHint} from "/quiz/Quiz.js";

/* ポップオーバー表示用 */
$('[data-toggle="popover"]').popover()

const SYMBOL_CORRECT = "○";
const SYMBOL_WRONG = "×";
const SYMBOL_NONE = "－";
const ESCAPE_NEXTLINE = "@";
const ESCAPE_BACKSPACE = "1";
const VALUE_BACKSPACE = "Backspace";
const LABEL_BACKSPACE = "BS";
const ESCAPE_ENTER = "2";
const LABEL_ENTER = "ENTER";
const VALUE_ENTER = "Enter";
const ESCAPE_OR = "3";
const ESCAPE_RUS = "4";
const LABEL_RUS = "RUS";
const VALUE_RUS = "RUS";
const ESCAPE_ENG = "5";
const LABEL_ENG = "ENG";
const VALUE_ENG = "ENG";
const VALUE_ESC = "Escape";
const ESCAPE_MACRON = "̄";
const CLASS_DOUBLE_WIDE_KEY = "double";
const KEY_CLASS = "AKey";

$("#StartButton").click(START);
$("#ExitButton").click(EXIT);
$("#RetryButton").click( Retry );
$("#RetryMissedButton").click( RetryMissed );
$("#HomeButton").click( EXIT );

var CurrentKeyLang;
var Quiz;
var Quiz_Uncut;
var CurrentIndex;
var Progress;

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■問題一覧
//チェックボックスをクリック
$('input[name="Options"]').click( function(){
    if( $(this).prop('checked') )
    {
        console.log( "active" )
        $(this).parent().addClass("active");
        AddSelectionName($(this).parent().text());
    }else{
        console.log( "deactive" )
        $(this).parent().removeClass("active");
        SubSelectionName($(this).parent().text());
    }
} );
//リセットボタン
$("#ResetButton").click( ()=>{
    $('input[name="Options"]').prop("checked",false);
    $('input[name="Options"]').parent().removeClass("active");
    SubSelectionName();
} );

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■選択している問題
var SelectionSet = new Set();
function SubSelectionName(text = null){
    if( text == null ){
        SelectionSet.clear();
    }else{
        SelectionSet.delete(text);
    }
    UpdateSelectionNames();
}
function AddSelectionName(text){
    SelectionSet.add(text);
    UpdateSelectionNames();
}
function UpdateSelectionNames(){
    var phText = "";
    for( let text of SelectionSet ){
        phText = phText.concat(text);
    }
    if( phText == "" )
        phText = "Nothing selected";
    $("#SelectedListsNames").prop("placeholder",phText);
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■開始
function START(){
    console.log("STATE:START");
    $("html,body").animate({scrollTop:$('html').offset().top});
    InitQuiz();
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■やめる
function EXIT(){
    $("#ExitWrapper").hide();
    $("#QuizWrapper").hide();
    $("#InterfaceWrapper").hide();
    $("#Result").hide();
    $("#SettingWrapper").show();
    $('[data-toggle="popover"]').popover('hide');
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■次の問題
function NEXT(){
    //次の問題がある場合、インデックスを進めクイズを表示
    if( HasNext() )
    {
        CurrentIndex++;
        ShowQuiz();
    }else{
        //show Result
        $("#QuizWrapper").hide();
        $("#InterfaceWrapper").hide();
        $("#Result").show();
        
        //show WrongAnswers
        $("#WrongAnswers").empty();
        var numCorrect = 0;
        for(let i=0;i<Progress.length;i++)
        {
            if( Progress[i] == SYMBOL_WRONG )
            {
                let addElement = "<div class=\"WrongAnswer alert col-5 m-2 BC-DANGER\" role=\"alert\"><p>"+ Quiz[i].Question +"</p><hr><p class=\"mb-0\">"+ Quiz[i].Answer +"</p></div>";
                $("#WrongAnswers").append(addElement);
            }else{
                let addElement = "<div class=\"WrongAnswer alert col-5 m-2 BC-SUCCESS\" role=\"alert\"><p>"+ Quiz[i].Question +"</p><hr><p class=\"mb-0\">"+ Quiz[i].Answer +"</p></div>";
                $("#WrongAnswers").append(addElement);
                numCorrect++
            }
        }
        if( Progress.length == numCorrect )
        {
            $("#CorrectRatio").text( "Perfect!".toUpperCase() );
        }else{
            $("#CorrectRatio").text( numCorrect +" / "+ Progress.length );
        }
    }
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■キー入力
$("html").keydown( (event)=>{
    console.log(event.key);
    KEYPRESSED( event, event.key );
} );

function KEYPRESSED(event,char){
    console.log(event.keyCode);
    
    if( $("#QuizWrapper").css("display") != "none" )
    {    
        switch(char){
            case VALUE_BACKSPACE:
                SOUNDS.type.play();
                let text = $("#Answer").text();
                if( text.length <= 0 ){
                    return;
                }
                $("#Answer").text( text.slice(0,text.length-1) );
                break;
            case VALUE_ENTER:
                if( $("#NextButton").css("display") != "none" )
                {
                    //Nextボタンが表示されている
                    SOUNDS.type.play();
                    $("#NextButton").trigger("click");
                }else{
                    //ボタンが表示されない->回答チェック
                    if( CheckAnswer() ){
                        $("#Answer").text("");
                    }
                }
                break;
            case VALUE_ENG:
                SOUNDS.type.play();
                InitInterface(VALUE_ENG);
                break;
            case VALUE_RUS:
                SOUNDS.type.play();
                InitInterface(VALUE_RUS);
                break;
            case VALUE_ESC:
                EXIT();
                break;
            default:
                var addChar = "";
                switch(CurrentKeyLang){
                    case VALUE_RUS:
                        //ロシア語入力
                        if(isKeydown(event)){
                            //有効キーの場合、変換する
                            if((65 <= event.keyCode && event.keyCode <= 90) ||  char == "\"" || char == "\'" || char == " ")
                                addChar = ConvertToRUS( ToLowerCase(char), event.shiftKey, event.ctrlKey, event.altKey );
                        }else{
                            //ソフトキー入力の場合そのまま帰す
                            addChar = ToLowerCase(char);
                        }
                        break;
                    default:
                        //その他(英語入力)
                        if(isKeydown(event)){
                            //有効キーの場合、変換する
                            if((65 <= event.keyCode && event.keyCode <= 90) ||  char == "\"" || char == "\'" || char == " ")
                                addChar = AddMacron(ToLowerCase(char), event.shiftKey);
                        }else{
                            //ソフトキー入力の場合そのまま帰す
                            addChar = ToLowerCase(char);
                        }
                        break;
                }
                SOUNDS.type.play();
                $("#Answer").text( $("#Answer").text()+addChar );
                break;
        }
    }else if( $("#SettingWrapper").css("display") != "none" && char == VALUE_ENTER ){
        $("#StartButton").trigger("click");
    }else if( $("#Result").css("display") != "none" && char == VALUE_ENTER ){
        $("#HomeButton").trigger("click");
    }
}
//キーボードイベントであるか
function isKeydown(event){
    return event.keyCode != undefined;
}
//shiftが押されている場合、aiueoにマクロンを追加
function AddMacron(char, shift){
    const ConvertMap = new Map([ ["a","ā"], ["i","ī"], ["u","ū"], ["e","ē"], ["o","ō"] ]);
    if( shift && ConvertMap.has(char) )
    {
        return ConvertMap.get(char);
    }else{
        return char;
    }
}
//アルファベットをロシア語へ変換
function ConvertToRUS( char, shift, ctrl, alt ){
    var newChar = "";
    const ConvertMap = new Map([ ["a","а"], ["i","и"], ["u","у"], ["e","е"], ["o","о"], ["y","ы"], ["k","к"], ["t","т"], ["c","ч"], ["x","х"], ["h","х"], ["n","н"], ["f","ф"], ["m","м"], ["r","р"], ["l","л"], ["g","г"], ["z","з"], ["j","ж"], ["7","ь"], ['2',"ъ"], ["v","в"], ["b","б"],["p","п"], ["d","д"], ["s", "с"] ]);
    const ConvertMapShift = new Map( [["a","я"], ["i","й"], ["u","ю"], ["e","э"], ["o","ё"], ["s","ш"], ["t","ц"], ["'","ь"], ['"',"ъ"] ]);
    const ConvertMapCtrl = new Map([["s","щ"]]);
    
    if( !shift && ConvertMap.has(char) )
    {
        newChar = ConvertMap.get(char);
    }else if(shift){
        if( ConvertMapShift.has(char) )
            newChar = ConvertMapShift.get(char);
        else if( ConvertMap.has(char) )
            newChar = ConvertMap.get(char);
        else
            newChar = char;
    }else if(ctrl){
        if( ConvertMapCtrl.has(char) )
            newChar = ConvertMapCtrl.get(char);
        else if( ConvertMap.has(char) )
            newChar = ConvertMap.get(char);
        else
            newChar = char;
    }else{
        newChar = char;
    }
    return newChar;
}
//特殊記号を取り除く
function RemoveSpecial(str){
    var retStr;
    //記号を除去
    const macron = /̄/g;
    const accent = /́/g;
    retStr = str.replace(accent, "")
    retStr = retStr.replace(macron, "")
    return retStr;
}
//---------------------------------------------------------------キー入力


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■回答チェック
function CheckAnswer( option = $("#Answer").text() ){
    if( Quiz[CurrentIndex].Answer == option ||
        CheckAnswer_Strict() )
    {
        SOUNDS.correct.play();
        $("#Question").text("Correct!").animate({"top": "-=10px"}, 100 ).animate({"top": "+=10px"}, 100 ).animate({"top": "-=10px"}, 100 ).animate({"top": "+=10px"}, 100 );
        $("#Answer").text( Quiz[CurrentIndex].Answer );
        $("#NextButton").show();
        SetProgress(true);
    }else
    {
        SOUNDS.fail.play();
        $("#Question").text( Quiz[CurrentIndex].Answer ).animate({"left": "-=5"}, 50 ).animate({"left": "+=10"}, 100 ).animate({"left": "-=10"}, 50 ).animate({"left": "+=5"}, 50 );;
        $("#NextButton").show();
        SetProgress(false);
    }
    //◆完全一致でないとき、厳密に調査する
    function CheckAnswer_Strict(){
        console.log("checkingStrict...");
        var isCorrect = false;
        //" or "で分割
        var AnswerArr = Quiz[CurrentIndex].Answer.split(" or ");
        for( var aAnswer of AnswerArr )
        {
            //記号を除去
            const macron = /̄/g;
            const accent = /́/g;
            aAnswer = aAnswer.replace(accent, "");
            aAnswer = aAnswer.replace(macron, "");
            aAnswer = aAnswer.replace(/ū/g, "u");
            aAnswer = aAnswer.replace(/ī/g, "i");
            
            //カッコで分割・結合した文字列配列
            var hoge = CheckAnswer_Kakko(aAnswer);
            for( var a of hoge )
            {
                console.log(RemoveSpecial(option) + " : "+ a);
                if( RemoveSpecial(option) == a ){
                    isCorrect = true;
                }
            }
        }
        return isCorrect;
    }
    //◆文字列をカッコで分割する
    function CheckAnswer_Kakko(str){
        var returnArr = [];
        var iS = str.indexOf("(");
        var iE = str.indexOf(")");
        if( iS == -1 ){
            return returnArr.concat(str);;
        }
        
        //カッコで分割
        const kakko = /\(|\)/g;
        var clippedArr = str.split(kakko);
        
        //splitでできた空要素を削除
        if( iS == 0 )
            clippedArr.splice(0,1);
        if( iE == str.length-1 )
            clippedArr.splice(-1,1);
        
        if( clippedArr[1] == undefined )
        {
            //要素が一つしかない場合、そのまま帰す
            returnArr = returnArr.concat(clippedArr[0]);
        }else
        {
            switch( iS ){
                case 0:
                    //カッコが先頭にある
                    returnArr = returnArr.concat(clippedArr[0]+clippedArr[1], clippedArr[1] )
                    break;
                default:
                    returnArr = returnArr.concat(clippedArr[1]+clippedArr[0], clippedArr[1] )
                    break;
            }
        }
        
        return returnArr;
    }
}
//---------------------------------------------------------------回答チェック

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■クイズ初期化
function Retry(){
    InitQuiz( false );
}
function RetryMissed(){
    InitQuiz( true );
}
const DEC_FIRST = true;
const WORD_FIRST = false;
function InitQuiz( RETRY_MISSED = false ){
    console.log(RETRY_MISSED);
    CurrentIndex = 0;
    $("#SettingWrapper").hide();
    $("#Result").hide();
    $("#ExitWrapper").show();
    $("#QuizWrapper").show();
    $("#InterfaceWrapper").show();
    InitInterface();
    
    //Generate Quiz
    if( !RETRY_MISSED )
    {
        Quiz = [];
        //チェックされた単語の数だけループする
        for(let i = 0; i < document.Setting.Options.length; i++)
        {
            if( document.Setting.Options[i].checked == true )
            {
                var decFirst = ( document.Setting.Type.value != "QWordSelecting" ? DEC_FIRST : WORD_FIRST );
                Quiz = Quiz.concat(GetQuiz(document.Setting.Options[i].value,decFirst));
            }
        }
    }else{
        //間違えた問題でロード
        var Missed = [];
        for( let i = 0; i < Progress.length; i++ ){
            switch(Progress[i]){
                case SYMBOL_WRONG:
                    Missed = Missed.concat( Quiz[i] );
                    break;
            }
        }
        Quiz = [...Missed];
        //無かったら終了
        if( Quiz.length <= 0 )
            EXIT();
    }
    
    //チェックされてない場合戻る
    if( Quiz.length == 0 )
        EXIT();
    
    //回答をシャッフル
    if( document.Setting.Order.value == "Random" ){
        shuffleArray(Quiz);
    }
    
    //回答をクリップ
    if( !RETRY_MISSED )
    {
        Quiz_Uncut = [...Quiz];
        if( $('input[name="QuizNums"]').val() != 0 )
            Quiz = Quiz.slice(0, $('input[name="QuizNums"]').val());
    }
    
    //init Progress
    Progress = "";
    for( let i = 0; i < Quiz.length; i++ )
    {
        Progress = Progress.concat(SYMBOL_NONE);
    }
    updateProgress();
    
    //次へボタンを初期化
    $("#NextButton").off();
    $("#NextButton").click(NEXT);
    
    console.log("InitQuiz");
    console.log(Quiz);
    
    //show Quiz
    ShowQuiz();
}
//---------------------------------------------------------------クイズ初期化

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■クイズ表示
function ShowQuiz(){
    //show Interface
    switch(document.Setting.Type.value)
    {
        case "AWordTyping":
            if( IsRus() && CurrentKeyLang != VALUE_RUS)
            {
                InitInterface(VALUE_RUS);
            }else if( !IsRus() && CurrentKeyLang != VALUE_ENG)
            {
                InitInterface(VALUE_ENG);
            }
            $("#Keyboard").show();
            $("#Option").hide();
            //Init Answer
            var baseAns = Quiz[CurrentIndex].Base;
            if( baseAns != undefined && $("#FillRoot").prop("checked") == true){
                $("#Answer").text(baseAns);
            }else{
                $("#Answer").text("");
            }
            break;
        case "QWordSelecting":
        case "AWordSelecting":
            UpdateSelections();
            $("#Keyboard").hide();
            $("#Option").show();
            //Init Answer
            $("#Answer").text("");
            break;
    }
        //hide NextButton
    $("#NextButton").hide();
    //Show Question
    $("#Question").text( Quiz[CurrentIndex].Question );
    //update Hint
    UpdateHint(Quiz[CurrentIndex].Hint);
}
//---------------------------------------------------------------クイズ表示

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■進捗
function SetProgress(correct)
{
    let char;
    if( correct )
        char = SYMBOL_CORRECT;
        else
        char = SYMBOL_WRONG;
    Progress = Progress.slice(0,CurrentIndex) + char + Progress.slice(CurrentIndex+1);
    updateProgress();
}
function updateProgress(){
    var newHtml = "";
    for( let c of Progress ){
        let addClass;
        switch(c){
            case SYMBOL_CORRECT:
                addClass = "T-SUCCESS";
                break;
            case SYMBOL_WRONG:
                addClass = "T-DANGER";
                break;
            default:
                addClass = "T-COMMENT";
                break;
        }
        newHtml += '<span class="'+addClass+'">'+c+'</span>';
    }
    $("#Progress").text("").append( newHtml );
}
//---------------------------------------------------------------進捗

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■インターフェースを初期化
function InitInterface( locale = VALUE_ENG ){
    switch(document.Setting.Type.value)
    {
        case "AWordTyping":
            InitKeyboard();
            break;
        case "QWordSelecting":
        case "AWordSelecting":
            break;
    }
    
    function InitKeyboard()
    {
        $("#Keyboard").text("");
        $("#Keyboard").append('<div id="KeyboardLine0" class="d-flex"></div>');
        $("#Keyboard").append('<div id="KeyboardLine1"></div>');
        $("#Keyboard").append('<div id="KeyboardLine2"></div>');
        $("#Keyboard").append('<div id="KeyboardLine3"></div>');
        
        var keys;
        const RUS_KEYS = "Ё-,.'!?"+ESCAPE_ENG+ESCAPE_BACKSPACE+ESCAPE_ENTER+ESCAPE_NEXTLINE+"ЙЦУКЕНГШЩЗХЪ"+ESCAPE_NEXTLINE+"ФЫВАПРОЛДЖЭ"+ESCAPE_NEXTLINE+"ЯЧСМИТЬБЮ ";
        const ENG_KEYS = "-,.'!?"+ESCAPE_MACRON+ESCAPE_RUS+ESCAPE_BACKSPACE+ESCAPE_ENTER+ESCAPE_NEXTLINE+"QWERTYUIOP"+ESCAPE_NEXTLINE+"ASDFGHJKL"+ESCAPE_NEXTLINE+"ZXCVBNM ";
        
        switch(locale)
        {
            case VALUE_RUS:
                CurrentKeyLang = VALUE_RUS;
                keys = RUS_KEYS;
                break;
            default:
                CurrentKeyLang = VALUE_ENG;
                keys = ENG_KEYS;
                break;
        }
        
        for(let i = 0, j = 0; i < keys.length; i++){
            let char = keys.charAt(i);
            let value = char;
            let addClass = KEY_CLASS;
            switch(char){
                case ESCAPE_NEXTLINE:
                    j++;
                    continue;
                case ESCAPE_ENG:
                    char = LABEL_ENG;
                    value = VALUE_ENG;
                    addClass += " "+CLASS_DOUBLE_WIDE_KEY;
                    break;
                case ESCAPE_RUS:
                    char = LABEL_RUS;
                    value = VALUE_RUS;
                    addClass += " "+CLASS_DOUBLE_WIDE_KEY;
                    break;
                case ESCAPE_OR:
                    char ="or";
                    value = char;
                    break;
                case ESCAPE_BACKSPACE:
                    char = LABEL_BACKSPACE;
                    value = VALUE_BACKSPACE;
                    break;
                case ESCAPE_ENTER:
                    char = LABEL_ENTER;
                    value = VALUE_ENTER;
                    addClass += " double";
                    break;
                case ESCAPE_MACRON:
                    char = ESCAPE_MACRON;
                    value = ESCAPE_MACRON;
                    break;
            }
            $("#KeyboardLine"+j).append("<div class=\""+addClass+"\" onclick=\"$('html').trigger('KEYPRESSED',['"+value+"']);\">"+char+"</div>");
        }
            
        $("html").off("KEYPRESSED");
        $("html").on("KEYPRESSED",KEYPRESSED);
    }
}

function IsRus(){
    const regRUS = /RUS/g;
    return Quiz[CurrentIndex].Hint.search(regRUS) != -1;
}

function UpdateSelections(){
    
    var copy = [...Quiz_Uncut];
    
    //同一回答を取り除く
    for(let i = 0; i < copy.length; i++ )
    {
        
        if( copy[i].Question == Quiz[CurrentIndex].Question || copy[i].Answer == Quiz[CurrentIndex].Answer)
        {
            copy.splice(i,1);
            i--;
        }
    }
    
    //回答をシャッフル
    shuffleArray(copy);
    var newOption = [Quiz[CurrentIndex].Answer, copy[0].Answer, copy[1].Answer, copy[2].Answer];
    shuffleArray(newOption);
    console.log(newOption);
    
    for(let i =0; i<newOption.length; i++)
    {
        setOptions(i,newOption[i]);
    }
    
    function setOptions(index,txt){
        $("#Option"+index).text( txt );
        $("#Option"+index).off();
        $("#Option"+index).click( ()=>{ 
            if( $("#NextButton").css("display") == "none" )
            {
                //次へボタンが表示されてない場合、回答をチェック
                CheckAnswer(txt);
            }else{
                //次へボタンが表示されている場合、次へボタンと同じ動作をする
                $("#NextButton").trigger("click");
            }
        } );
    }
}

function ToLowerCase(key){
    return key.toLowerCase();
}

///////////////////////////////////////////////////////////////////////////////次の問題があるか
function HasNext(){
    if( CurrentIndex +1 < Quiz.length ){
        return true;
    }else{
        return false;
    }
}

///////////////////////////////////////////////////////////////////////////////配列をシャッフル
//ローカル配列では動作しないので注意
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//////////////////////////////////////////////////////////////////サウンド
const SOUNDS = {
	correct: new Howl({src:['sound/bubbles.mp3']}),
	fail: new Howl({src:['sound/confetti.mp3']}),
	type: new Howl({src:['sound/wipe.mp3']}) ,
	miss: new Howl({src:['sound/piston-1.mp3']}) 
};