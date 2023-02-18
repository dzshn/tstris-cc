import { Queue } from "./engine";
import { mapFill } from "./utils";

export default class SevenBag extends Queue {
    fill(): void {
        const bag = mapFill(7, i => i + 1);
        while (bag.length > 0)
            this.pieces.push(table.remove(bag, math.random(bag.length))!);
    }
}

