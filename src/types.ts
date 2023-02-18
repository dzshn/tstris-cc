export type Coord = [number, number];

export type Board<T> = T[][];

export const enum State {
    PLAYING,
    IDLE,
    STOPPED,
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

export interface Piece {
    type: PieceType;
    x: number;
    y: number;
    r: number;
    minos: Coord[];
}

export const enum MoveType {
    DRAG,
    HARD_DROP,
    ROTATE,
    SOFT_DROP,
    SWAP,
}

export interface Move {
    type: MoveType;
    x: number;
    y: number;
    r: number;
    auto?: boolean;
}
