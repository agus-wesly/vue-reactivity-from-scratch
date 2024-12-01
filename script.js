const input = document.getElementById("input");
const outputText = document.getElementById("output-text");
const outputCounter = document.getElementById("output-counter");
const outputObject = document.getElementById("output-object");
const outputArray = document.getElementById("output-array");
const btnInc = document.getElementById("btn-inc");
const btnDec = document.getElementById("btn-dec");
const btnMutateObject = document.getElementById("btn-mutate-obj");
const btnPush = document.getElementById("btn-push");
const btnPop = document.getElementById("btn-pop");
const globalMap = new WeakMap();

let currentAction = null;

const inputRef = ref("");
const counterRef = ref(0);
const foo = reactive({
  bar: 0,
});
const items = reactive([]);

input.addEventListener("input", (e) => {
  inputRef.value = e.target.value;
});
btnInc.addEventListener("click", () => {
  ++counterRef.value;
});
btnDec.addEventListener("click", () => {
  --counterRef.value;
});

btnMutateObject.addEventListener("click", () => {
  foo.bar = Date.now();
});

btnPush.addEventListener("click", () => {
  items.push(Date.now());
});

btnPop.addEventListener("click", () => {
  items.pop();
});

watchEffect(() => {
  outputText.textContent = inputRef.value;
  outputCounter.textContent = counterRef.value;
  outputObject.textContent = JSON.stringify(foo);
  outputArray.textContent = JSON.stringify(items);
});

function watchEffect(effect) {
  const action = () => {
    currentAction = action;
    effect();
    currentAction = null;
  };
  action();
}

function reactive(initial) {
  return new Proxy(initial, {
    get(obj, key) {
      performSubscribe(obj, key);
      return Reflect.get(...arguments);
    },
    set(obj, key) {
      const val = Reflect.set(...arguments);
      performUpdate(obj, key);
      if (Array.isArray(obj)) {
        performUpdate(obj, "length");
      }
      return val;
    },
  });
}

function ref(initial) {
  let v = initial;
  const obj = {
    get value() {
      performSubscribe(obj, "value");
      return v;
    },
    set value(newValue) {
      v = newValue;
      performUpdate(obj, "value");
    },
  };
  return obj;
}

function performSubscribe(obj, key) {
  if (currentAction) {
    if (!globalMap.get(obj)) {
      globalMap.set(obj, new Map());
    }
    const currMap = globalMap.get(obj);
    if (!currMap.get(key)) {
      currMap.set(key, new Set());
    }
    const actions = currMap.get(key);
    actions.add(currentAction);
  }
}

function performUpdate(obj, key) {
  const currMap = globalMap.get(obj);
  const actions = currMap.get(key) ?? [];
  actions.forEach((action) => {
    action();
  });
}
