import { Board, Piece, PieceType } from "./types";

export abstract class Queue {
    size: number;
    protected pieces: PieceType[];

    constructor(size = 4) {
        this.size = size;
        this.pieces = [];
        this.fill();
    }

    at(index: number) {
        return this.pieces[index];
    }

    pop() {
        if (this.pieces.length < this.size + 1)
            this.fill();
        return this.pieces.shift()!;
    }

    abstract fill(): void;
}

export abstract class RotationSystem {
    board: Board<PieceType | 0>;
    height: number;
    width: number;

    constructor(board: Board<PieceType | 0>) {
        this.board = board;
        this.height = board.length;
        this.width = board[0].length;
    }

    overlaps(piece: Pick<Piece, "x" | "y" | "minos">) {
        for (let [x, y] of piece.minos) {
            x += piece.x;
            y += piece.y;
            if (
                x < 0 || x >= this.height ||
                y < 0 || y >= this.width ||
                this.board[x][y] !== 0
            )
                return true;
        }
        return false;
    }

    abstract spawn(type: PieceType): Piece;

    abstract rotate(piece: Piece, turns: number): void;
}
