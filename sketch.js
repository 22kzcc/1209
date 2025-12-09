let spriteSheet;
let leftSprite; // 來自資料夾 (5/0.png )的精靈表
let upSprite; // 來自資料夾 4 的精靈表
let spaceSprite; // 來自資料夾 1/all.png（空白鍵使用） <-- 必須在 preload 中載入
let bgImage; // 背景圖片（背景/1.jpg）

// 資料夾 5 的單一幀尺寸：35 x 44
const FRAME_W = 35;
const FRAME_H = 44;
const TOTAL_FRAMES = 1;

// 空白鍵（資料夾 1/all.png）參數：每格 51x47，共 5 幀 (總寬度 255 / 5 幀 = 51)
const SPACE_FRAME_W = 51; // <-- 【修改】配合 255x47 / 5 幀
const SPACE_FRAME_H = 47; // <-- 【確認】配合 255x47
const SPACE_TOTAL_FRAMES = 5; // <-- 【確認】總幀數

// 左向精靈（2/all.png）參數：每格 40x45，共 3 幀
const LEFT_FRAME_W = 40;
const LEFT_FRAME_H = 45;
const LEFT_TOTAL_FRAMES = 3;

// 上向精靈（資料夾 4）參數：每格 46x46，共 3 幀
const UP_FRAME_W = 45;
const UP_FRAME_H = 46;
const UP_TOTAL_FRAMES = 3;

// 角色座標與速度
let playerX;
let playerY;
let groundY; // 地面高度
const MOVE_SPEED = 5;
const GRAVITY_SPEED = 8; // 掉落速度

// 第二個角色 (1-1/1.png) 的變數
let char2ImgDefault; // 貓咪預設圖片
let char2ImgAngry;   // 貓咪靠近時的圖片
let char2X;
let char2Y;
let char2FlipH = false; // 是否水平翻轉
const CHAR2_W = 52;
let char2Direction = 0; // 貓咪移動方向: -1 左, 1 右, 0 停
let char2MoveTimer = 0; // 計時器，決定何時改變方向
const CHAR2_SCALE = 3.5; // 貓咪的縮放比例

const FRAME_DELAY = 7; // 切換間隔（以 draw() 的 frame 計數為單位）

function preload() {
  spriteSheet = loadImage('5/0.png');
  // 載入位於資料夾 2 的 all.png（按左鍵時使用）
  leftSprite = loadImage('2/all.png');

  // 【新增】載入向上動畫精靈表 (假設為 4/all.png)
  upSprite = loadImage('4/all.png');
  
  // 【新增】載入空白鍵攻擊精靈表 (1/all.png)
  spaceSprite = loadImage('1/all.png');
  
  // 載入背景圖片（背景/1.jpg）
  bgImage = loadImage('背景/1.jpg');

  // 載入第二個角色的圖片
  char2ImgDefault = loadImage('1-1/1.png');
  char2ImgAngry = loadImage('1-1/2.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  // 初始位置置中（水平），下方（垂直）
  groundY = height * 0.7;
  playerX = width / 2;
  playerY = groundY;

  // 設定第二個角色的初始位置
  char2X = width / 2 + 150;
  char2Y = groundY; // 與精靈站在相同的高度
}

function draw() {
  // 背景圖片：背景/1.jpg
  background(bgImage);  // 選擇要顯示的精靈表與參數：預設使用 spriteSheet (5/0.png)
  let img = spriteSheet;
  let fw = FRAME_W;
  let fh = FRAME_H;
  let tf = TOTAL_FRAMES;
  let flipH = false; // 是否水平反轉

  // --- 決定精靈動畫 ---
  // 優先權 1: 按住空白鍵時使用攻擊動畫
  if (keyIsDown(32) && spaceSprite) { // 這裡會切換到 1/all.png 的參數
    img = spaceSprite;
    fw = SPACE_FRAME_W;
    fh = SPACE_FRAME_H;
    tf = SPACE_TOTAL_FRAMES;
  }
  // 優先權 2: 如果在空中，使用飛行動畫
  else if (playerY < groundY && upSprite) {
    img = upSprite;
    fw = UP_FRAME_W;
    fh = UP_FRAME_H;
    tf = UP_TOTAL_FRAMES;
    // 在空中時，也根據方向鍵決定是否翻轉
    if (keyIsDown(RIGHT_ARROW)) {
      flipH = true;
    }
  }
  // 優先權 3: 在地面上移動
  else if (keyIsDown(LEFT_ARROW) && leftSprite) {
    img = leftSprite;
    fw = LEFT_FRAME_W;
    fh = LEFT_FRAME_H;
    tf = LEFT_TOTAL_FRAMES;
    flipH = false; // 確保向左時不翻轉
  }
  else if (keyIsDown(RIGHT_ARROW) && leftSprite) {
    img = leftSprite;
    fw = LEFT_FRAME_W;
    fh = LEFT_FRAME_H;
    tf = LEFT_TOTAL_FRAMES;
    flipH = true;
  }

  // 計算目前幀
  const idx = floor(frameCount / FRAME_DELAY) % tf;
  const sx = idx * fw;
  const sy = 0;

  // 放大四倍
  const SCALE = 4;
  const drawW = fw * SCALE;
  const drawH = fh * SCALE;

  // 按住左鍵時移動
  if (keyIsDown(LEFT_ARROW)) {
    playerX -= MOVE_SPEED;
  }

  // 按住右鍵時移動
  if (keyIsDown(RIGHT_ARROW)) {
    playerX += MOVE_SPEED;
  }

  // 按住上鍵時移動
  if (keyIsDown(UP_ARROW)) {
    playerY -= MOVE_SPEED;
  }

  // 如果沒按上鍵且角色在空中，則往下掉
  if (!keyIsDown(UP_ARROW) && playerY < groundY) {
    playerY += GRAVITY_SPEED; // 使用更快的掉落速度
    playerY = min(playerY, groundY); // 確保不會掉穿地面
  }

  // 邊界限制（確保不會移出畫面）
  playerX = constrain(playerX, drawW / 2, width - drawW / 2);
  playerY = constrain(playerY, drawH / 2, height - drawH / 2);

  // --- 貓咪 AI 與移動邏輯 ---
  const proximityThreshold = (drawW / 2) + (CHAR2_W * CHAR2_SCALE / 2) + 30;
  const d = dist(playerX, playerY, char2X, char2Y);
  const isPlayerNear = d < proximityThreshold;

  if (isPlayerNear) {
    char2Direction = 0; // 靠近時停下來
  } else {
    // 遠離時：隨機閒逛
    if (frameCount > char2MoveTimer) {
      char2Direction = random([-1, 0, 1]);
      char2MoveTimer = frameCount + random(60, 180);
    }
  }

  char2X += char2Direction * (MOVE_SPEED / 2);
  if (char2Direction === -1) char2FlipH = true;
  if (char2Direction === 1) char2FlipH = false;

  const char2DrawW = CHAR2_W * CHAR2_SCALE;
  char2X = constrain(char2X, char2DrawW / 2, width - char2DrawW / 2);

  // 2. 繪製貓咪 (在精靈後面)
  let catImgToDraw = isPlayerNear ? char2ImgAngry : char2ImgDefault;

  if (catImgToDraw) {
    const char2DrawH = catImgToDraw.height * CHAR2_SCALE;
    push();
    translate(char2X, char2Y);
    if (char2FlipH) {
      scale(-1, 1);
    }
    image(catImgToDraw, -char2DrawW / 2, -char2DrawH / 2, char2DrawW, char2DrawH);
    pop();
  }

  // 繪製在 playerX/playerY（靠左下對齊改為置中）
  push();
  translate(playerX, playerY);
  if (flipH) {
    scale(-1, 1);
  }
  // 使用 image(img, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight)
  image(img, -drawW / 2, -drawH / 2, drawW, drawH, sx, sy, fw, fh);
  pop();

  // 4. 繪製對話泡泡 (在最上層)
  if (isPlayerNear) {
    const bubbleText = "想問什麼問題嗎喵喵喵~";
    const buttonText = "是的喵喵";
    const bubblePadding = 15;
    const bubbleYOffset = 110;
    const bubbleTailSize = 10;
    const char2DrawH = char2ImgDefault.height * CHAR2_SCALE;

    push();
    // --- 計算尺寸 ---
    textSize(16);
    // 泡泡寬度以較長的文字為準
    const bubbleWidth = max(textWidth(bubbleText), textWidth(buttonText)) + bubblePadding * 2;
    const bubbleHeight = 80; // 增加高度以容納按鈕
    const bubbleX = char2X - bubbleWidth / 2;
    const bubbleY = char2Y - bubbleYOffset - char2DrawH / 2;

    // --- 按鈕尺寸與位置 ---
    const buttonH = 30;
    const buttonW = textWidth(buttonText) + bubblePadding;
    const buttonX = char2X - buttonW / 2;
    const buttonY = bubbleY + 40;

    // --- 繪製泡泡主體 ---
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);
    // 繪製尾巴
    triangle(
      char2X - bubbleTailSize, bubbleY + bubbleHeight - 1,
      char2X + bubbleTailSize, bubbleY + bubbleHeight - 1,
      char2X, bubbleY + bubbleHeight + bubbleTailSize
    );

    // --- 繪製按鈕 (含滑鼠懸停效果) ---
    let isHovering = (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH);
    if (isHovering) {
      fill(220); // 滑鼠移上時變灰色
    } else {
      fill(255); // 預設白色
    }
    rect(buttonX, buttonY, buttonW, buttonH, 10); // 繪製按鈕矩形
    
    // --- 繪製所有文字 ---
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(bubbleText, char2X, bubbleY + 20); // 主要文字
    text(buttonText, char2X, buttonY + buttonH / 2); // 按鈕文字
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 更新地面高度
  groundY = height * 0.7;
}