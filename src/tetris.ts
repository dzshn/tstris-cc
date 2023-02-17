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

export const enum PieceType {
    I = 1,
    J,
    L,
    O,
    S,
    T,
    Z,
}

type Mino = [number, number];

interface Piece {
    type: PieceType;
    x: number;
    y: number;
    r: number;
    minos: Mino[];
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
    right: (tiles = 1) => Move.drag(tiles),
    rotate: (turns = 1): Move => ({ type: MoveType.ROTATE, x: 0, y: 0, r: turns % 4 }),
    hardDrop: (): Move => ({ type: MoveType.HARD_DROP, x: 0, y: 0, r: 0 }),
    softDrop: (tiles = 1): Move => ({ type: MoveType.SOFT_DROP, x: tiles, y: 0, r: 0 }),
    swap: (): Move => ({ type: MoveType.SWAP, x: 0, y: 0, r: 0 }),
};

function mapFill<T>(size: number, f: (i: number) => T): T[] {
    const a = [];
    for (let i = 0; i < size; i++)
        a[i] = f(i);

    return a;
}

const SHAPES: Record<PieceType, Mino[][]> = {
    [PieceType.I]: [
        [[1, 0], [1, 1], [1, 2], [1, 3]],
        [[0, 2], [1, 2], [2, 2], [3, 2]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
        [[0, 1], [1, 1], [2, 1], [3, 1]],
    ],
    [PieceType.J]: [
        [[0, 0], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [0, 2], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [2, 2]],
        [[0, 1], [1, 1], [2, 0], [2, 1]],
    ],
    [PieceType.L]: [
        [[0, 2], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [1, 1], [1, 2], [2, 0]],
        [[0, 0], [0, 1], [1, 1], [2, 1]],
    ],
    [PieceType.O]: [
        [[0, 1], [0, 2], [1, 1], [1, 2]],
        [[0, 1], [0, 2], [1, 1], [1, 2]],
        [[0, 1], [0, 2], [1, 1], [1, 2]],
        [[0, 1], [0, 2], [1, 1], [1, 2]],
    ],
    [PieceType.S]: [
        [[0, 1], [0, 2], [1, 0], [1, 1]],
        [[0, 1], [1, 1], [1, 2], [2, 2]],
        [[1, 1], [1, 2], [2, 0], [2, 1]],
        [[0, 0], [1, 0], [1, 1], [2, 1]],
    ],
    [PieceType.T]: [
        [[0, 1], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [1, 2], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [2, 1]],
        [[0, 1], [1, 0], [1, 1], [2, 1]],
    ],
    [PieceType.Z]: [
        [[0, 0], [0, 1], [1, 1], [1, 2]],
        [[0, 2], [1, 1], [1, 2], [2, 1]],
        [[1, 0], [1, 1], [2, 1], [2, 2]],
        [[0, 1], [1, 0], [1, 1], [2, 0]],
    ],
};

type Kicks = Record<number, [number, number][]>

const KICKS: Kicks = {
    [0 * 4 + 1]: [[+0, -1], [-1, -1], [+2, +0], [+2, -1]],
    [0 * 4 + 3]: [[+0, +1], [-1, +1], [+2, +0], [+2, +1]],
    [1 * 4 + 0]: [[+0, +1], [+1, +1], [-2, +0], [-2, +1]],
    [1 * 4 + 2]: [[+0, +1], [+1, +1], [-2, +0], [-2, +1]],
    [2 * 4 + 1]: [[+0, -1], [-1, -1], [+2, +0], [+2, -1]],
    [2 * 4 + 3]: [[+0, +1], [-1, +1], [+2, +0], [+2, +1]],
    [3 * 4 + 0]: [[+0, -1], [+1, -1], [-2, +0], [-2, -1]],
    [3 * 4 + 2]: [[+0, -1], [+1, -1], [-2, +0], [-2, -1]],
};

const I_KICKS: Kicks = {
    [0 * 4 + 1]: [[+0, -2], [+0, +1], [+1, -2], [-2, +1]],
    [0 * 4 + 3]: [[+0, -1], [+0, +2], [-2, -1], [+1, +2]],
    [1 * 4 + 0]: [[+0, +2], [+0, -1], [-1, +2], [+2, -1]],
    [1 * 4 + 2]: [[+0, -1], [+0, +2], [-2, -1], [+1, +2]],
    [2 * 4 + 1]: [[+0, +1], [+0, -2], [+2, +1], [-1, +2]],
    [2 * 4 + 3]: [[+0, +2], [+0, -1], [-1, +2], [+2, -1]],
    [3 * 4 + 0]: [[+0, +1], [+0, -2], [+2, +1], [-1, -2]],
    [3 * 4 + 2]: [[+0, -2], [+0, +1], [+1, -2], [-2, +1]],
};

interface TetrisOptions {
    height: number;
    width: number;
    queueLength: number;
}

export class Tetris {
    height: number;
    width: number;
    board: (PieceType | 0)[][];
    queueLength: number;
    queue: PieceType[];
    piece: Piece;
    hold?: PieceType;
    holdLock: boolean;
    status: State;

    constructor(options?: Partial<TetrisOptions>) {
        this.height = options?.height ?? 20;
        this.width = options?.width ?? 10;
        this.board = mapFill(this.height * 2, () => mapFill(this.width, () => 0));
        this.queueLength = options?.queueLength ?? 4;
        this.queue = [];
        this.fillQueue();
        this.piece = this.spawn(this.popQueue());
        this.holdLock = false;
        this.status = State.PLAYING;
    }

    pause(state?: boolean) {
        if (this.status === State.STOPPED)
            return;
        state ??= this.status === State.PLAYING;
        this.status = state ? State.IDLE : State.PLAYING;
    }

    getPlayfield(height = this.height): (PieceType | 0 | 8)[][] {
        const piece = this.piece;
        const board = this.board.map(x => [...x]);

        let ghostX = piece.x;
        while (!this.overlaps({ ...piece, x: ghostX + 1 }))
            ghostX++;

        for (const [x, y] of piece.minos) {
            board[x + ghostX][y + piece.y] = 8;
            board[x + piece.x][y + piece.y] = piece.type;
        }

        return board.slice(this.height * 2 - height);
    }

    move(x: number, y: number) {
        const piece = this.piece;

        const dirX = Math.sign(x - piece.x);
        while (piece.x !== x && !this.overlaps({ ...piece, x: piece.x + dirX }))
            piece.x += dirX;

        const dirY = Math.sign(y - piece.y);
        while (piece.y !== y && !this.overlaps({ ...piece, y: piece.y + dirY }))
            piece.y += dirY;
    }

    moveRelative(x: number, y: number) {
        this.move(this.piece.x + x, this.piece.y + y);
    }

    rotate(turns: number) {
        const piece = this.piece;
        const r = (piece.r + turns) % 4;
        const minos = SHAPES[piece.type][r];

        if (!this.overlaps({ ...piece, minos })) {
            piece.r = r;
            piece.minos = minos;
            return;
        }

        const table = piece.type === PieceType.I ? I_KICKS : KICKS;
        const kicks = table[piece.r * 4 + r];
        if (!kicks)
            return;

        for (const [x, y] of kicks) {
            if (!this.overlaps({ minos, x: piece.x + x, y: piece.y + y })) {
                piece.x += x;
                piece.y += y;
                piece.r = r;
                piece.minos = minos;
                break;
            }
        }
    }

    swap() {
        if (this.holdLock)
            return;

        this.hold ??= this.popQueue();
        [this.hold, this.piece] = [this.piece.type, this.spawn(this.hold)];
        this.holdLock = true;
    }

    lockPiece() {
        const piece = this.piece;
        while (!this.overlaps({ ...piece, x: piece.x + 1 }))
            piece.x++;

        for (const [x, y] of piece.minos)
            this.board[x + piece.x][y + piece.y] = piece.type;

        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].every(x => x > 0)) {
                this.board.splice(i, 1);
                this.board.unshift(mapFill(this.width, () => 0));
            }
        }

        this.piece = this.spawn(this.popQueue());
        this.holdLock = false;
    }

    push(move: Move) {
        if (this.status !== State.PLAYING)
            return

        if (move.type === MoveType.DRAG)
            this.moveRelative(0, move.y);
        else if (move.type === MoveType.SOFT_DROP)
            this.moveRelative(move.x, 0);
        else if (move.type === MoveType.HARD_DROP)
            this.lockPiece();
        else if (move.type === MoveType.ROTATE)
            this.rotate(move.r);
        else if (move.type === MoveType.SWAP)
            this.swap();
    }

    tick() {
        // TODO: gravity here
    }

    fillQueue() {
        const bag = mapFill(7, i => i + 1);
        while (bag.length > 0)
            this.queue.push(table.remove(bag, math.random(bag.length))!);
    }

    popQueue() {
        if (this.queue.length < this.queueLength + 1)
            this.fillQueue();
        return this.queue.shift()!;
    }

    overlaps(piece: Pick<Piece, "x" | "y" | "minos">) {
        for (let [x, y] of piece.minos) {
            x += piece.x;
            y += piece.y;
            if (
                x < 0 || x >= this.height * 2 ||
                y < 0 || y >= this.width ||
                this.board[x][y] !== 0
            )
                return true;
        }
        return false;
    }

    spawn(type: PieceType): Piece {
        const minos = SHAPES[type][0];
        let x = this.height - 2;
        const y = Math.floor((this.width + 3) / 2) - 3;
        if (!this.overlaps({ minos, x, y }) && !this.overlaps({ minos, x: x + 1, y }))
            x++;

        return { type, x, y, r: 0, minos };
    }
}
