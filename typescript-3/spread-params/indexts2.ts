
function somme(...args: number[]) {
    let total = 0;
    for (let num of args) {
        total += num;
    }
    return total;
}

console.log(somme(...[1, 2, 3, 4]));
