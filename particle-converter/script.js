var fileInput = document.getElementById("input-file");
var inputStatus = document.getElementById("input-status");
var img = document.getElementById("display-input-img");
var imgSizeDisp = document.getElementById("img-size-disp");
var resizeSwitch = document.getElementById("resize-switch");
var resizeYokoRadio = document.getElementById("radio-resize-yoko");
var resizeTateRadio = document.getElementById("radio-resize-tate");
var resizeInputText = document.getElementById("resize-type-text");
var inputResizeSize = document.getElementById("input-resize-size");
var resizedSizeText = document.getElementById("resized-size-text");
var yokoRadio = document.getElementById("radio-yoko");
var tateRadio = document.getElementById("radio-tate");
var radioChangeText = document.getElementById("radio-change-text");
var sizeInput = document.getElementById("sizeInput");
var sizeOutput = document.getElementById("calculated-size");
var sizeAlert = document.getElementById("size-alert");
var pxAlert = document.getElementById("px-alert");
var partSpeed = document.getElementById("partSpeed");
var partCount = document.getElementById("partCount");
var partType = document.getElementById("partType");
var positionImg = document.getElementById("position-img");
var positionLeft = document.getElementById("position-left");
var positionCenter = document.getElementById("position-center");
var positionRight = document.getElementById("position-right");
var positionLeftImg = document.getElementById("position-left-img");
var positionCenterImg = document.getElementById("position-center-img");
var positionRightImg = document.getElementById("position-right-img");
var hiddenPx = document.getElementById("hidden-px");
var hiddenColorCheck = document.getElementById("hidden-color-check");
var hiddenColorPicker = document.getElementById("hidden-color-picker");
var hiddenColorMargin = document.getElementById("hidden-color-margin");
var convertBtn = document.getElementById("convert-btn");
var statusText = document.getElementById("status-text");
var statusBar = document.getElementById("status-bar");
var cancelButton = document.getElementById("cancel-button");
var imgFile;
var imgX;
var imgY;
var blockX;
var blockY;
var cdBlockX;
var cdBlockY;
var checkRes = false;
var pxInterval;
var canvas;
var context;
var worker = new Worker('worker.js');
disabledResize(true);
hiddenColorPicker.disabled = hiddenColorMargin.disabled = !hiddenColorCheck.checked;
cancelButton.style.visibility = "hidden";
canvas = document.createElement('canvas');
context = canvas.getContext('2d');
fileInput.addEventListener('change', (event) => {
    imgFile = event.target.files[0];
    if (!imgFile) {
        inputStatus.textContent = "";
        pxAlert.textContent = "";
        statusText.textContent = "";
        return;
    }
    inputStatus.textContent = "お待ちください...";
    inputStatus.style.color = "#cc9900";
    inputStatus.style.fontWeight = "bold";
    var imgReader = new FileReader();
    imgReader.readAsDataURL(imgFile);
    imgReader.onload = (event) => {
        img.src = event.target.result;
        positionImg.src = event.target.result;
        img.onload = () => {
            imgX = img.naturalWidth;
            imgY = img.naturalHeight;
            imgSizeDisp.textContent = `横 ${imgX}px / 縦 ${imgY}px`;
            canvas.width = imgX;
            canvas.height = imgY;
            calculateResizeSize();
            inputStatus.textContent = "読み込まれた画像";
            inputStatus.style.color = "white";
            inputStatus.style.fontWeight = "normal"; 
        }
    }
});
resizeSwitch.addEventListener('change', () => {
    disabledResize(!resizeSwitch.checked);
    calculateResizeSize();
    if (!resizeSwitch.checked) {
        canvas.width = imgX;
        canvas.height = imgY;
        resizedSizeText.textContent = "";
    }
});
resizeYokoRadio.addEventListener('change', () => {
    resizeInputText.textContent =  "横のピクセル数";
    calculateResizeSize();
});
resizeTateRadio.addEventListener('change', () => {
    resizeInputText.textContent =  "縦のピクセル数";
    calculateResizeSize();
});
inputResizeSize.addEventListener('change', () => {
    calculateResizeSize();
});
yokoRadio.addEventListener('change', () => {
    radioChangeText.textContent = "横";
    calculateBlockSize();
});
tateRadio.addEventListener('change', () => {
    radioChangeText.textContent = "縦";
    calculateBlockSize();
});
sizeInput.addEventListener('change', () => {
    calculateBlockSize();
});
positionLeft.addEventListener('change', changePositionRadio);
positionCenter.addEventListener('change', changePositionRadio);
positionRight.addEventListener('change', changePositionRadio);
function changePositionRadio() {
    if (positionLeft.checked) {
        positionLeftImg.style.visibility = "visible"
        positionCenterImg.style.visibility = positionRightImg.style.visibility = "hidden";
    }
    if (positionCenter.checked) {
        positionCenterImg.style.visibility = "visible";
        positionLeftImg.style.visibility = positionRightImg.style.visibility = "hidden";
    }
    if (positionRight.checked) {
        positionRightImg.style.visibility = "visible";
        positionLeftImg.style.visibility = positionCenterImg.style.visibility = "hidden";
    }
}
hiddenColorCheck.addEventListener('change', () => {
    hiddenColorPicker.disabled = hiddenColorMargin.disabled = !hiddenColorCheck.checked;
});
convertBtn.addEventListener('click', () => {
        if(!imgFile) {
            alert("画像が指定されていませんわ〜");
            return;
        }
        if (imgX == 0 || imgY == 0) {
            alert("データがおかしいですわ〜");
            return;
        }
        var commands = [];
        var position;
        calculateBlockSize();
        if(!checkRes) {
            alert("解像度が範囲外ですわ〜");
            return;
        }
        disabledAll(true);
        statusText.textContent = "画像読み込み中...";
        if (positionRight.checked) {
            position = 'right';
        } else {
            if (positionCenter.checked) {
                position = 'center';
            } else position = 'left';
        }
        commands.push("#「画像をパーティクルに変換するかも分からん」@Jyormany で作成");
        commands.push("#>>>https://jyormany.github.io/particle-converter/");
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.width = canvas.width;
        context.height = canvas.height;
        var pxsRawData = context.getImageData(0,0,canvas.width,canvas.height);
        cancelButton.style.visibility = "visible";
        worker.postMessage([pxsRawData, pxInterval,
             partSpeed.value, partCount.value, partType.value, position, hiddenPx.checked, 
             hiddenColorCheck.checked, hiddenColorPicker.value, hiddenColorMargin.value, commands]);
});
cancelButton.addEventListener('click', () => {
    worker.terminate();
    statusText.textContent = "中断しました";
    statusText.style.fontWeight = "bold";
    statusText.style.color = "#FF7777";
    statusBar.style.backgroundColor = "#372600";
    cancelButton.style.visibility = "hidden";
    disabledAll(false);
});
worker.addEventListener('message', (e) => {
    switch (Object.prototype.toString.call(e.data)) {
        case '[object Number]': {
            statusText.textContent = `変換中... ${e.data}%完了`;
            statusBar.style.width = `${e.data}%`;
            break;
        }
        case '[object Array]': {
            cancelButton.style.visibility = "hidden";
            statusText.textContent = "ファイル生成中";
            var convertedCommands = e.data;
            if (convertedCommands.length <= 2) alert("エラーが発生しているかも分からん...\n生成されたファイルの中身をチェックするのは誰でもできますねぇ");
            var blob = new Blob([convertedCommands.join("\n")], {type:"text/txt"});
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "img_to_particles.mcfunction";
            link.click();
            statusText.textContent = "変換完了！";
            statusBar.style.width = `100%`;
            URL.revokeObjectURL(imgFile.URL);
            disabledAll(false);
        }
    }
});
function calculateResizeSize() {
    if (imgFile) {
        if (resizeSwitch.checked) {
            var inputSize;
            inputSize = inputResizeSize.value;
            if (resizeYokoRadio.checked) {
                canvas.width = inputSize;
                canvas.height = (inputSize / imgX) * imgY;
            } else {
                canvas.height = inputSize;
                canvas.width = (inputSize / imgY) * imgX;
            }
            resizedSizeText.textContent = `〈リサイズ後のサイズ = 横 ${canvas.width}px / 縦 ${canvas.height}px〉`
        } else {
            canvas.width = imgX;
            canvas.height = imgY;
            resizedSizeText.textContent = "";
        }
    }
    calculateBlockSize();
}
function calculateBlockSize() {
    statusText.textContent = "";
    statusBar.style.backgroundColor = "#dd9900";
    statusText.style.fontWeight = "nomal";
    if (!imgFile) return;
    var inputSize = sizeInput.value;
    if (yokoRadio.checked) {
        blockX = inputSize;
        blockY = (inputSize / imgX) * imgY;
    } else {
        blockY = inputSize;
        blockX = (inputSize / imgY) * imgX;
    }
    if (canvas.width * canvas.height >= 10000) {
        sizeAlert.textContent = "";
    }
    checkRes = true;
    if ((canvas.width/blockX) < 1) {
        checkRes = false;
        sizeAlert.textContent = "1ブロックあたりの表示px数が1未満のため変換できません";
    } else {
        if ((canvas.width/blockX) > 50) {
            checkRes = false;
            sizeAlert.textContent = "1ブロックあたりの表示ピクセル数が50を超えているため変換できません";
        } else {
            sizeAlert.textContent = "";
        }
    }
    pxInterval = Math.round(Math.round(blockX / canvas.width * 500)/10) / 50;
    blockX = Math.round((pxInterval * canvas.width) * 100) / 100;
    blockY = Math.round((pxInterval * canvas.height) * 100) / 100;
    sizeOutput.textContent = `横 ${blockX}ブロック / 縦 ${blockY}ブロック // ${1/pxInterval}ppb`;
    if (canvas.width * canvas.height > 50000) {
        pxAlert.textContent = `〈表示される最大のパーティクル数 : ${(canvas.width * canvas.height).toLocaleString()}個 (透過pxも含む) <- 5万を超えています リサイズ等での調整をお勧めします〉`;
        pxAlert.style.color = "#FFFF00";
    } else {
        pxAlert.textContent = `〈表示される最大のパーティクル数 : ${(canvas.width * canvas.height).toLocaleString()}個 (透過pxも含む)〉`;
        pxAlert.style.color = "#FFFFFF";
    }
}
function disabledResize(setBool) {
    resizeYokoRadio.disabled = setBool;
    resizeTateRadio.disabled = setBool;
    inputResizeSize.disabled = setBool;
}
function disabledAll(setBool) {
    fileInput.disabled = setBool;
    resizeSwitch.disabled = setBool;
    yokoRadio.disabled = setBool;
    tateRadio.disabled = setBool;
    sizeInput.disabled = setBool;
    partSpeed.disabled = setBool;
    partCount.disabled = setBool;
    partType.disabled = setBool;
    positionLeft.disabled = setBool;
    positionCenter.disabled = setBool;
    positionRight.disabled = setBool;
    hiddenPx.disabled = setBool;
    hiddenColorCheck.disabled = setBool;
    hiddenColorPicker.disabled = setBool;
    convertBtn.disabled = setBool;
    if (!setBool && resizeSwitch.checked) disabledResize(setBool);
    if (!setBool && hiddenColorCheck.checked) {
        hiddenColorPicker.disabled = hiddenColorMargin.disabled = false;
    } else {
        hiddenColorPicker.disabled = hiddenColorMargin.disabled = true;
    }
}
