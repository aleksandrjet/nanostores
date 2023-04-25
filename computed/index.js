import { onMount } from '../lifecycle/index.js'
import { atom } from '../atom/index.js'

let defaultCompare = (prev, curr) =>
  Array.isArray(curr) ? curr.some((arg, i) => arg !== prev?.[i]) : curr === prev

export let computed = (stores, cb, compare) => {
  let isArr = Array.isArray(stores)
  let prevArgs

  let maxL = isArr ? Math.max(...stores.map(s => s.l)) : stores.l
  let derived = atom(undefined, maxL + 1)

  let run = () => {
    let args = isArr ? stores.map(store => store.get()) : stores.get()
    if (!(compare || defaultCompare)(prevArgs, args)) {
      let res = isArr ? cb.apply({}, args) : cb.call({}, (prevArgs = args))
      derived.set(res)
    }
  }

  onMount(derived, () => {
    let getUnbind = store => store.listen(run, derived.l)
    let unbinds = isArr ? stores.map(getUnbind) : [getUnbind(stores)]
    run()
    return () => {
      for (let unbind of unbinds) unbind()
    }
  })

  return derived
}
