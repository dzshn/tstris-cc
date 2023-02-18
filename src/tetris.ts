import { Queue } from "./engine";
import SevenBag from "./sevenBag";
import SRS from "./srs";
import { Board, Move, MoveType, Piece, PieceType, State } from "./types";

export const Moves = {
    drag: (tiles: number): Move => ({ type: MoveType.DRAG, x: 0, y: tiles, r: 0 }),
    left: (tiles = 1) => Moves.drag(-tiles),
    right: (tiles = 1) => Moves.drag(tiles),
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

interface TetrisOptions {
    height: number;
    width: number;
    queueLength: number;
}

export class Tetris {
    height: number;
    width: number;
    board: Board<PieceType | 0>;
    queue: Queue;
    rs: SRS;
    piece: Piece;
    hold?: PieceType;
    holdLock: boolean;
    status: State;

    constructor(options?: Partial<TetrisOptions>) {
        this.height = options?.height ?? 20;
        this.width = options?.width ?? 10;
        this.board = mapFill(this.height * 2, () => mapFill(this.width, () => 0));
        this.queue = new SevenBag(options?.queueLength ?? 4);
        this.rs = new SRS(this.board);
        this.piece = this.rs.spawn(this.queue.pop());
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
        while (!this.rs.overlaps({ ...piece, x: ghostX + 1 }))
            ghostX++;

        for (const [x, y] of piece.minos) {
            board[x + ghostX][y + piece.y] = 8;
            board[x + piece.x][y + piece.y] = piece.type;
        }

        return board.slice(this.height * 2 - height);
    }

    move(x: number, y: number) {
        const piece = this.piece;

        const dx = Math.sign(x - piece.x);
        while (piece.x !== x && !this.rs.overlaps({ ...piece, x: piece.x + dx }))
            piece.x += dx;

        const dy = Math.sign(y - piece.y);
        while (piece.y !== y && !this.rs.overlaps({ ...piece, y: piece.y + dy }))
            piece.y += dy;
    }

    moveRelative(x: number, y: number) {
        this.move(this.piece.x + x, this.piece.y + y);
    }

    rotate(turns: number) {
        this.rs.rotate(this.piece, turns);
    }

    swap() {
        if (this.holdLock)
            return;

        this.hold ??= this.queue.pop();
        [this.hold, this.piece] = [this.piece.type, this.rs.spawn(this.hold)];
        this.holdLock = true;
    }

    lockPiece() {
        const piece = this.piece;
        while (!this.rs.overlaps({ ...piece, x: piece.x + 1 }))
            piece.x++;

        for (const [x, y] of piece.minos)
            this.board[x + piece.x][y + piece.y] = piece.type;

        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].every(x => x > 0)) {
                this.board.splice(i, 1);
                this.board.unshift(mapFill(this.width, () => 0));
            }
        }

        this.piece = this.rs.spawn(this.queue.pop());
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
}
