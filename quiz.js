(function(){
var root=document.getElementById('quiz-root');if(!root)return;
var D=JSON.parse(document.getElementById('quiz-data').textContent),U=D.ui,Q=D.questions,L=D.lang,id=D.id,i=0,score=0,answered=false;
function ev(p){try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:'quiz/'+id+'/'+p,title:'Quiz '+id,event:true})}catch(e){}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function render(){
 if(i>=Q.length){ev('complete');ev('score/'+score+'-of-'+Q.length);root.innerHTML='<div class="hero"><h2>'+esc(U.score)+': '+score+' / '+Q.length+'</h2><p>'+esc(U.done)+'</p><button class="btn" id="again">'+esc(U.again)+'</button></div>';document.getElementById('again').onclick=function(){i=0;score=0;render()};return}
 var q=Q[i];answered=false;
 root.innerHTML='<p class="note">'+esc(U.question)+' '+(i+1)+' / '+Q.length+'</p><h2>'+esc(q.question[L])+'</h2><div id="opts">'+q.options[L].map(function(o,k){return '<button class="qopt" data-k="'+k+'">'+esc(o)+'</button>'}).join('')+'</div><div id="fb"></div>';
 if(i===0)ev('start');
 Array.prototype.forEach.call(root.querySelectorAll('.qopt'),function(b){b.onclick=function(){if(answered)return;answered=true;var k=+b.dataset.k,ok=k===q.correct;if(ok)score++;
  ev('q'+(i+1)+'/'+(ok?'correct':'wrong')+'/option-'+(k+1));
  Array.prototype.forEach.call(root.querySelectorAll('.qopt'),function(x,n){x.disabled=true;if(n===q.correct)x.classList.add('ok');else if(n===k)x.classList.add('no')});
  document.getElementById('fb').innerHTML='<div class="card"><b>'+esc(ok?U.correct:U.wrong)+'</b> '+esc(U.answer_is)+' <b>'+esc(q.options[L][q.correct])+'</b><br>'+esc(q.explanation[L])+'</div><button class="btn" id="nx">'+esc(i===Q.length-1?U.finish:U.next)+'</button>';
  document.getElementById('nx').onclick=function(){i++;render()}}});
}
render();
})();
