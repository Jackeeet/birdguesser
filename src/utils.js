export function equalSets(a1, a2) {
    const set = {};
    for (const i of a1) {
        set[i] = 1;
    }

    for (const i of a2) {
        if (!set[i]) {
            return false;
        }
        set[i] = 2;
    }

    for (let e in set) {
        if (set[e] === 1) {
            return false;
        }
    }

    return true;
}