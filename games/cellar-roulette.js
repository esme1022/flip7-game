/* ═══ CELLAR BARREL ROULETTE + SETTLEMENT ═══ */
(function(){
  const RANKS=[
    {name:'迷途羔羊',subs:3,stars:5,protect:true},
    {name:'暗巷常客',subs:3,stars:5,protect:true},
    {name:'茶会侍从',subs:3,stars:5,protect:true},
    {name:'茶会末席',subs:3,stars:5,protect:false},
    {name:'黑桃骑士',subs:3,stars:5,protect:false},
    {name:'地下政官',subs:3,stars:5,protect:false},
    {name:'红桃新贵',subs:3,stars:5,protect:false},
    {name:'宫廷弄臣',subs:3,stars:5,protect:false},
    {name:'暗夜领主',subs:3,stars:5,protect:false},
    {name:'无冕之王',subs:3,stars:5,protect:false},
    {name:'永夜之主',subs:3,stars:5,protect:false},
  ];

  function getRankInfo(total){
    let rem=total;
    for(let r=0;r<RANKS.length;r++){
      for(let s=0;s<RANKS[r].subs;s++){
        if(rem<RANKS[r].stars) return {tier:r,protect:RANKS[r].protect};
        rem-=RANKS[r].stars;
      }
    }
    return {tier:10,protect:false};
  }

  function getPlayer(){
    return JSON.parse(localStorage.getItem('cellar_player')||'{}');
  }
  function savePlayer(p){
    localStorage.setItem('cellar_player',JSON.stringify(p));
  }

  function injectOverlay(){
    if(document.getElementById('barrelRouletteOverlay'))return;
    const div=document.createElement('div');
    div.id='barrelRouletteOverlay';
    div.className='barrel-roulette-overlay';
    div.innerHTML=`
      <div class="br-title">🔫 QQ弹轮盘</div>
      <div class="br-subtitle">三颗QQ弹，只有一颗装满了葡萄汁…</div>
      <div class="br-barrels" id="brBarrels"></div>
      <div class="br-status" id="brStatus"></div>
      <div class="br-settle" id="brSettle"></div>
      <button class="br-done-btn" id="brDone" onclick="window._brDone()">返回酒庄</button>
    `;
    document.body.appendChild(div);
  }

  window.cellarSettlement = function(placement, totalPlayers, gameName){
    injectOverlay();
    const overlay=document.getElementById('barrelRouletteOverlay');
    const barrelsEl=document.getElementById('brBarrels');
    const statusEl=document.getElementById('brStatus');
    const settleEl=document.getElementById('brSettle');
    const doneBtn=document.getElementById('brDone');

    if(placement===1){
      doSettle(placement,gameName);
      return;
    }

    const BULLET_COUNT=3;
    const grapeIdx=Math.floor(Math.random()*BULLET_COUNT);

    barrelsEl.innerHTML='';
    for(let i=0;i<BULLET_COUNT;i++){
      const b=document.createElement('div');
      b.className='br-barrel';
      b.innerHTML=`<div class="br-tap">🔫</div><div class="br-result"></div>`;
      b.onclick=function(){fireBullet(i,b)};
      barrelsEl.appendChild(b);
    }

    statusEl.textContent='选择一颗QQ弹开枪…';
    settleEl.textContent='';
    doneBtn.classList.remove('show');
    overlay.classList.add('show');

    let fired=false;
    function fireBullet(idx,el){
      if(fired)return;
      fired=true;
      el.classList.add('opened');
      const result=el.querySelector('.br-result');

      if(idx===grapeIdx){
        el.classList.add('exploded');
        result.textContent='🍇💥';
        statusEl.textContent='💥 葡萄汁爆射！被喷了一脸…';
        setTimeout(()=>finishRoulette(placement,gameName,true),1200);
      }else{
        el.classList.add('safe');
        result.textContent='💨';
        statusEl.textContent='✨ 空弹！安全过关！';
        setTimeout(()=>finishRoulette(placement,gameName,false),1000);
      }
    }
  };

  function finishRoulette(placement,gameName,wasHit){
    const settleEl=document.getElementById('brSettle');
    const doneBtn=document.getElementById('brDone');

    const p=getPlayer();
    const starTable={1:3,2:1,3:-1,4:-2};
    const coinTable={1:30,2:15,3:5,4:0};
    const change=starTable[placement]||0;
    const rank=getRankInfo(p.rankStars||0);
    const actualChange=(change<0&&rank.protect)?0:change;
    p.rankStars=Math.max(0,(p.rankStars||0)+actualChange);
    const mult=[1,1,1,1.2,1.2,1.5,1.5,2.0,2.0,2.5,3.0][rank.tier]||1;
    const coins=Math.floor((coinTable[placement]||0)*mult);
    p.coins=(p.coins||0)+coins;
    savePlayer(p);

    const hitMsg=wasHit?'🍇 被葡萄汁喷中！':'空弹，安全通过！';
    settleEl.innerHTML=`${hitMsg}<br>星星 ${actualChange>=0?'+':''}${actualChange} · 🍇 +${coins}`;
    doneBtn.classList.add('show');
  }

  function doSettle(placement,gameName){
    injectOverlay();
    const overlay=document.getElementById('barrelRouletteOverlay');
    const barrelsEl=document.getElementById('brBarrels');
    const statusEl=document.getElementById('brStatus');
    const settleEl=document.getElementById('brSettle');
    const doneBtn=document.getElementById('brDone');

    barrelsEl.innerHTML='';
    statusEl.textContent='🏆 第一名！免受惩罚';

    const p=getPlayer();
    const starTable={1:3,2:1,3:-1,4:-2};
    const coinTable={1:30,2:15,3:5,4:0};
    const change=starTable[placement]||0;
    const rank=getRankInfo(p.rankStars||0);
    const actualChange=(change<0&&rank.protect)?0:change;
    p.rankStars=Math.max(0,(p.rankStars||0)+actualChange);
    const mult=[1,1,1,1.2,1.2,1.5,1.5,2.0,2.0,2.5,3.0][rank.tier]||1;
    const coins=Math.floor((coinTable[placement]||0)*mult);
    p.coins=(p.coins||0)+coins;
    savePlayer(p);

    settleEl.innerHTML=`星星 +${actualChange} · 🍇 +${coins}`;
    doneBtn.classList.add('show');
    overlay.classList.add('show');
  }

  window._brDone=function(){
    location.href='/lobby-design.html';
  };
})();
