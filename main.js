let input_key = new Array();
// キーボードの入力イベント
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
  input_key[e.keyCode] = true;
}
window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
  input_key[e.keyCode] = false;
}

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ↓出力されない？？
// ctx.font = "30px Arial";
// ctx.fillStyle = "red";
// ctx.fillText("ハチワレとうさぎをめざせ！", 300, 100);

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// BGM（HTMLでLOOP再生処理済み）
const bgm = document.getElementById("bgm");
bgm.oncanplay = function() {
  bgm.play();
};

// ジャンプの効果音
document.addEventListener('keydown', function(event) {
  if (event.keyCode === 38) {
    let sound = document.getElementById('jumpEffect');
    sound.play();
  }
});

// ゴールの効果音
let goalEffect = document.getElementById("goalEffect");

// ゲームオーバーの効果音
let gameoverEffect = document.getElementById("gameoverEffect");

//画像のサイズ
const IMG_SIZE = 50;
const CHARA_SPEED = 5;
// 自キャラクター（ちいかわ）の配置初期値
let x = 20;
let y = 600;
// 上下方向の速度
let vy = 0;  //正：落下 負:上昇
// ジャンプ
let isJump = false;
// ゲームオーバー
let isGameOver = false;
// ゲームクリア
let isGameClear = false;
//ゴール位置
const GOAL_X = 510;
const GOAL_Y = 50;
// ゴール画像サイズ
const GOAL_IMG1 = 50;
const GOAL_IMG2 = 70;
// 足場
let blocks = [
  { x: 0, y: 790, w: 400, h: 10 },
  { x: 400, y: 750, w: 300, h: 10 },
  { x: 100, y: 600, w: 200, h: 10 },
  { x: 750, y: 680, w: 100, h: 10 },
  { x: 900, y: 580, w: 50, h: 10 },
  { x: 1010, y: 500, w: 50, h: 10 },
  { x: 1010, y: 450, w: 50, h: 10 },
  { x: 700, y: 390, w: 300, h: 10 },
  { x: 100, y: 380, w: 30, h: 10 },
  { x: 100, y: 320, w: 30, h: 10 },
  { x: 270, y: 460, w: 30, h: 10 },
  { x: 100, y: 530, w: 30, h: 10 },
  { x: 550, y: 500, w: 300, h: 10 },
  { x: 100, y: 260, w: 100, h: 10 },
  { x: 200, y: 260, w: 10, h: 50 },
  { x: 200, y: 300, w: 300, h: 10 },
  { x: 490, y: 260, w: 10, h: 50 },
  { x: 490, y: 260, w: 50, h: 10 },
  { x: 950, y: 300, w: 50, h: 100 },
  { x: 900, y: 350, w: 50, h: 50 },
  { x: 800, y: 250, w: 50, h: 10 },
  { x: 800, y: 50, w: 50, h: 10 },
  { x: 950, y: 150, w: 50, h: 10 },
  { x: 450, y: 100, w: 200, h: 10 },
];
// 敵（ハチワレ）
let enemies = [
  { x: 400, y: 650, isJump: true, vy: 0 },
  { x: 500, y: 650, isJump: true, vy: 0 },
  { x: 600, y: 650, isJump: true, vy: 0 },
  { x: 100, y: 500, isJump: true, vy: 0 },
  { x: 300, y: -200, isJump: true, vy: 0 },
  { x: 360, y: -50, isJump: true, vy: 0 },
  { x: 700, y: 400, isJump: true, vy: 0 },
  { x: 800, y: 400, isJump: true, vy: 0 },
  { x: 900, y: 300, isJump: true, vy: 0 },
  { x: 600, y: -50, isJump: true, vy: 0 },
];
const ENEMY_SPEED = 0.5;

// 障害物の情報
let obstacles = [
  { x: 20, y: 300},
  { x: 600, y: 350},
  { x: 630, y: 600},
  { x: 950, y: 400 },
  { x: 230, y: 250 },
  // { x: 270, y: 250 },
  { x: 420, y: 250 },
  // { x: 800, y: 340 },
  { x: 950, y: 160 },
  { x: 800, y: 60 },
];

// ロード時に画面描画の処理が実行されるようにする
window.addEventListener("load", update);
// 画面を更新する関数を定義
function update() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (const enemy of enemies) {
    let updatedEnemyX = enemy.x;
    let updatedEnemyY = enemy.y;
    let updatedEnemyInJump = enemy.isJump;
    let updatedEnemyVy = enemy.vy;
    updatedEnemyX = updatedEnemyX - ENEMY_SPEED;

    if (enemy.isJump) {
      updatedEnemyY = enemy.y + enemy.vy;
      updatedEnemyVy = enemy.vy + 0.5;
      const blockTargetIsOn = getBlockTargetIsOn(enemy.x, enemy.y, updatedEnemyX, updatedEnemyY);
      if (blockTargetIsOn !== null) {// ブロックが取得できた場合には、そのブロックで止まる
        updatedEnemyY = blockTargetIsOn.y - IMG_SIZE;
        updatedEnemyInJump = false;
      }
    } else { //ジャンプしていない状態でブロックが取得できなかったら
      if (getBlockTargetIsOn(enemy.x, enemy.y, updatedEnemyX, updatedEnemyY) === null) {
        updatedEnemyInJump = true; //上記のif文が実行される(ジャンプと同じ扱いにする)
        updatedEnemyVy = 0;
      }
    }
    enemy.x = updatedEnemyX;
    enemy.y = updatedEnemyY;
    enemy.isJump = updatedEnemyInJump;
    enemy.vy = updatedEnemyVy;
  }

  let updatedX = x;
  let updatedY = y;

  if (isGameClear) {
    goalEffect.play();
    isGameClear = false;
    isJump = false;
    updatedX = 20;
    updatedY = 600;
    vy = 0;
    input_key[39] = false; //ゲームクリア後に前に行かせないようにする
    alert("ゲームクリア");
  } else if (isGameOver){
    updatedY = y + vy;
    vy = vy + 0.5;
    if (y > CANVAS_HEIGHT) { //キャラが更に下に落ちてきた時
      gameoverEffect.play();
      alert("GAME OVER");
      isGameOver = false;
      isJump = false;
      updatedX = 20;
      updatedY = 600;
      vy = 0;
    }
  } else {
    if (input_key[37]) {
      updatedX = x - CHARA_SPEED;
    }
    if (input_key[38] && !isJump ) {
      vy = -10;
      isJump = true;
    }
    if (input_key[39]) {
      updatedX = x + CHARA_SPEED;
    }

    if (isJump) {
      updatedY = y + vy;
      vy = vy + 0.5;
      const blockTargetIsOn = getBlockTargetIsOn(x, y, updatedX, updatedY);
      if (blockTargetIsOn !== null) {// ブロックが取得できた場合には、着地させる
        updatedY = blockTargetIsOn.y - IMG_SIZE; //地面で止まる
        isJump = false;
      }
    } else {  //ジャンプしていない状態でブロックが取得できなかったら
      if (getBlockTargetIsOn(x, y, updatedX, updatedY) === null) {
        isJump = true; //上のif文が適用される
        vy = 0;
      }
    }

    if (y > CANVAS_HEIGHT) { //下まで落ちたらゲームオーバー
      isGameOver = true;
      updatedY = CANVAS_HEIGHT; //一度その場所に固定
      vy = -15;
    }
  }

  x = updatedX;
  y = updatedY;

  if (!isGameOver) {
    for (const enemy of enemies) { // 敵との衝突判定を調査
      let isHit = isAreaOverlap(x, y, IMG_SIZE, IMG_SIZE, enemy.x, enemy.y, IMG_SIZE, IMG_SIZE);
      if(isHit) {//重なっていて
        if (isJump && vy > 0) { // ジャンプしていて、落下している状態で敵にぶつかった場合には
          vy = -7; //上向きのジャンプ
          enemy.y = CANVAS_HEIGHT;// 敵を消し去る(見えない位置に移動させる)
        } else {// ぞれ以外でぶつかっていた場合には
          isGameOver = true;  //ゲームオーバー
          vy = -10; //上に飛び上がる

        }
      }
    }

if (!isGameOver) {
    for (const obstacle of obstacles) { // 障害物との衝突判定を調査
      let isHit = isAreaOverlap2(x, y, IMG_SIZE, IMG_SIZE, obstacle.x, obstacle.y, IMG_SIZE, IMG_SIZE);
      if(isHit) {
          isGameOver = true;  //ゲームオーバー
          vy = -10; //上に飛び上がる
        }
      }
}

    isHit = isAreaOverlap(x, y, IMG_SIZE, IMG_SIZE, GOAL_X, GOAL_Y, IMG_SIZE, IMG_SIZE);
    if (isHit) {
      isGameClear = true;
    }
  }

  // ちいかわ（自キャラクター）の画像
  let image = new Image();
  image.src = "./img/chikawa.png";
  ctx.drawImage(image, x, y, IMG_SIZE, IMG_SIZE);

  // キメラ（敵）の画像
  let enemyImage = new Image();
  enemyImage.src = "./img/kimera.png";
  for (const enemy of enemies) {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, IMG_SIZE, IMG_SIZE);
  }

  // 障害物の画像
  let obstacleImage = new Image();
  obstacleImage.src = "./img/dakarananndattendayo.png";
  for (let i = 0; i < obstacles.length; i++) {
       let obstacle = obstacles[i];
      ctx.drawImage(obstacleImage, obstacle.x, obstacle.y,  IMG_SIZE, IMG_SIZE);
  }

  // ハチワレとうさぎ（ゴール）の画像
  image = new Image();
  image.src = "./img/goal.png";
  ctx.drawImage(image, GOAL_X, GOAL_Y, GOAL_IMG2, GOAL_IMG1);

  // 足場
  ctx.fillStyle = "orange";
  for (const block of blocks) {
    ctx.fillRect(block.x, block.y, block.w, block.h);
  }

  window.requestAnimationFrame(update);
}

// ブロック上に存在していればそのブロックの情報を、存在していなければnullを返す
function getBlockTargetIsOn(x, y, updatedX, updatedY) {
  for (const block of blocks) {
    //更新前はキャラ下部が地面以上かつ更新後はキャラ下部が地面以下
    if (y + IMG_SIZE <= block.y && updatedY + IMG_SIZE >= block.y) {
      if (//このifを満たす場合、ブロックがないので取得できない状態になる
        //キャラ右端 <= ブロック左端 またはキャラ左端 >= ブロック右端
        (x + IMG_SIZE <= block.x || x >= block.x + block.w) &&
        (updatedX + IMG_SIZE <= block.x || updatedX >= block.x + block.w)
      ) {
        // ブロックの上にいない場合には何もしない
        continue;
      }
      // ブロックの上にいる場合には、そのブロック要素を返す
      return block;
    }
  }// 最後までブロック要素を返さなかった場合(つまりすべてcontinue処理された場合)
  return null; //ブロック要素の上にいないということなのでnullを返す
}

// キャラの左上の角の座標を(cx, cy)、幅をcw, 高さをchとする
// 敵の左上の角の座標を(ex, ey)、幅をew, 高さをehとする
function isAreaOverlap(cx, cy, cw, ch, ex, ey, ew, eh) {
  if (ex + ew < cx) return false;  //キャラの左と敵の右
  if (cx + cw < ex) return false;  //キャラの右と敵の左
  if (ey + eh < cy) return false;  //キャラの上と敵の下
  if (cy + ch < ey) return false;  //キャラの下と敵の上
  return true;  // ここまで到達する場合には、どこかしらで重なる
}
// キャラの左上の角の座標を(cx, cy)、幅をcw, 高さをchとする
// 障害物の左上の角の座標を(ox, oy)、幅をow, 高さをohとする
function isAreaOverlap2(cx, cy, cw, ch, ox, oy, ow, oh) {
  if (ox + ow < cx) return false;  //キャラの左と障害物の右
  if (cx + cw < ox) return false;  //キャラの右と障害物の左
  if (oy + oh < cy) return false;  //キャラの上と障害物の下
  if (cy + ch < oy) return false;  //キャラの下と障害物の上
  return true;  // ここまで到達する場合には、どこかしらで重なる
}
