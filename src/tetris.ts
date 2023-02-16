const enum State {
    PLAYING,
    IDLE,
    STOPPED,
}

const enum MoveType {
    DRAG,
    HARD_DROP,
    ROTATE,
    SOFT_DROP,
    SWAP,
}

interface Move {
    type: MoveType;
    x: number;
    y: number;
    r: number;
    auto?: boolean;
}

export const Move = {
    drag: (tiles: number): Move => ({ type: MoveType.DRAG, x: 0, y: tiles, r: 0 }),
    left: (tiles = 1) => Move.drag(-tiles),
    right: (tiles = -1) => Move.drag(tiles),
    rotate: (turns = 1): Move => ({ type: MoveType.ROTATE, x: 0, y: 0, r: turns % 4 }),
    hardDrop: (): Move => ({ type: MoveType.HARD_DROP, x: 0, y: 0, r: 0 }),
    softDrop: (tiles = 1): Move => ({ type: MoveType.SOFT_DROP, x: tiles, y: 0, r: 0 }),
    swap: (): Move => ({ type: MoveType.SWAP, x: 0, y: 0, r: 0 }),
};

export class Tetris {
    status: State;

    constructor() {
        this.status = State.PLAYING;
    }

    pause(state?: boolean) {
        if (this.status === State.STOPPED)
            return;
        if (state === undefined)
            state = this.status === State.PLAYING;
        this.status = state ? State.IDLE : State.PLAYING;
    }

    push(move: Move): void { return; }

    tick(): void { return; }
}
