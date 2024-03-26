const ESCAPE_NEXTLINE = "@";
const ESCAPE_BACKSPACE = "1";
const VALUE_BACKSPACE = "Backspace";
const LABEL_BACKSPACE = "BS";
const ESCAPE_ENTER = "2";
const LABEL_ENTER = "ENTER";
const VALUE_ENTER = "Enter";
const VALUE_ESC = "Escape";
const CLASS_DOUBLE_WIDE_KEY = "double";
const KEY_CLASS = "AKey";
const VALUE_RUS = "RUS";
const VALUE_ENG = "ENG";
const VALUE_GER = "GERMAN";
const VALUE_CHN = "CHINESE";

const ESCAPE_GER_S = "5";
const VALUE_GER_S = "ß";
const ESCAPE_GER_U = "6";
const VALUE_GER_U = "ü";
const ESCAPE_GER_O = "7";
const VALUE_GER_O = "ö";
const ESCAPE_GER_A = "8";
const VALUE_GER_A = "ä";
var CurrentKeyboardLang;
var PreviousKeyboardLang;

const WRAPPER_KEYBOARD = "#KeyboardWrapper";

$("#StartButton").click(START);
$("#ExitButton").click(EXIT);

var CurrentIndex;
var WordToType = "das HogehogeFoobar";
var WordsToType;

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■タイマー
var TimerEvent;
var GlobalTimeLimit;
var LocalTimeLimit;
var Time_Previous;
var Time_Current;
var FreezeLocalTimer = false;
function InitTimer(){
    GlobalTimeLimit = 120*1000;
    TimerEvent = setInterval(UpdateTimers,50);
    Time_Previous = new Date().getTime();
}
function UpdateTimers(){
    Time_Current = new Date().getTime();
    var delta = Time_Current - Time_Previous;
    UpdateGlobalTimer(delta);
    UpdateLocalTimer(delta);
    Time_Previous = new Date().getTime();
}
function UpdateGlobalTimer(delta){
    GlobalTimeLimit -= delta;
    $("#GLOBAL_TIMER").text(Math.ceil(GlobalTimeLimit/1000));
}
function DeinitTimer(){
    clearInterval(TimerEvent);
}
function InitLocalTimer(){
    LocalTimeLimit = 10*1000;
}
function UnfreezeTimer(){
    FreezeLocalTimer = false;
}
function FreezeTimer(){
    FreezeLocalTimer = true;
}
function UpdateLocalTimer(delta){
    if(FreezeLocalTimer)
        return;
    LocalTimeLimit -= delta;
    $("#ProgressBar").attr("value",LocalTimeLimit);
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■開始
function START(){
    console.log("STATE:START");
    $("#SettingWrapper").hide();
    $("#QuizWrapper").show();
    $(WRAPPER_KEYBOARD).show();
    $("html,body").animate({scrollTop:$('html').offset().top});
    InitQuiz();
    InitTimer();
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■やめる
function EXIT(){
    $("#SettingWrapper").show();
    $("#QuizWrapper").hide();
    $(WRAPPER_KEYBOARD).hide();
    DeinitTimer();
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■次の問題
function NEXT(){
}

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■キー入力
$("html").keydown( (event)=>{
    KEYPRESSED( event, event.key );
} );

function KEYPRESSED(event,char){
    console.log("event.keyCode:"+event.keyCode+"  event.key:"+event.key+"  softKey:"+char);
    
    switch(event.key)
    {
        case "Shift":
        case "Control":
        case "Alt":
            return;
        default:
            break;
    }
    
    var TargetChar = DeSanitize($("#WordToType-"+CurrentIndex).text());
    var InputChar = DeSanitize(char,event.shiftKey,event.ctrlKey);
    console.log(""+TargetChar+InputChar);
    if( CompareChar(TargetChar,InputChar) ){
        //正解キー
        $("#WordToType-"+CurrentIndex).removeClass("NOT-TYPED WRONG CURRENT").addClass("TYPED");
        CurrentIndex++;
        
        if( WordToType.length <= CurrentIndex ){
            //次の問題
            FreezeTimer();
            $("#TYPE_WORD").animate({"right": "+=400px", "opacity": 0}, 250).animate({"right":"-=400px"},0,ShowQuiz);   
        }else{
            //中国語の場合、スペースとハイフンは飛ばす
            if(CurrentKeyboardLang == VALUE_CHN ){
                while( $("#WordToType-"+CurrentIndex).text() == "-" ||
                       $("#WordToType-"+CurrentIndex).text() == " " ||
                       $("#WordToType-"+CurrentIndex).text() == "'" ||
                       $("#WordToType-"+CurrentIndex).text() == "‘" )
                {
                    $("#WordToType-"+CurrentIndex).removeClass("NOT-TYPED WRONG CURRENT").addClass("TYPED");
                    CurrentIndex++;
                }
            }else{
                while( $("#WordToType-"+CurrentIndex).text() == "́"||
                       $("#WordToType-"+CurrentIndex).text() == " " )
                {
                    $("#WordToType-"+CurrentIndex).removeClass("NOT-TYPED WRONG CURRENT").addClass("TYPED");
                    CurrentIndex++;
                }
            }
            $("#WordToType-"+CurrentIndex).removeClass("NOT-TYPED").addClass("CURRENT");
        }
    }else{
        $("#WordToType-"+CurrentIndex).addClass("WRONG");
    }
    
}

function CompareChar(target,input){
    const compareMap = new Map([
        ["ß","s"],["ü","u"],["ö","o"],["ä","a"],
        ["à","a"],["ǎ","a"],["á","a"],["ā","a"],
        ["ì","i"],["ǐ","i"],["í","i"],["ī","i"],
        ["ù","u"],["ǔ","u"],["ú","u"],["ū","u"],
        ["è","e"],["é","e"],["ē","e"],["ě","e"],["ê","e"], 
        ["ò","o"],["ǒ","o"],["ó","o"],["ō","o"],
        ["ü","u"],["ǚ","u"]
    ]);
    if( compareMap.has(target) ){
        target = compareMap.get(target);
    }
    console.log(""+target+input+(target==input));
    return target == input;
}
//キーボードイベントであるか
function isKeydown(event){
    return event.keyCode != undefined;
}
//アルファベットをロシア語へ変換
function ConvertToRUS( char, shift = false, ctrl = false ){
    var newChar = "";
    const ConvertMap = new Map([ ["a","а"], ["i","и"], ["u","у"], ["e","е"], ["o","о"], ["y","ы"], ["k","к"], ["t","т"], ["c","ч"], ["x","х"], ["h","х"], ["n","н"], ["f","ф"], ["m","м"], ["r","р"], ["l","л"], ["g","г"], ["z","з"], ["j","ж"], ["7","ь"], ['2',"ъ"], ["v","в"], ["b","б"],["p","п"], ["d","д"], ["s", "с"] ]);
    const ConvertMapShift = new Map( [["a","я"], ["i","й"], ["u","ю"], ["e","э"], ["o","ё"], ["s","ш"], ["t","ц"], ["'","ь"], ['"',"ъ"] ]);
    const ConvertMapCtrl = new Map([["s","щ"],["u","ы"]]);
    
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

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■クイズ初期化
function InitQuiz(){
    WordsToType = [];
    $('input[name="Selection"]').each( function (){
        if( $(this).prop("checked") ){
            var link = $(this).prop("value").split("-");
            console.log( link );
            $.ajax({
                url:"/TYPE/words/"+link[0]+"/"+link[1]+".json", 
                dataType : 'json',
                async : false,
                success : function(data) {
                    for( let list of data.list )
                    {
                        WordsToType = WordsToType.concat( { "WORD":list.word, "DESC":list.desc, "LANG":data.lang, "ALT":(list.alt==undefined?undefined:list.alt) } );
                    }
                }
            });
        }
    } );
    
    
    //console.log(WordsToType);
    
    ShowQuiz();
}
//---------------------------------------------------------------クイズ初期化

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■クイズ表示
function ShowQuiz(){
    InitLocalTimer();
    CurrentIndex = 0;
    $("#TYPE_TYPE").text("");
    $("#TYPE_WRONG").text("");
    var html = "";
    var List = GetRandomQuiz();
    WordToType = List.WORD;
    for( let i = 0; i < WordToType.length; i++){
        var addClass = "NOT-TYPED";
        if( i == 0 )
            addClass = "CURRENT";
        
        html += '<span class="'+addClass+'" id="WordToType-'+i+'">'+WordToType[i]+'</span>';
    }
    InitInterface(List.LANG);
    $("#TYPE_DESC").text(List.DESC);
    $("#TYPE_WORD").html(html).animate({"right": "-=400px", "opacity": 0}, 0 ).animate({"right": "+=400px", "opacity": 1}, 250 , UnfreezeTimer);
    $("#TYPE_ALT").text( (List.ALT==undefined?"":List.ALT) );
}
//---------------------------------------------------------------クイズ表示

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■インターフェースを初期化
function InitInterface( locale = VALUE_ENG ){
    if( locale == CurrentKeyboardLang )
        return;
    $(WRAPPER_KEYBOARD).text("");
    // switch(locale){
    //     case VALUE_GER:
    //         $(WRAPPER_KEYBOARD).append('<p><span class="T-SUCCESS">-</span> -> <span class="T-DANGER">ß</span>  /  <span class="T-SUCCESS">@</span> -> <span class="T-DANGER">ü</span>  /  <span class="T-SUCCESS">;</span> -> <span class="T-DANGER">ö</span>  /  <span class="T-SUCCESS">:</span> -> <span class="T-DANGER">ä</span></p>');
    //         break;
    // }
    $(WRAPPER_KEYBOARD).append('<div id="KeyboardLine0" class="d-flex"></div>');
    $(WRAPPER_KEYBOARD).append('<div id="KeyboardLine1"></div>');
    $(WRAPPER_KEYBOARD).append('<div id="KeyboardLine2"></div>');
    $(WRAPPER_KEYBOARD).append('<div id="KeyboardLine3"></div>');
    
    var keys;
    const RUS_KEYS = "Ё-,.'!?"+ESCAPE_ENTER+ESCAPE_NEXTLINE+"ЙЦУКЕНГШЩЗХЪ"+ESCAPE_NEXTLINE+"ФЫВАПРОЛДЖЭ"+ESCAPE_NEXTLINE+"ЯЧСМИТЬБЮ ";
    const ENG_KEYS = "-,.'!?"+ESCAPE_ENTER+ESCAPE_NEXTLINE+"QWERTYUIOP"+ESCAPE_NEXTLINE+"ASDFGHJKL"+ESCAPE_NEXTLINE+"ZXCVBNM ";
    const GER_KEYS = "-,.'!?"+ESCAPE_GER_S+ESCAPE_ENTER+ESCAPE_NEXTLINE+"QWERTYUIOP"+ESCAPE_GER_U+" "+ESCAPE_NEXTLINE+"ASDFGHJKL"+ESCAPE_GER_O+ESCAPE_GER_A+ESCAPE_NEXTLINE+"ZXCVBNM   ";
    
    CurrentKeyboardLang = locale;
    
    switch(locale)
    {
        case VALUE_RUS:
            keys = RUS_KEYS;
            break;
        case VALUE_GER:
            keys = GER_KEYS;
            break;
        default:
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
            case ESCAPE_BACKSPACE:
                char = LABEL_BACKSPACE;
                value = VALUE_BACKSPACE;
                break;
            case ESCAPE_ENTER:
                char = LABEL_ENTER;
                value = VALUE_ENTER;
                addClass += " double";
                break;
            case ESCAPE_GER_S:
                char = VALUE_GER_S;
                value = VALUE_GER_S;
                break;
            case ESCAPE_GER_A:
                char = VALUE_GER_A;
                value = VALUE_GER_A;
                break;
            case ESCAPE_GER_U:
                char = VALUE_GER_U;
                value = VALUE_GER_U;
                break;
            case ESCAPE_GER_O:
                char = VALUE_GER_O;
                value = VALUE_GER_O;
                break;
        }
        $("#KeyboardLine"+j).append("<div class=\""+addClass+"\" onclick=\"$('html').trigger('KEYPRESSED',['"+value+"']);\">"+char+"</div>");
    }
        
    $("html").off("KEYPRESSED");
    $("html").on("KEYPRESSED",KEYPRESSED);
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

function DeSanitize(key,shift=false,ctrl=false){
    if( CurrentKeyboardLang == VALUE_RUS )
    {
        return ConvertToRUS(key.toLowerCase(),shift,ctrl);
    }
    return key.toLowerCase();
}

function GetRandomQuiz() {
  return WordsToType[Math.floor(Math.random() * Math.floor(WordsToType.length))];
}