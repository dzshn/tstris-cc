export function mapFill<T>(size: number, f: (i: number) => T): T[] {
    const a = [];
    for (let i = 0; i < size; i++)
        a[i] = f(i);

    return a;
}
