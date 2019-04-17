# LazyMan 的两种实现

## 基于事件控制

```js
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

  _log(message) {
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
```

## 基于发布订阅模式

```js
class _LazyMan {
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

function LazyMan(name) {
  return new _LazyMan(name)
}

LazyMan('lulu')
  .sleepFirst(5)
  .eat('dinner')
  .eat('supper')
```
