//全体的に(主にtr追加部分を関数でまとめよう)
//詳細設定出すために、クリックで下に伸びる感じのやつ作るし、考えといて
//編集後のリセットの挙動がおかしい
let transitionSecond = 0.1; //s

let audio = new Audio(".mp3");//アラーム音


const toggle = document.querySelectorAll('.toggle-btn');
const optionOpen = document.querySelector('.open-option');
const optionArea = document.querySelector('.option-wrapper');
const circle = document.querySelectorAll('.circle');
const modalBtn = document.querySelector('.create-scedule');
const modalClose = document.querySelector('.close-btn');
const modal = document.querySelector('.modal');
const submitBtn = document.querySelector('.keep-btn');
const inputTitle = document.querySelector('#title');
const table = document.querySelector('.todo');
const timeRow = document.querySelectorAll('.time'); //0,1,2の順で時、分、秒
const fileInput = document.getElementById('add-file');
const allInput = document.querySelectorAll('input');

fileInput.addEventListener('change',(e)=>{
    const file = e.target.files[0];
    if(file){
        if(!file.type.startsWith("audio/")){
            alert('音声ファイルを選択してください');
            fileInput.value = '';
        }
        else{
            audio = new Audio(URL.createObjectURL(file));
        }
    }
})
allInput.forEach(input => {
    input.addEventListener('focus',()=>{
        input.select();
    })}
)

// サイト更新時、time要素の数字作成
timeRow.forEach((time)=>{
    const role = time.dataset.role;
    if(role === 'hour'){
        const before = document.createElement('div');
        before.textContent = '23';
        time.appendChild(before);
        for(let i = 0;i < 24;i++){
            const div = document.createElement('div');
            div.textContent = `${i}`;
            time.appendChild(div);
        }
    }
    else if(role === 'minute' || role == 'second'){
        const before = document.createElement('div');
        before.textContent = '59';
        time.appendChild(before);
        for(let i = 0;i < 60;i++){
            const div = document.createElement('div');
            div.textContent = `${i}`;
            time.appendChild(div);
        }
    }
    const after = document.createElement('div');
    after.textContent = '0';
    time.appendChild(after);
})
const hour = document.querySelector('#hour').querySelectorAll('div');
const minute = document.querySelector('#minute').querySelectorAll('div');
const second = document.querySelector('#sec').querySelectorAll('div');


hour.forEach(h=>{
    h.style.transform = 'translate3d(0,-100%,0)';
})
minute.forEach(h=>{
    h.style.transform = 'translate3d(0,-100%,0)';
})
second.forEach(h=>{
    h.style.transform = 'translate3d(0,-100%,0)';
})
//それぞれにカルーセルの手法でスライドとcurrentindexを設定して
let hourindex = 1; let minindex = 1; let secindex = 1;
let isDown = false;
let isDragged = false;
let startY;
let dragStartY;
let hourTranslateY;
let minTranslateY;
let secTranslateY;
let activeRole = null;
;let timeHeight;

const getTranslateY = (item) => {
    timeHeight = hour[0].getBoundingClientRect().height;
    let transform = window.getComputedStyle(item).transform;
    if (!transform || transform === 'none') return 0;

    let values;
    if (transform.startsWith("matrix3d")) {
        const match = transform.match(/matrix3d\(([^)]+)\)/);
        if (!match) return 0;
        values = match[1].split(', ');
        return parseFloat(values[13]) * 100 / timeHeight;
    } else if (transform.startsWith("matrix")) {
        const match = transform.match(/matrix\(([^)]+)\)/);
        if (!match) return 0;
        values = match[1].split(', ');
        return parseFloat(values[5]) * 100 / timeHeight;
    }
    return 0;
}

const searchindex = (array,nowindex,num) => {
    nowindex = (nowindex + num + array.length) % array.length;
    return nowindex;
}
//mousedown時の処理
const mousedownEvent = (array) =>{
    console.log('down');
    const translateY = getTranslateY(array[0]);
    array.forEach(item=>{
        item.style.transition = 'none';
        item.style.transform = `0,${translateY}%,0`;
    })
    return translateY;
}
timeRow.forEach(time=>{
    time.addEventListener('pointerdown',(e)=>{
        e.preventDefault();
        isDown = true;
        isDragged = false;
        startY = e.pageY;
        dragStartY = e.pageY;
        const role = time.dataset.role;
        activeRole = role;
        if(role === 'hour') hourTranslateY = mousedownEvent(hour);
        else if(role === 'minute') minTranslateY = mousedownEvent(minute);
        else if(role === 'second') secTranslateY = mousedownEvent(second);

    })
})
//mouseup時の処理
const slideNum = (array,index,doTransition) => {
    array.forEach(item=>{
        item.style.transition = (doTransition) ? `transform ${transitionSecond}s ease` : 'none';
        item.style.transform = `translate3d(0,${(-index) * 100}%,0)`;
    })
    if(index === 0 || index === array.length - 1){
        index = (index === 0) ? array.length - 2 : 1;
    }
    return index;
}
const mouseupEvent = (array,index) =>{
    const translateY = getTranslateY(array[0]);
    let diff = Math.round(-(translateY + index * 100) / 100);
    if(diff !== 0){
        index = searchindex(array,index,diff);
    }
    index = slideNum(array,index,true);
    return index;
}
window.addEventListener('pointerup',(e)=>{
    if(!isDown) return;    
    isDown = false;
    if(activeRole === 'hour') hourindex = mouseupEvent(hour, hourindex);
    else if(activeRole === 'minute') minindex = mouseupEvent(minute, minindex);
    else if(activeRole === 'second') secindex = mouseupEvent(second, secindex);
    activeRole = null;
})
//mousemove時の処理
const mousemoveEvent = (array,position,translateY,e) =>{
    array.forEach(item=>{
        item.style.transition = 'none';
        item.style.transform = `translate3d(0,${position}%,0)`;
    })
    let index;
    if(position >= 0) index = array.length - 2;
    else if(position <= (array.length - 1) * -100) index = 1;
    else return [startY,translateY];
    position %= 100;
    startY = e.pageY;
    translateY = -index * 100;
    array.forEach(item=>{
        item.style.transition = 'none';
        item.style.transform = `translate3d(0,${position + translateY}%,0)`;
    })
    return [startY,translateY];
}
window.addEventListener('pointermove',(e)=>{
    if(!isDown) return;
    e.preventDefault();
    let move = e.pageY - startY;
    let disDragged = e.pageY - dragStartY;
    let walk;

    if(activeRole === 'hour'){
        walk = move * 100 / timeHeight + hourTranslateY;
        [startY, hourTranslateY] = mousemoveEvent(hour, walk, hourTranslateY, e);
    } else if(activeRole === 'minute'){
        walk = move * 100 / timeHeight + minTranslateY;
        [startY, minTranslateY] = mousemoveEvent(minute, walk, minTranslateY, e);
    } else if(activeRole === 'second'){
        walk = move * 100 / timeHeight + secTranslateY;
        [startY, secTranslateY] = mousemoveEvent(second, walk, secTranslateY, e);
    }
    if(Math.abs(disDragged) > 10) isDragged = true;
})



const timeToSecond = (h,m,s) => {
    let totalSec = 0;
    totalSec += h*3600 + m*60 + s;
    return totalSec;
}
//タイマー終了時関数
const finish = () =>{
    if(toggle.classList.contains('active'));
}

const resetModal = () => {
    modal.classList.add('nodisplay');

    // inputをリセット
    inputTitle.value = '';    
    // スライダーをリセット
    timeRow.forEach(time => {
        const children = time.querySelectorAll('div');
        children.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = 'translate3d(0,-100%,0)';
        });
    });
;
    // indexもリセット
    hourindex = 1;
    minindex = 1;
    secindex = 1;

}

let editingRow;

// 以下ボタン関連のイベント登録
toggle.forEach((btn,index)=>{
    btn.addEventListener('click',()=>{
        btn.classList.toggle('active');
        circle[index].classList.toggle('clicked');
        const detail = btn.closest('.options').querySelector('.option-detail');
        detail.classList.toggle('no-select')
    })
})
modalBtn.addEventListener('click',()=>{
    modal.classList.remove('nodisplay');
    inputTitle.focus();
    const btn = modal.querySelector('.submit-btn');
    btn.classList.add('keep-btn');
    btn.classList.remove('edit');
})
modal.addEventListener('click',(e)=>{
    if(e.target === modal && !isDragged){
        resetModal();
    }
    isDragged = false;
})

optionOpen.addEventListener('click',()=>{
    optionOpen.classList.toggle('option-open');    
    if(optionOpen.classList.contains('option-open')){
        optionArea.style.transform = 'translate(0,0)';
    }
    else{
        optionArea.style.transform = 'translate(100%,0)';
    }
})

//オプションのtd作成
const optionHTML = `
    <td class="option">
        <button class="start-btn" title="開始/停止">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor" class="stopIcon">
                <polygon points="6,4 20,12 6,20"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor" class="startIcon nodisplay">
                <rect x="5" y="4" width="4" height="16"></rect>
                <rect x="15" y="4" width="4" height="16"></rect>
            </svg>
        </button>
        <button class="reset-btn" title="リセット">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                <path d="M12 6V3L8 7l4 4V8c2.8 0 5 2.2 5 5s-2.2 5-5 5a5 5 0 0 1-4.9-4H6a7 7 0 0 0 6 6.9A7 7 0 0 0 19 13c0-3.9-3.1-7-7-7z"/>
            </svg>
        </button>
        <button class="edit-btn" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
            </svg>
        </button>
        <button class="delete-btn" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
            </svg>
        </button>
        <input type="checkbox" class="done-checkbox" title="完了" style="width:20px; height:20px;">
    </td>
`;


updateTimer = (time,item) => {
    let hour = Math.floor(time / 3600);
    let minute = Math.floor((time % 3600) / 60);
    let second = (time % 3600) % 60;
    let hou = `${hour}`;let min = `${minute}`;let sec = `${second}`;
    if(hour <= 9) hou = `0${hour}`; if(minute <= 9) min = `0${minute}`; if(second <= 9) sec =`0${second}`;
    item.textContent = `${hou}:${min}:${sec}`;
}

submitBtn.addEventListener('click',()=>{
    if(inputTitle.value == '' || (hourindex - 1 == 0 && minindex - 1 == 0 && secindex - 1 == 0)){alert('タイトル、時間が未設定です。');return;}
    if(submitBtn.classList.contains('keep-btn')){
        const tr = document.createElement('tr');
        table.appendChild(tr);
        let hou = hourindex - 1; let min = minindex - 1; let sec = secindex - 1;
        let total = timeToSecond(hou,min,sec);
        let currentTime = null;
        let remainingTime = total;
        let pause = false;
        let pausedTime = null;
        let reset = false;
        const title = inputTitle.value;
        
        tr.dataset.total = total;
        tr.dataset.remainingTime = remainingTime;

        const scedule = document.createElement('td'); const time = document.createElement('td');
        scedule.textContent = `${title}`; updateTimer(total,time);
        tr.appendChild(scedule); tr.appendChild(time);
        tr.insertAdjacentHTML('beforeend', optionHTML);
        
        const resetTimer = () =>{
            pause = true;
            remainingTime = tr.dataset.total;
            currentTime = null;
            pausedTime = null;
            startbtn.classList.remove('stop'); startIcon.classList.add('nodisplay'); stopIcon.classList.remove('nodisplay');
        }
        
        const startTimer = (ts) => {
            if(pause) return;
            if(currentTime === null) {currentTime = ts;}
            const eps = ts - currentTime;        
            if(eps >= 1000){
                const steps = Math.floor(eps / 1000);
                remainingTime -= steps;
                if(remainingTime < 0) {resetTimer(); remainingTime = 0; return;}
                tr.dataset.remainingTime = remainingTime;
                currentTime += steps * 1000;
                updateTimer(remainingTime, time);
                if(remainingTime <= 0){
                    const sound = document.querySelector('.sound'); const autoCheck = document.querySelector('.auto-check'); const restartSameTimer = document.querySelector('.restart-timer');
                    
                    //ファイル読み取りで、音決めてもいいかも
                    //設定でいじれるようにしよう
                    if(sound.classList.contains('active')){
                        audio.loop = true;
                        audio.play();
                        setTimeout(() => {
                            audio.pause();
                            audio.currentTime = 0;
                        }, Number(document.querySelector('.play-time').value)*1000 || 1000);
                    }
                    if(autoCheck.classList.contains('active')){
                        tr.querySelector('.done-checkbox').checked = true;
                        tr.style.backgroundColor = 'green';

                    }
                    if(restartSameTimer.classList.contains('active')){
                        resetTimer();
                        startIcon.classList.remove('nodisplay'); 
                        stopIcon.classList.add('nodisplay');
                        startbtn.classList.add('stop');
                        updateTimer(0,time);
                        reset = true;
                        if(tr.restartTimeout) clearTimeout(tr.restartTimeout);

                        tr.restartTimeout = setTimeout(()=>{     
                            console.log(reset);
                                                   
                            if(pause && !reset) {console.log('a');return};
                            reset = false;        
                            resetTimer();
                            startIcon.classList.remove('nodisplay'); 
                            stopIcon.classList.add('nodisplay');
                            startbtn.classList.add('stop');
                            pause = false; 
                            remainingTime = tr.dataset.total;
                            updateTimer(remainingTime,time);
                            console.log(remainingTime,pause);
                            requestAnimationFrame(startTimer);
                        }, Number(document.querySelector('.restartInterval').value) * 1000 || 1000);

                        return;
                    }
                    resetTimer();
                    return;
                } 
            }
            requestAnimationFrame(startTimer);
        }

        const startbtn = tr.querySelector('.start-btn');
        const startIcon = startbtn.querySelector('.startIcon');
        const stopIcon = startbtn.querySelector('.stopIcon');
        startbtn.addEventListener('click',()=>{
            reset = false;
            startbtn.classList.toggle('stop');
            startIcon.classList.toggle('nodisplay');
            stopIcon.classList.toggle('nodisplay');
            remainingTime = tr.dataset.remainingTime;
            if(startbtn.classList.contains('stop')){
                pause = false;
                if(pausedTime !== null){currentTime += performance.now() - pausedTime; pausedTime = null}
                requestAnimationFrame(startTimer);
            }
            else{
                pausedTime = performance.now();
                pause = true;
            }
        })
        tr.querySelector('.reset-btn').addEventListener('click',()=>{
            reset = false;
            resetTimer();
            tr.dataset.remainingTime = total;
            updateTimer(remainingTime,time);
        })
        tr.querySelector('.edit-btn').addEventListener('click',()=>{
            reset = false;
            resetTimer();
            modal.classList.remove('nodisplay');
            const btn = modal.querySelector('.submit-btn');
            btn.classList.add('edit');
            btn.classList.remove('keep-btn');

            // 編集対象を保存
            editingRow = tr;

            // モーダルに値をセット
            inputTitle.value = scedule.textContent;
            const [h, m, s] = time.textContent.split(':').map(Number);

            hourindex = slideNum(hour,h + 1,false);
            minindex = slideNum(minute,m + 1,false);
            secindex = slideNum(second,s + 1,false);
        });
        tr.querySelector('.delete-btn').addEventListener('click',()=>{
            if(confirm('削除しますか?')) tr.remove();
        })
        tr.querySelector('.done-checkbox').addEventListener('change',()=>{
            if(tr.querySelector('.done-checkbox').checked){                
                tr.style.backgroundColor = 'green';
            }
            else{                
                tr.style.backgroundColor = 'transparent';
            }
        })
    }
    else {
        if(editingRow){
            reset = false;
            if(inputTitle.value == '' || (hourindex - 1 == 0 && minindex - 1 == 0 && secindex - 1 == 0)){alert('タイトル、時間が未設定です。');return;}
            let hou = hourindex - 1; let min = minindex - 1; let sec = secindex - 1;
            const sceduleCell = editingRow.querySelector('td:nth-child(1)');
            const timeCell = editingRow.querySelector('td:nth-child(2)');

            sceduleCell.textContent = `${inputTitle.value}`;

            let t = timeToSecond(hou,min,sec);
            updateTimer(t,timeCell);
            editingRow.dataset.total = editingRow.dataset.remainingTime = t;
        }
    }
    resetModal();
})