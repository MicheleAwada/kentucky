function exponential_probability(range, weight) {
    let result = [];
    let sum = 0;
    for (let i=0; i<range+0; i++) {
        const num = i+1
        result.push(1 / weight ** num)
        sum += result[i]
    }
    const d = 1/sum
    console.log(sum)
    console.log(d)
    console.log(result)
    result = result.map((num) => {
        return num*d
    })
    console.log(result)
    rand = Math.random()
    result.reverse()
    result.map(() => {
        
    })
}