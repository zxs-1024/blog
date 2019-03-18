class LazyMan {
  constructor(name) {
    this.tasks = []
    this.subscribe('lazyMan', name)
    setTimeout(() => {
      this.publish()
    }, 0)
  }

  // 订阅
  subscribe(type, payload) {
    const action = { type, payload }

    if (type === 'sleepFirst') {
      this.tasks.unshift(action)
    } else {
      this.tasks.push(action)
    }
  }

  // 发布
  publish() {
    const { tasks } = this
    if (tasks.length > 0) this.run(tasks.shift())
  }

  run({ type, payload }) {
    switch (type) {
      case 'lazyMan':
        this._lazyMan(payload)
        break
      case 'eat':
        this._eat(payload)
        break
      case 'sleep':
        this._sleep(payload)
        break
      case 'sleepFirst':
        this._sleepFirst(payload)
        break
      default:
    }
  }

  _lazyMan(name) {
    this._log(`Hi! This is ${name}!`)
    this.publish()
  }

  _eat(some) {
    this._log(`Eat ${some}~`)
    this.publish()
  }

  _sleep(time) {
    setTimeout(() => {
      this._log(`Wake up after ${time}`)
      this.publish()
    }, time * 1000)
  }

  _sleepFirst(time) {
    setTimeout(() => {
      this._log(`Wake up after ${time}`)
      this.publish()
    }, time * 1000)
  }

  _log(message) {
    console.log(message)
  }

  lazyMan() {
    this.subscribe('lazyMan', some)
  }

  eat(some) {
    this.subscribe('eat', some)
    return this
  }

  sleep(time) {
    this.subscribe('sleep', time)
    return this
  }

  sleepFirst(time) {
    this.subscribe('sleepFirst', time)
    return this
  }
}

function lazyMan(name) {
  return new LazyMan(name)
}

lazyMan('lulu')
  .sleepFirst(5)
  .eat('dinner')
  .eat('supper')
