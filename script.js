const input = document.getElementById("input");
const outputText = document.getElementById("output-text");
const outputCounter = document.getElementById("output-counter");
const btnInc = document.getElementById("btn-inc");
const btnDec = document.getElementById("btn-dec");
const globalMap = new WeakMap();

let currentAction = null;

const inputRef = ref("");
const counterRef = ref(0);

input.addEventListener("input", (e) => {
    inputRef.value = e.target.value;
});
btnInc.addEventListener("click", () => {
    ++counterRef.value;
});
btnDec.addEventListener("click", () => {
    --counterRef.value;
});

watchEffect(() => {
    outputText.textContent = inputRef.value;
    outputCounter.textContent = counterRef.value;
});

function watchEffect(effect) {
    const action = () => {
        currentAction = action;
        effect();
        currentAction = null;
    };
    action();
}

function ref(initial) {
    let v = initial;
    const obj = {
        get value() {
            performSubscribe(obj);
            return v;
        },
        set value(newValue) {
            v = newValue;
            performUpdate(obj);
        },
    };
    return obj;
}

function performSubscribe(obj) {
    if (currentAction) {
        if (!globalMap.get(obj)) {
            globalMap.set(obj, new Set());
        }
        const actions = globalMap.get(obj);
        actions.add(currentAction);
    }
}

function performUpdate(obj) {
    const actions = globalMap.get(obj) ?? [];
    actions.forEach((action) => {
        action();
    });
}
