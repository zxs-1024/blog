let test
let a = () => {
  let n = 99
  test = () => {
    n++
  }
  let a1 = () => {
    console.log(n)
  }
  return a1
}
积极

let a1 = a()
let a2 = a()

test()
a1()
a2()

