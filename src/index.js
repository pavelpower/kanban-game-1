import $ from "jquery";
import Board from "./board.js";

let config = {
    backlogSize: 100,
    stages: [
        {
            name: "backlog",
            diceCount: 0,
            limit: 100,
            isStart: true,
            isUnlimitedDone: false
        },
        {
            name: "analysis",
            diceCount: 2,
            limit: 2,
            isStart: false,
            isUnlimitedDone: false
        },
        {
            name: "development",
            diceCount: 1,
            limit: 4,
            isStart: false,
            isUnlimitedDone: false
        },
        {
            name: "testing",
            diceCount: 2,
            limit: 3,
            isStart: false,
            isUnlimitedDone: true
        }
    ]
};
let board = new Board(config);

$(function () {
    draw();
});

$("#start-stop").click(() => {
    isPlaying = !isPlaying;
    $("#start-stop").prop("value", isPlaying ? "Stop" : "Start");
    if (isPlaying) {
        draw();
    }
});

let isPlaying = false;
let shiftX = 10;
let shiftY = 10;
let widthBoard = 1600;
let heightBoard = 950;
let colors = {
    "text": "#000",
    "border": "#cccccc",
    "cardBorder": "#333333",
    "backlog": "#b800dd",
    "analysis": "#ce1212",
    "development": "#1266cf",
    "testing": "#008100",
    "deployed": "#000000"
};

function draw() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        let data = isPlaying ? board.turn() : board.view();
        ctx.clearRect(shiftX, shiftY, widthBoard, heightBoard);
        let specs = drawBoard(ctx, widthBoard, heightBoard, shiftX, shiftY, config);
        let allCards = [
            data.columns.backlog.done.slice(0, 6),
            data.columns.analysis.wip,
            data.columns.analysis.done,
            data.columns.development.wip,
            data.columns.development.done,
            data.columns.testing.wip,
            data.columns.testing.done.slice(0, 6),
        ];
        for (let i = 0; i < allCards.length; i++) {
            for (let j = 0; j < allCards[i].length; j++) {
                drawCard(ctx, specs.laneWidth, specs.laneHeight, specs.standardLaneLevel, i, j, allCards[i][j])
            }
        }
        if (data.columns.testing.done.length < config.backlogSize && isPlaying) {
            setTimeout(draw, 500);
        }

    }
}

function drawBoard(ctx, widthBoard, heightBoard) {
    let spec = {
        "laneWidth": widthBoard / 8,
        "laneHeight": heightBoard * 0.1,
        "columnLabelLevel": heightBoard * 0.03,
        "columnMinorLabelLevel": heightBoard * 0.06,
        "wipLabelLevel": heightBoard * 0.075,
        "wipLabelHeight": heightBoard * 0.05,
        "dashedLevel": heightBoard * 0.15,
        "dashedLabelLevel": heightBoard * 0.18,
        "expediteLaneLevel": heightBoard * 0.2,
        "standardLaneLevel": heightBoard * 0.3,
    };
    //Lanes
    ctx.lineWidth = 3;
    let radius = 25;

    rr(ctx, shiftX, shiftY, widthBoard + shiftX, heightBoard + shiftY, radius, colors.border, [1, 0]);
    rr(ctx, shiftX, spec.expediteLaneLevel + shiftY, widthBoard + shiftX, spec.standardLaneLevel + shiftY, 0, colors.border, [1, 0]);


    ln(ctx, shiftX, shiftY + radius, shiftX, heightBoard - radius + shiftY, colors.backlog, [1, 0]);
    rr(ctx, spec.laneWidth * 0.25 + shiftX, spec.wipLabelLevel + shiftY, spec.laneWidth * 0.75 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight + shiftY, 5, colors.backlog, [1, 0]);

    ln(ctx, spec.laneWidth + shiftX, shiftY, spec.laneWidth + shiftX, heightBoard + shiftY, colors.border, [1, 0]);

    ln(ctx, spec.laneWidth * 2 + shiftX, spec.dashedLevel + shiftY, spec.laneWidth * 2 + shiftX, heightBoard + shiftY, colors.analysis, [1, 0]);
    ln(ctx, spec.laneWidth + shiftX, spec.dashedLevel + shiftY, spec.laneWidth * 3 + shiftX, spec.dashedLevel + shiftY, colors.analysis, [20, 5]);
    rr(ctx, spec.laneWidth * 1.75 + shiftX, spec.wipLabelLevel + shiftY, spec.laneWidth * 2.25 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight + shiftY, 5, colors.analysis, [1, 0]);

    ln(ctx, spec.laneWidth * 3 + shiftX, shiftY, spec.laneWidth * 3 + shiftX, heightBoard + shiftY, colors.border, [1, 0]);

    ln(ctx, spec.laneWidth * 4 + shiftX, spec.dashedLevel + shiftY, spec.laneWidth * 4 + shiftX, heightBoard + shiftY, colors.development, [1, 0]);
    ln(ctx, spec.laneWidth * 3 + shiftX, spec.dashedLevel + shiftY, spec.laneWidth * 5 + shiftX, spec.dashedLevel + shiftY, colors.development, [20, 5]);
    rr(ctx, spec.laneWidth * 3.75 + shiftX, spec.wipLabelLevel + shiftY, spec.laneWidth * 4.25 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight + shiftY, 5, colors.development, [1, 0]);

    ln(ctx, spec.laneWidth * 5 + shiftX, shiftY, spec.laneWidth * 5 + shiftX, heightBoard + shiftY, colors.border, [1, 0]);

    ln(ctx, spec.laneWidth * 6 + shiftX, shiftY, spec.laneWidth * 6 + shiftX, heightBoard + shiftY, colors.testing, [1, 0]);
    rr(ctx, spec.laneWidth * 5.25 + shiftX, spec.wipLabelLevel + shiftY, spec.laneWidth * 5.75 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight + shiftY, 5, colors.testing, [1, 0]);

    ln(ctx, spec.laneWidth * 7 + shiftX, shiftY, spec.laneWidth * 7 + shiftX, heightBoard + shiftY, colors.deployed, [1, 0]);


    //Labels
    columnLabel(ctx, spec.laneWidth * 0.25 + shiftX, shiftY + spec.columnLabelLevel, colors.backlog, "Backlog");
    minorLabel(ctx, spec.laneWidth * 0.28 + shiftX, shiftY + spec.columnMinorLabelLevel, colors.backlog, "WIP Limit");
    columnLabel(ctx, spec.laneWidth * 1.75 + shiftX, shiftY + spec.columnLabelLevel, colors.analysis, "Analysis");
    minorLabel(ctx, spec.laneWidth * 1.78 + shiftX, shiftY + spec.columnMinorLabelLevel, colors.analysis, "WIP Limit");
    columnLabel(ctx, spec.laneWidth * 3.60 + shiftX, shiftY + spec.columnLabelLevel, colors.development, "Development");
    minorLabel(ctx, spec.laneWidth * 3.78 + shiftX, shiftY + spec.columnMinorLabelLevel, colors.development, "WIP Limit");
    columnLabel(ctx, spec.laneWidth * 5.25 + shiftX, shiftY + spec.columnLabelLevel, colors.testing, "Testing");
    minorLabel(ctx, spec.laneWidth * 5.28 + shiftX, shiftY + spec.columnMinorLabelLevel, colors.testing, "WIP Limit");
    columnLabel(ctx, spec.laneWidth * 6.25 + shiftX, shiftY + spec.columnLabelLevel, colors.text, "Ready");
    columnLabel(ctx, spec.laneWidth * 7.25 + shiftX, shiftY + spec.columnLabelLevel, colors.text, "Deployed");

    //Minor labels
    minorLabel(ctx, spec.laneWidth * 1.25 + shiftX, spec.dashedLabelLevel + shiftY, colors.analysis, "In Progress");
    minorLabel(ctx, spec.laneWidth * 2.40 + shiftX, spec.dashedLabelLevel + shiftY, colors.analysis, "Done");
    minorLabel(ctx, spec.laneWidth * 3.25 + shiftX, spec.dashedLabelLevel + shiftY, colors.development, "In Progress");
    minorLabel(ctx, spec.laneWidth * 4.40 + shiftX, spec.dashedLabelLevel + shiftY, colors.development, "Done");


    //Limits
    wipLimitLabel(ctx, spec.laneWidth * 0.40 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight, config.stages[0].limit);
    wipLimitLabel(ctx, spec.laneWidth * 1.90 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight, config.stages[1].limit);
    wipLimitLabel(ctx, spec.laneWidth * 3.90 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight, config.stages[2].limit);
    wipLimitLabel(ctx, spec.laneWidth * 5.45 + shiftX, spec.wipLabelLevel + spec.wipLabelHeight, config.stages[3].limit);

    return spec;
}

function drawCard(ctx, laneWidth, laneHeight, laneLevel, i, j, card) {
    let padding = 10;
    rr(ctx, laneWidth * i + padding + shiftX, laneLevel + laneHeight * j + padding + shiftY, laneWidth * (i + 1) - padding + shiftX, laneLevel + laneHeight * (j + 1) + shiftY, 5, colors.cardBorder, [1, 0]);

    ctx.font = "18px Arial";
    ctx.fillStyle = colors.text;
    ctx.fillText(card.cardId, laneWidth * i + padding + shiftX + 5, laneLevel + laneHeight * j + padding + shiftY + 20);

    ca(ctx, laneWidth * i + padding + shiftX + 10, laneLevel + laneHeight * j + padding + shiftY + 35, 2.5, colors.analysis, card.estimations.analysis - card.remainings.analysis, card.estimations.analysis);
    ca(ctx, laneWidth * i + padding + shiftX + 10, laneLevel + laneHeight * j + padding + shiftY + 52, 2.5, colors.development, card.estimations.development - card.remainings.development, card.estimations.development);
    ca(ctx, laneWidth * i + padding + shiftX + 10, laneLevel + laneHeight * j + padding + shiftY + 69, 2.5, colors.testing, card.estimations.testing - card.remainings.testing, card.estimations.testing);
}

function minorLabel(ctx, x, y, color, value) {
    return drawLabel(ctx, x, y, "18px Arial", color, value);
}

function columnLabel(ctx, x, y, color, value) {
    return drawLabel(ctx, x, y, "28px Arial", color, value);
}

function wipLimitLabel(ctx, x, y, value) {
    return drawLabel(ctx, x, y, "32px Arial", colors.text, value);
}

function drawLabel(ctx, x, y, font, color, value) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
}

function ca(ctx, x, y, r, color, done, all) {
    ctx.lineWidth = 1;
    for (let i = 0; i < all; i++) {
        ctx.beginPath();
        ctx.arc(x + 3 * r * i, y, r, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
        if (i < done) {
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}

function ln(ctx, x1, y1, x2, y2, color, dashed) {
    ctx.setLineDash(dashed);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function rr(ctx, x1, y1, x2, y2, r, color, dashed) {
    ctx.setLineDash(dashed);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 + r, y1);
    ctx.lineTo(x2 - r, y1);
    ctx.arc(x2 - r, y1 + r, r, 1.5 * Math.PI, 0);
    ctx.lineTo(x2, y2 - r);
    ctx.arc(x2 - r, y2 - r, r, 0, 0.5 * Math.PI);
    ctx.lineTo(x1 + r, y2);
    ctx.arc(x1 + r, y2 - r, r, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(x1, y1 + r);
    ctx.arc(x1 + r, y1 + r, r, Math.PI, 1.5 * Math.PI);
    ctx.stroke();
}