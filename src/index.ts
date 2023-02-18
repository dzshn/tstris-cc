import { Moves, Tetris } from "./tetris";
import { MoveType, PieceType } from "./types";
import { mapFill } from "./utils";

const moves = {
    [keys.w]: Moves.hardDrop(),
    [keys.a]: Moves.left(),
    [keys.s]: Moves.softDrop(),
    [keys.d]: Moves.right(),

    [keys.j]: Moves.rotate(-1),
    [keys.k]: Moves.rotate(+1),
    [keys.l]: Moves.rotate(2),

    [keys.q]: Moves.swap(),
};

const pieceColours = {
    [PieceType.I]: colours.lightBlue,
    [PieceType.J]: colours.orange,
    [PieceType.L]: colours.blue,
    [PieceType.O]: colours.yellow,
    [PieceType.S]: colours.green,
    [PieceType.T]: colours.purple,
    [PieceType.Z]: colours.red,
};

// pain
const piecePreviews: Record<PieceType, [text: string, mask: string][]> = {
    [PieceType.I]: [
        ["    ", "0000"],
        ["\x83\x83\x83\x83", "1111"],
    ],
    [PieceType.J]: [
        ["\x9f\x90  ", "1000"],
        ["\x95\x82\x83\x94", "1110"],
    ],
    [PieceType.L]: [
        ["  \x9f\x90", "0010"],
        ["\x97\x83\x81\x95", "1110"],
    ],
    [PieceType.O]: [
        [" \x8f\x8f ", "0110"],
        ["    ", "0110"],
    ],
    [PieceType.S]: [
        [" \x9f\x8f\x90", "0110"],
        ["\x97\x81\x97\x81", "1100"],
    ],
    [PieceType.T]: [
        [" \x9f\x90 ", "0100"],
        ["\x97\x81\x82\x94", "1110"],
    ],
    [PieceType.Z]: [
        ["\x9f\x8f\x90 ", "1100"],
        ["\x82\x94\x82\x94", "0110"],
    ],
};

const game = new Tetris();
const [speaker] = peripheral.find("speaker") as LuaMultiReturn<SpeakerPeripheral[]>;
function addStr(text: string, fg: number | null, bg: number | null) {
    if (fg !== null) term.setTextColour(fg);
    if (bg !== null) term.setBackgroundColour(bg);
    term.write(text);
}

function addStrAt(x: number, y: number, text: string, fg: number | null, bg: number | null) {
    term.setCursorPos(x, y);
    addStr(text, fg, bg);
}

function drawPreview(x: number, y: number, piece: PieceType) {
    const colour = pieceColours[piece];
    const lines = piecePreviews[piece];
    for (let i = 0; i < lines.length; i++) {
        const [text, mask] = lines[i];
        term.setCursorPos(x, y + i);
        for (let j = 0; j < text.length; j++) {
            if (mask[j] === "0") {
                term.setTextColour(colour);
                term.setBackgroundColour(colours.black);
            } else {
                term.setTextColour(colours.black);
                term.setBackgroundColour(colour);
            }
            term.write(text[j]);
        }
    }
}

function render(): void {
    const [cols, rows] = term.getSize();

    const height = Math.min(rows, game.height);
    const topSide = rows - height;
    const leftSide = Math.floor(cols / 2 - game.width - 1);
    const rightSide = Math.floor(cols / 2 + game.width + 1);

    const board = game.getPlayfield(Math.min(rows, game.height));

    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        term.setCursorPos(leftSide, topSide + i + 1);
        term.setBackgroundColour(colours.white);
        term.write(" ");
        term.setBackgroundColour(colours.black);
        for (const tile of row) {
            if (tile === 0)
                addStr(". ", colours.grey, null);
            else if (tile === 8)
                addStr("@ ", colours.lightGrey, null);
            else
                addStr("[]", pieceColours[tile], null);
        }
        term.setBackgroundColour(colours.white);
        term.write(" ");
        term.setBackgroundColour(colours.black);
    }

    term.setTextColor(colours.black);
    term.setBackgroundColour(colours.white);
    for (let i = 2; i < 16; i++)
        addStrAt(rightSide + 6, topSide + i, " \x7f", null, null);

    addStrAt(rightSide, topSide + 1, " HOLD  ", colours.black, colours.white);
    term.setBackgroundColour(colours.black);
    if (game.hold)
        drawPreview(rightSide + 1, 2, game.hold);

    addStrAt(rightSide, topSide + 4, "\x8f".repeat(6), colours.black, colours.white);
    addStrAt(rightSide, topSide + 5, " NEXT  ", colours.black, colours.white);
    for (let i = 0; i < game.queue.size; i++)
        drawPreview(rightSide + 1, topSide + i * 2 + 6, game.queue.at(i));

    addStrAt(rightSide, topSide + 14, "\x8f".repeat(6), colours.black, colours.white);
    addStrAt(rightSide, topSide + 15, "       ", colours.black, colours.white);

    term.setBackgroundColour(colours.black);
}

term.clear();

let renderTimer = os.startTimer(1 / 30);

for (;;) {
    const [event, ...args] = os.pullEvent();

    game.tick();

    if (event === "timer" && args[0] === renderTimer) {
        renderTimer = os.startTimer(1 / 30);
        render();
    } else if (event === "term_resize") {
        term.clear();
        render();
    } else if (event === "key") {
        const [key] = args as [number, boolean];

        if (key === keys.p)
            game.pause();

        if (key in moves) {
            const move = moves[key];
            game.push(move);
            if (move.type === MoveType.HARD_DROP)
                speaker?.playNote("snare", 0.5);
        }

        render();
    } else if (event === "key_up") {
        const key = args[0];
        if (key === keys.c) {
            term.setCursorPos(1, 1);
            term.setTextColour(colours.white);
            term.setBackgroundColour(colours.black);
            term.clear();
            print("bai ^w^");
            break;
        }
    }
}
