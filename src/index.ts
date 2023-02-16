import { Move, Tetris } from "./tetris";

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

const game = new Tetris();
let renderTimer = os.startTimer(1 / 30);

function render(): void {
    term.setCursorPos(1, 1);
    term.clear();
    term.write("meow meow");
}

for (;;) {
    const [event, ...args] = os.pullEvent();

    game.tick();

    if (event === "timer" && args[0] === renderTimer) {
        renderTimer = os.startTimer(1 / 30);
        render();
    } else if (event === "key") {
        const key = args[0];
        if (key === keys.q)
            break;

        if (key === keys.p)
            game.pause();

        if (key in moves)
            game.push(moves[key]);

        render();
    }
}
