;(function(){
var SK='qpsych';
function sv(){
  if(typeof curLevel===typeof undefined||!curLevel)return;
  try{localStorage.setItem(SK,JSON.stringify({l:curLevel,sec:curSection,sub:curSubSection||'',x:x,as:as}))}catch(e){}
}
function clr(){try{localStorage.removeItem(SK)}catch(e){}}
function showResume(){
  try{
    var r=localStorage.getItem(SK);if(!r)return;
    var s=JSON.parse(r);if(!s||!s.l||!s.sec)return;
    var ls=document.getElementById('ls');if(!ls)return;
    if(document.getElementById('resumeBtn'))return;
    var d=document.createElement('div');d.id='resumeBtn';
    d.style.cssText='background:rgba(80,200,120,.08);border:1px solid rgba(80,200,120,.3);border-radius:12px;padding:.75rem 1rem;margin-bottom:.85rem;cursor:pointer';
    d.onclick=function(){
      try{
        var d2=JSON.parse(localStorage.getItem(SK));if(!d2||!d2.l)return;
        curLevel=d2.l;curSection=d2.sec;curSubSection=d2.sub||'';
        var src=D[curLevel][curSection];if(curSubSection)src=src[curSubSection];
        allQ=src;x=d2.x||0;as=d2.as||[];
        document.getElementById('ht').textContent=curSection;
        document.getElementById('b1').style.display='block';
        _rq();
      }catch(e){}
    };
    var cnt=0;for(var k in s.as)if(s.as[k])cnt++;
    var nm=s.sec.replace('基础知识-助理级','基础知识').replace('操作技能-助理级','操作技能').replace('基础知识-初级','基础知识').replace('操作技能-初级','操作技能');
    d.innerHTML='<div style=font-size:.88rem;color:#50c878;font-weight:600;margin-bottom:.2rem>&#9654; 继续上次答题</div><div style=font-size:.75rem;color:rgba(255,255,255,.45)>'+s.l+' > '+nm+' &middot; 第'+(s.x+1)+'题 &middot; '+cnt+'题已答</div>';
    ls.insertBefore(d,ls.firstChild);
  }catch(e){}
}
window.addEventListener('beforeunload',sv);
setTimeout(function(){
  try{
    if(typeof _sk===typeof _sk){var o1=_sk;_sk=function(i){o1(i);setTimeout(sv,0)}}
    if(typeof _sm===typeof _sk){var o2=_sm;_sm=function(){o2();setTimeout(sv,0)}}
    if(typeof startQuiz===typeof _sk){var o3=startQuiz;startQuiz=function(l,s,ss){o3(l,s,ss);clr()}}
    if(typeof showLevels===typeof _sk){var o4=showLevels;showLevels=function(){o4();setTimeout(showResume,0)}}
  }catch(e){}
  showResume();
},200);
})();