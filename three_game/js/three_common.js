function GetScreenWidth(){
    return window.innerWidth;
}
    
function GetScreenHeight(){
    return window.innerHeight;
}

//1フレームの経過時間の取得.
let deltaTime = 0;
function GetDeltaTime(){
    return deltaTime;
}
function SetDeletaTime(dt){
    deltaTime = dt;
}

// 経過時間の取得.
let elapsedTime = 0;
function GetElapsedTime(){
    return elapsedTime;
}
function SetElapsedTime(et){
    elapsedTime = et;
}

// 経過フレームの取得.
let elapsedFrame = 0;
 function GetElapsedFrame(){
    return elapsedFrame;
 }

 // 経過フレーム加算.
 function AddElapsedFrame(){
    elapsedFrame+=1;
 }