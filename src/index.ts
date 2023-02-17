import { Move, PieceType, Tetris } from "./tetris";

const moves = {
    [keys.w]: Move.hardDrop(),
    [keys.a]: Move.left(),
    [keys.s]: Move.softDrop(),
    [keys.d]: Move.right(),

    [keys.j]: Move.rotate(-1),
    [keys.k]: Move.rotate(+1),
    [keys.l]: Move.rotate(2),

    [keys.q]: Move.swap(),
};

const pieceColours = {
    [PieceType.I]: colours.cyan,
    [PieceType.J]: colours.orange,
    [PieceType.L]: colours.blue,
    [PieceType.O]: colours.yellow,
    [PieceType.S]: colours.green,
    [PieceType.T]: colours.purple,
    [PieceType.Z]: colours.red,
};

const game = new Tetris();
let renderTimer = os.startTimer(1 / 30);

function render(): void {
    const [cols, rows] = term.getSize();
    term.setCursorPos(1, 1);
    term.clear();

    for (const [i, row] of ipairs(game.getPlayfield(rows))) {
        term.setCursorPos(Math.floor(cols / 2 - game.width), i);
        for (const tile of row) {
            if (tile === 0) {
                term.setTextColour(colours.grey);
                term.write(". ");
            } else if (tile === 8) {
                term.setTextColour(colours.lightGrey);
                term.write("@ ");
            } else {
                term.setTextColour(pieceColours[tile]);
                term.write("[]");
            }
        }
    }
}

for (;;) {
    const [event, ...args] = os.pullEvent();

    game.tick();

    if (event === "timer" && args[0] === renderTimer) {
        renderTimer = os.startTimer(1 / 30);
        render();
    } else if (event === "key") {
        const key = args[0];
        if (key === keys.p)
            game.pause();

        if (key in moves)
            game.push(moves[key]);

        render();
    } else if (event === "key_up") {
        const key = args[0];
        if (key === keys.c) {
            term.clear();
            term.setCursorPos(1, 1);
            term.setTextColor(colours.white);
            print(":3");
            break;
        }
    }
}
