self.addEventListener('message', (e) => {
    var nextXPos = 0;
    var nextYPos = 0;
    var pxsRawData = e.data[0].data;
    var pxInterval = e.data[1];
    var partSpeed = e.data[2];
    var partCount = e.data[3];
    var partType = e.data[4];
    var position = e.data[5];
    var hiddenPx = e.data[6];
    var hiddenColorCheck = e.data[7];
    var hiddenColor = e.data[8];
    var hiddenColorMargin = e.data[9];
    var commands = e.data[10];
    var count = 0;
    var hdMaxR = checkMVal(parseInt(hiddenColor.substring(1, 3), 16) + hiddenColorMargin);
    var hdMinR = checkMVal(parseInt(hiddenColor.substring(1, 3), 16) - hiddenColorMargin);
    var hdMaxG = checkMVal(parseInt(hiddenColor.substring(3, 5), 16) + hiddenColorMargin);
    var hdMinG = checkMVal(parseInt(hiddenColor.substring(3, 5), 16) - hiddenColorMargin);
    var hdMaxB = checkMVal(parseInt(hiddenColor.substring(5, 7), 16) + hiddenColorMargin);
    var hdMinB = checkMVal(parseInt(hiddenColor.substring(5, 7), 16) - hiddenColorMargin);
    function checkMVal(value) {
        value = Math.round(value);
        if (value >= 255) return 255;
        if (value <= 0) return 0;
        return value;
    }
    var width = e.data[0].width;
    var height = e.data[0].height;
    var pxsData = [];
    var convPxRawDataPos = width * height * 4 - 1;
    for (var i = 0; i < height; i++) {
        var lineData = [];
        for (var j = 0; j < width; j++){
            var r = pxsRawData[convPxRawDataPos-3];
            var g = pxsRawData[convPxRawDataPos-2];
            var b = pxsRawData[convPxRawDataPos-1];
            var a = pxsRawData[convPxRawDataPos];
            switch (position) {
                case 'right':
                case 'center':
                    lineData.push([r,g,b,a]);
                    break;
                case 'left':
                default:
                    lineData.unshift([r,g,b,a]);
            }
            convPxRawDataPos -= 4;
        }
        pxsData.push(lineData);
    }
    var pSize = 0.5;
    if (pxInterval < 0.1) {
    pSize = pxInterval * 5;
    }
    if (pxInterval >= 0.1 && pxInterval < 0.2) {
        pSize = pxInterval * 15 - 1;
    }
    if (pxInterval >= 0.2) {
        pSize = pxInterval * 2.5 + 1.5;
    }
    switch (position) {
        case 'center':
            var firstXPos = Math.round(pxInterval * width / 2 * 100) / 100;
            break;
        case 'right':
        case 'left':
        default:
            var firstXPos = 0;
    }
    var nextXPos;
    for (var line of pxsData) {
        nextXPos = firstXPos;
        for (var pxData of line) {
            if (!(((hiddenPx)&&(pxData[3]<=127))||((hiddenColorCheck)&&(hdMinR<=pxData[0])&&(pxData[0]<=hdMaxR)&&(hdMinG<=pxData[1])&&(pxData[1]<=hdMaxG)&&(hdMinB<=pxData[2])&&(pxData[2]<=hdMaxB)))) {
                var pxR = Math.round(pxData[0] / 255 * 1000) / 1000;
                var pxG = Math.round(pxData[1] / 255 * 1000) / 1000;
                var pxB = Math.round(pxData[2] / 255 * 1000) / 1000;
                if (nextXPos == 0) {
                    var XPos = "";
                } else {
                    var XPos = Math.round(nextXPos * 100) / 100;
                }
                if (nextYPos == 0) {
                    var YPos = "";
                } else {
                    var YPos = Math.round(nextYPos * 100) / 100;
                }
                var commandLine = `particle minecraft:dust ${pxR} ${pxG} ${pxB} ${pSize} ^${XPos} ^${YPos} ^ 0 0 0 ${partSpeed} ${partCount} ${partType}`
                commands.push(commandLine);
            }
            switch (position) {
                case 'right':
                case 'center':
                    nextXPos -= pxInterval;
                    break;
                case 'left':
                default:
                    nextXPos += pxInterval;
            }
        }
        nextYPos += pxInterval;
        self.postMessage(Math.round(count / pxsData.length * 10000) / 100);
        count++;
    }
    self.postMessage(commands);
});
