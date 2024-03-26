const DEC_FIRST = true;
const WORD_FIRST = false;
var ReturnArr;

const   TYPE_RUS_A          = "RUS_A",
        TYPE_RUS_N_1        = "RUS_N_1",
        TYPE_RUS_N_2_M      = "RUS_N_2_M",
        TYPE_RUS_N_2_N      = "RUS_N_2_N",
        TYPE_RUS_N_3        = "RUS_N_3",
        TYPE_RUS_P_PERSONAL = "RUS_P_P";

export function GetQuiz(id, decFirst){
    
    GetJSON(id, decFirst);
    return ReturnArr;

    function GetJSON( WORD, decFirst = false ){
        var word = WORD.split("-");
        $.ajax({
            url:"/quiz/"+word[0]+"/"+word[1]+"/"+word[2]+".json", 
            dataType : 'json',
            async : false,
            success : function(data) {
                ReturnArr = [];
                for( let quiz of data.Quiz )
                {
                    ReturnArr = ReturnArr.concat( { "Question":(decFirst ? data.Quiz[0].word + " (" + quiz.desc + ")" : quiz.word), 
                                                    "Answer":(decFirst ? quiz.word : quiz.desc ),
                                                    "Hint":data.Hint,
                                                    "Base":data.Base} );
                }
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////Hint
export function UpdateHint(type){   
    var hint = "";
    switch(type)
    {
        case TYPE_RUS_N_1:
hint = `
<h6>Singular</h6>
<pre>Nom:   -а:  -я:  -ия
Acc:   -у:  -ю:  -ию
Gen:  -ы1:  -и:  -ии
Dat:   -е:  -е:  -ии
Ins: -ой2:-ей3: -ией
Pre:   -е:  -е:  -ии</pre>
<h6>Plural</h6>
<pre>Nom:  -ы1:  -и:  -ии
Acc:     N  or  G   
Gen:    -:  -ь:  -ий
Dat:  -ам: -ям: -иям
Ins: -ами:-ями:-иями
Pre:   -х: -ях: -иях</pre>
<pre>1)After ж,ч,ш,щ,г,к,х, = и
2)After ж,ч,ш,щ,
  Stressed = о, Unstressed = е
3)After soft consonant,
  Stressed = ё, Unstressed = е</pre>`;
            break;
        case TYPE_RUS_N_2_M:
hint = `
<h6>Singular</h6>
<pre>Nom:    –:   -ь:   -й:   -ий
Acc:     N  or  G 
Gen:   -а:   -я:   -я:   -ия
Dat:   -у:   -ю:   -ю:   -ию
Ins:  -ом: -ем3: -ем3:  -ием
Pre:   -е:   -е:   -е:   -ии</pre>
<h6>Plural</h6>
<pre>Nom:  -ы1:   -и:   -и:   -ии
Acc:     N  or  G
Gen: -ов2:  -ей: -ев3:  -иев
Dat:  -ам:  -ям:  -ям:  -иям
Ins: -ами: -ями: -ями: -иями
Pre:  -ах:  -ях:  -ях:  -иях</pre>
<pre>1)After ж,ч,ш,щ,г,к,х, = и
2)After ж,ч,ш,щ,
  Stressed = о, Unstressed = е
3)After soft consonant,
  Stressed = ё, Unstressed = е</pre>`;
            break;
        case TYPE_RUS_N_2_N:
hint = `
<h6>Singular</h6>
<pre>Nom:   -о:  -е
Acc:   -о:  -е
Gen:   -а:  -я
Dat:   -у:  -ю
Ins: -ом1:-ем2
Pre:   -е: -е3</pre>
<h6>Plural</h6>
<pre>Nom:   -а:  -я
Acc: N  or  G
Gen:    –: -й4
Dat:  -ам: -ям
Ins: -ами:-ями
Pre:  -ах: -ях</pre>
<pre>1)After ж,ч,ш,щ
Stressed = о, Unstressed = е
2)After soft consonant,
  Stressed = ё, Unstressed = е
3)for nouns -ие,
  Stressed = е, Unstressed = и
4)After a consonant = ей
5)Some masculine nouns applied this type</pre>`;
            break;
        case TYPE_RUS_N_3:
hint = `
<h6>Singular</h6>
<pre>Nom:   -ь:    -мя:   дитя:  путь
Acc:   -ь:    -мя:   дитя́:  путь
Gen:   -и:  -мени: дитя́ти:  пути́
Dat:   -и:  -мени: дитя́ти:  пути́
Ins   -ью: -менем:дитя́тей: путём
Pre:   -и:  -мени: дитя́ти: пути́</pre>
<h6>Plural</h6>
<pre>Nom:   -и:  -мена:   де́ти:  пути́
Acc:  N/G:  -мена:  дете́й:  пути́
Gen:  -ей:   -мён:  дете́й: путе́й
             -мян:
Dat: -ям1: -менам:  де́тям: путя́м
Ins:-я́ми1:-менами: детьм́и:путя́ми
     -ьми́:
Pre: -ях1: -менах:  де́тях: путя́х</pre>
<pre>1)After ж,ч,ш,щ = а</pre>`;
            break;
        case TYPE_RUS_A:
hint = `
<h6>Adjective</h6>
<pre>       M   N   F  Plu
Nom.  -ый -ое -ая -ые
Acc.  N/G -ое -ую N/G
Gen.    -ого  -ой -ых
Dat.    -ому  -ой -ым
Ins.    -ым   -ой -ыми
Pre.    -ом   -ой -ых`;
            break;
        case TYPE_RUS_P_PERSONAL:
hint = `
<h6>Singular</h6>
<pre>N.  я     ты     оно́    он    он́а
A. меня́  теб́я   (н)его́ (н)его́ (н)её
G. меня́  теб́я   (н)его́ (н)его́ (н)её
D. мне   тебе́   (н)ему́ (н)ем́у (н)ей
I. мной  тобо́й  (н)им  (н)им  (н)ей
  (мно́ю)(тоб́ою)         　　  ((н)ею)
P. мне   тебе́    нём    нём   ней</pre>
<h6>Plural & Self</h6>    
<pre>Nom. мы   вы    они́    сам
Acc. нас  вас  (н)их   себя́
Gen. нас  вас  (н)их   себя́
Dat. нам  вам  (н)им   себе́
Ins. на́ми ва́ми (н)и́ми  собо́й
                      (собо́ю)
Pre. нас  вас   них    себе́</pre>`;
            break;
        case "RUS_P_MY":
hint = `
<h6>My,Your,One's</h6>
<pre>       M   N    F  Plu
Nom.   -й -ё   -я  -и́
Acc.  N/G -ё   -ю  N/G
Gen.   -его   -ей -и́х
Dat.   -ему   -ей -и́м
Ins.    -им   -ей -и́ми
Pre.    -ём   -ей -ых`;
            break;
        case "RUS_P_OUR":
hint = `
<h6>Our's, Your's(Plural)</h6>
<pre>       M   N    F  Plu
Nom.   -  -е   -а   -и
Acc.  N/G -е   -у  N/G
Gen.   -его   -ей  -их
Dat.   -ему   -ей  -им
Ins.    -им   -ей -ими
Pre.    -ем   -ей  -их`;
            break;
        case "RUS_P_WHO_WHAT":
hint = `
<pre>      (Who) (What)
Nom.   кто   что
Acc.  кого́   что
Gen.  кого́   чего́
Dat.  кому́   чему́
Ins.   кем   чем
Pre.   ком   чём`;
            break;
        case "RUS_P_WHOSE":
hint = `
<pre>        M    N     F    Plu
Nom.   чей  чьё   чья   чьи
Acc.   N/G  чьё   чью   N/G
Gen.     чьего́   чьей  чьих
Dat.     чьему́   чьей  чьим
Ins.      чьим   чьей  чьи́ми
Pre.      чьём   чьей  чьих`;
            break;
        case "RUS_P_THAT":
hint = `
<pre>       M    N   F   Plu
Nom.  тот  то   та 　те
Acc.  N/G  то   ту  N/G
Gen.    того́   той  тех
Dat.    тому́   той  тем
Ins.     тем   той  те́ми
Pre.     том   той  тех`;
            break;

case "RUS_P_THIS":
hint = `
<pre>
　　　　M    N     F    Plu
Nom.  э́тот  э́то   э́та 　э́ти
Acc.  N/G   э́то   э́ту   N/G
Gen.    э́того     э́той  э́тих
Dat.    э́тому     э́той  э́тим
Ins.     э́тим     э́той  э́тими
Pre.     э́том     э́той  э́тих`;
            break;

case "LAT_I_II":
hint = `
<h6>Singular</h6>
<pre>      M     F    N
Nom. -us   -a    -um
Voc. -e    -a    -um
Acc. -um   -am   -um
Gen. -ī    -ae   -̄i
Dat. -ō    -ae   -̄o
Abl. -ō    -ā    -̄o</pre>
<h6>Plural</h6>
<pre>N.V. -ī    -ae   -a
Acc. -ōs   -̄as   -a
Gen. -ōrum -̄arum -ōrum
Dat. -īs   -īs   -īs
Abl. -īs   -īs   -īs</pre>`;
break;

case "LAT_III":
hint = `
<h6>Consonant stems</h6>
<pre>          M&F       N
       S     P    S    P
N.V. (-s)   -es   -   -a
Acc.  -em   -es   -   -a
Gen.  -is   -um  -is -um
Dat.  -i  -ibus   -i -ibus
Abl.  -e  -ibus   -e -ibus</pre>
<h6>i-stem</h6>
<pre>          M&F       N
       S     P    S    P
N.V.   -    -es   -   -ia
Acc.  -em   -es   -   -ia
      -im   -is
Gen.  -is  -ium  -is -ium
Dat.  -i  -ibus   -i -ibus
Abl.  -e  -ibus   -i -ibus
      -i    </pre>`;
break;

case "LAT_IV":
hint = `
<h6>-us</h6>
<pre>       Singular Plural
N.V.  -us   -ūs
Acc.  -um   -ūs
Gen.  -ūs   -uum
Dat.  -uī   -ibus
Abl.  -ū    -ibus</pre>
<h6>-ū</h6>
<pre>       Singular Plural
N.V.  -ū    -ua
Acc.  -ū    -ua
Gen.  -ūs   -uum
      -ū    
Dat.  -uī   -ibus
      -ū  
Abl.  -ū    -ibus</pre>`;
break;

case "LAT_V":
hint = `
<h6>-us</h6>
<pre>       Singular Plural
N.V.  -ēs   -ēs
Acc.  -em   -ēs
Gen.  -eī*  -ērum
Dat.  -eī*  -ēbus
Abl.  -ē    -̄ebus
* -iēs nouns -> -ēī</pre>`;
break;

case "LAT_V_1":
hint = `<pre>
      S   P
1st  -ō -āmus
2nd -ās -ātis
3rd -at -ant
</pre>`;
 break;

case "LAT_V_2":
hint = `<pre>
      S   P
1st -eō -ēmus
2nd -ēs -ētis
3rd -et -ent
</pre>`;
break;

case "LAT_V_3":
hint = `
<h6>A</h6>
<pre>      S   P
1st -ō  -imus
2nd -is -itis
3rd -it -unt</pre>
<h6>B</h6>
<pre>      S   P
1st -iō -imus
2nd -is -itis
3rd -it -iunt</pre>`;
break;

case "LAT_V_4":
hint = `<pre>
      S   P
1st -iō -īmus
2nd -īs -ītis
3rd -it -iunt
</pre>`;
break;

        default :
            break;
    }
    $("#HintButton").attr("data-content", hint);
}
