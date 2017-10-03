var canvas = document.getElementById("canvas");
canvas.width = 1140;
canvas.height = 800;
var dateTitle = {};
var dateArr = [];
var taskArr = [];

var ctx = canvas.getContext("2d");
function drawLine(ctx, startX, startY, endX, endY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
};

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
};

var Barchart = function (options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    this.draw = function () {
        var maxValue = 0;
        for (var categ in this.options.data) {
            maxValue = Math.max(maxValue, this.options.data[categ]);
        }
        var canvasActualHeight = this.canvas.height - this.options.padding * 2;
        var canvasActualWidth = this.canvas.width - this.options.padding * 2;

        //drawing the grid lines
        var gridValue = 0;
        while (gridValue <= maxValue) {
            var gridY = canvasActualHeight * (1 - gridValue / maxValue) + this.options.padding;
            drawLine(
                this.ctx,
                0,
                gridY,
                this.canvas.width,
                gridY,
                this.options.gridColor
            );

            //writing grid markers
            this.ctx.save();
            this.ctx.fillStyle = this.options.gridColor;
            this.ctx.font = "bold 10px Arial";
            this.ctx.fillText(gridValue, 10, gridY - 2);
            this.ctx.restore();

            gridValue += this.options.gridScale;
        }

        //drawing the bars
        var barIndex = 0;
        var numberOfBars = Object.keys(this.options.data).length;
        var barSize = (canvasActualWidth) / numberOfBars;

        for (categ in this.options.data) {
            var val = this.options.data[categ];
            var barHeight = Math.round(canvasActualHeight * val / maxValue);
            drawBar(
                this.ctx,
                this.options.padding + barIndex * barSize,
                this.canvas.height - barHeight - this.options.padding,
                barSize,
                barHeight,
                this.colors[barIndex % this.colors.length]
            );

            barIndex++;
        }

    }
};
var myVinyls = {
    "Classical music": 10,
    "Alternative rock": 14,
    "Pop": 2,
    "Jazz": 12
};
// var options = {
//     canvas: document.getElementById('canvas'),
//     padding: 10,
//     gridScale: 5,
//     gridColor: "#eeeeee",
//     data: myVinyls,
//     colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743"]
// };
//drawing series name
// this.ctx.save();
// this.ctx.textBaseline = "bottom";
// this.ctx.textAlign = "center";
// this.ctx.fillStyle = "#000000";
// this.ctx.font = "bold 14px Arial";
// this.ctx.fillText(this.options.seriesName, this.canvas.width / 2, this.canvas.height);
// this.ctx.restore();

// var myBarchart = new Barchart(options);
// myBarchart.draw();

document.getElementById('chartLink').addEventListener('click', function () {

    resetCanvas();
    var projectId = this.getAttribute('data_project_id');
    if (projectId > 0) {

        var headerConfig = {
            "Content-type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        };
        var url = BASE_URL + '/sections';

        var reqObj = {
            projectId: projectId
        };
        var _document = document;
        var _this = this;
        var options = {
            canvas: document.getElementById('canvas'),
            ctx: document.getElementById('canvas').getContext('2d'),
            padding: 30,
            gridScale: 5,
            fontSize: 25,
            cellWidth: 40,
            cellHeight: 30,
            gridColor: "#eeeeee",
            beginPntX: 10,
            beginPntY: 20,
            type: '',
            project: '',
            data: {},
            series: [{index:1, value:'TO DO'},{index:2, value:'In process - begin < 25%'} ,{index:9, value:'In process - midlle < 50%'} , {index:5, value:'In process - upper middle < 75%'}, {index:6, value:'In process - end < 90%'},{index:7, value:'Testing < 99%'} , {index:4, value:'Done 100%'},{index:8, value:'Await'} ,{index:3, value:'Pending'} ],
            colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743"]
        };
        var settings = {};

        // var ctx = options.canvas.getContext('2d');
        callAjax('POST', url, headerConfig, reqObj, function (data) {

            if (data.data.length == 0) {
                console.log('No data for this project');
            }
            else {
                console.log(data.data);
                var dateCollection = getDateCollection(data.data);
                var maxLength = getMaxLengthText(data.data);// get the longest task
                var taskCellWidth = Math.round(ctx.measureText(maxLength).width) + 2 * options.padding;

                canvas.width = taskCellWidth*dateCollection.length  + 2* options.padding+50;
                canvas.height =10* options.cellHeight*data.data.length;
                options.data = dateCollection;
                options.cellWidth = taskCellWidth;
                options.type = 'title';
                //options.cellHeight = 30;
                options.beginPntX += taskCellWidth;
                options.project = data.data[0].title;
                drawTitle(options, taskCellWidth, dateCollection);

                options.type = 'date';
                options.cellHeight += 30;
                drawDateCollection(options);

                for (var i = 0; i < data.data.length; i++) {

                    var item = data.data[i];
                    var sectionId = item.sectionId;
                    var len = data.data.length - 1;
                    //while(item.sectionId == )
                    if (i > 0 && item.sectionId == data.data[i - 1].sectionId) {
                        options.type = 'task';
                        // options.beginPntX = 50;
                        options.beginPntY += 30;
                        options.data = item;
                        options.color = setTaskStatus(item.statusId.toString());
                        drawTask(options);
                    }
                    else {
                        // if (i == 0) {
                        //     options.beginPntY += 48;
                        // }
                        options.type = 'task';
                        // options.beginPntX = 30;
                        options.beginPntY += 30;
                        options.data = item;
                        options.color = setTaskStatus(item.statusId.toString());
                        options.beginPntY += 48;
                        drawSection(options);
                        options.beginPntY += 30;
                        drawTask(options);
                    }
                }//end for
                drawLegend(options);
            }//else
        });//end ajax
    }//end if
});

function getMaxLengthText(dataArray) {

    if (dataArray.length > 0) {
        var max = dataArray[0].task;
        for (var i = 0; i < dataArray.length; i++) {
            if (max < dataArray[i].task)
                max = dataArray[i].task;
        }
        return max;
    }
    else return 0;
};

function sortDate(dateCollection) {
    var sorted = [];
    sorted = dateCollection.sort().filter(function (elem, index, arr) {
        if ((elem != arr[index + 1]) && index <= arr.length - 1)
            return elem;
    });
    return sorted;
};

function getDateCollection(data) {

    var dateCollection = [];
    console.log(data)
    for (var i = 0; i < data.length; i++) {
        if (i == data.length - 1) {
            dateCollection.push(data[i].now.split('T')[0]);
            dateCollection.push(data[i].prStartDate.split('T')[0]);
            dateCollection.push(data[i].prDueDate.split('T')[0]);
        }
        dateCollection.push(data[i].startDate.split('T')[0]);
        dateCollection.push(data[i].dueDate.split('T')[0]);
    }
    var dateColl = sortDate(dateCollection);
    return dateColl;
};


function drawDateCollection(options) {

    //  var cellHeight = 50;
    var y = options.strPntY;

    // drawLine(ctx, x, y, x * (dateCollection.length - 1), y, color);
    for (var i = 0; i < options.data.length; i++) {
        //  var maxLength = getMaxLengthText(dateCollection[i]);
        var max = options.data.filter(function (item, index, arr) {
            var max = item;
            if (item > arr[index + 1] && index <= arr.length - 1)
                max = item;
            return max;
        });

        var cellWidth = Math.round(ctx.measureText(options.data[0]).width) + 2 * options.padding;
        //  var x = cellWidth;
        var totalWidth = cellWidth * options.data.length + (2 * options.padding);
        var x = options.beginPntX;
        var y = options.beginPntY;

        ctx.font = '15px Calibri';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'black';

        switch (options.type) {

            case 'date': dataTitle = {
                data: options.data[i],
                strPntX: x * (i + 1),
                strPntY: y
            };
                dateArr.push(dataTitle);
                ctx.rect(dataTitle.strPntX + options.cellWidth, dataTitle.strPntY, dataTitle.strPntX + options.cellWidth, options.cellHeight);
                break;

            case 'title': dataTitle = {
                data: options.data[i],
                strPntX: x * (i + 1),
                strPntY: y
            };
                dateArr.push(dataTitle);
                ctx.rect(dataTitle.strPntX, dataTitle.strPntY, dataTitle.strPntX + totalWidth, options.cellHeight);
                ctx.fillText(options.project, dataTitle.strPntX + options.padding, dataTitle.strPntY + options.padding, options.cellHeight);
                ctx.stroke();
                return;
                break;

            case 'task': dataTitle = {
                data: options.data[i],
                strPntX: x,
                strPntY: y * (i + 1)
            };
                taskArr.push(dataTitle);
                ctx.rect(dataTitle.strPntX, dataTitle.strPntY, dataTitle.strPntX + cellWidth, options.cellHeight);
                break;
        }
        ctx.fillText(options.data[i], dataTitle.strPntX + options.padding + options.cellWidth, dataTitle.strPntY + options.padding, options.cellHeight);
        ctx.stroke();
    }
};

function drawTitle(options, dateCollection, taskCellWidth) {

    ctx.save();
    ctx.font = '20px Calibri';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#161c2b';
    ctx.strokeStyle = 'black';
    ctx.rect(options.strPntX + options.padding, options.strPntY, taskCellWidth * dateCollection.length + 2 * options.padding, options.cellHeight);
    ctx.fillText(options.project, options.beginPntX, options.beginPntY);
    ctx.restore();

};

function drawTask(options) {

    ctx.save();
    ctx.font = '18px Calibri';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'black';
    ctx.textBaseline = 'hanging';
    // ctx.fillRect(options.strPntX, options.strPntY, options.cellWidth, options.cellHeight);
    ctx.rect(options.strPntX, options.strPntY, options.cellWidth, options.cellHeight);
    ctx.fillText(options.data.task, options.beginPntX, options.beginPntY);
    ctx.restore();

    var start = findCoordinates(dateArr, options.data.startDate.split('T')[0]);
    var upperLeftCornerX = start.strPntX;
    var upperLeftCornerY = options.beginPntY;
    var end = findCoordinates(dateArr, options.data.dueDate.split('T')[0]);
    var upperRightCornerX = end.strPntX;

    var width = end.strPntX - start.strPntX;
    var height = options.cellHeight
    var color = options.color;
    var level = parseInt(options.data.level);
    var barWidth = Math.round(((level / 100) * width));
    drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height / 2, 'lightgrey');
    drawBar(ctx, upperLeftCornerX, upperLeftCornerY, barWidth, height / 2, color)
};

function drawSection(options) {
    ctx.save();
    ctx.font = '20px Calibri';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#161c2b';
    ctx.strokeStyle = 'black';
    ctx.rect(options.strPntX, options.strPntY, options.cellWidth, options.cellHeight);
    ctx.fillText(options.data.section, options.beginPntX, options.beginPntY);
    ctx.restore();
};

function findCoordinates(data, date) {

    for (var i = 0; i < data.length; i++) {
        if (data[i].data == date)
            return data[i];
    }
};
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function drawLegend(options) {
    ctx.save();
    ctx.textBaseline = "hanging";
    ctx.textAlign = "left";
    ctx.fillStyle = "#30333c";
    ctx.font = "bold 14px Arial";
    ctx.fillText('Legend', canvas.width / 2, canvas.height * 2 /3);
    var height = canvas.height * 2 / 3;
    for (var i = 0; i < options.series.length; i++) {
      var item = options.series[i];
        ctx.save();
        height += 40;
        ctx.fillStyle = setTaskStatus(item.index.toString());
        ctx.fillRect(canvas.width / 2 -35, height, 30, 30);
        ctx.fillStyle = "#30333c";
        ctx.fillText(item.value, canvas.width / 2, height);
        ctx.restore();
    }
    ctx.restore();
};
//ctx.measureText(txt).width - get canvas mesure text
// context.font = '30pt Calibri';
// context.textAlign = 'center';
// context.fillStyle = 'blue';
// context.fillText(text, x, y);

// // get text metrics
// var metrics = context.measureText(text);
// var width = metrics.width;
// context.font = '20pt Calibri';
// context.textAlign = 'center';
// context.fillStyle = '#555';
// context.fillText('(' + width + 'px wide)', x, y + 40);
