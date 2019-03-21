class _LazyMan {
  constructor(name) {
    this.tasks = []
    this.lazyMan(name)
    setTimeout(() => {
      this.next()
    })
  }

  next() {
    const fn = this.tasks.shift()
    fn && fn()
  }

  lazyMan(name) {
    const fn = () => {
      this._log(`Hi! This is ${name}!`)
      this.next()
    }
    this.tasks.push(fn)
    return this
  }

  eat(some) {
    const fn = () => {
      this._log(`Eat ${some}~`)
      this.next()
    }
    this.tasks.push(fn)
    return this
  }

  sleep(time) {
    const fn = () => {
      setTimeout(() => {
        this._log(`Wake up after ${time}`)
        this.next()
      }, time * 1000)
    }
    this.tasks.push(fn)
    return this
  }

  sleepFirst(time) {
    const fn = () => {
      setTimeout(() => {
        this._log(`Wake up after ${time}`)
        this.next()
      }, time * 1000)
    }
    this.tasks.unshift(fn)
    return this
  }

  _log (message) {
    console.log(message)
  }
}

function LazyMan(name) {
  return new _LazyMan(name)
}

LazyMan('lulu')
  .sleep(5)
  .eat('dinner')
  .eat('supper')
