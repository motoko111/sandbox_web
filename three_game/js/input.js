// ※ lua => javascript ChatGPTで変換

// clamp 
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// lerp 
function lerp(a, b, rate) {
    return (a * (1.0 - rate)) + (b * rate);
}

// Key Types
const EInputKey = {
    NONE: 0,

    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,

    ENTER: 5,
    CANCEL: 6,

    SUB1: 7,
    SUB2: 8,

    L_TRIGGER: 9,
    R_TRIGGER: 10,

    L_SHOULDER: 11,
    R_SHOULDER: 12,

    START: 13,
    SELECT: 14,

    L_STICK_PUSH: 15,
    R_STICK_PUSH: 16,

    DEBUG: 17,

    DEBUG1: 18,
    DEBUG2: 19,
    DEBUG3: 20,
    DEBUG4: 21,
    DEBUG5: 22,
    DEBUG6: 23,
    DEBUG7: 24,
    DEBUG8: 25,
    DEBUG9: 26,

    MAX: 27
};

// Key Settings
const KeySetting = {
    KeyA: EInputKey.LEFT,
    KeyD: EInputKey.RIGHT,
    KeyW: EInputKey.UP,
    KeyS: EInputKey.DOWN,

    ArrowLeft: EInputKey.LEFT,
    ArrowRight: EInputKey.RIGHT,
    ArrowUp: EInputKey.UP,
    ArrowDown: EInputKey.DOWN,

    KeyL: EInputKey.ENTER,
    KeyK: EInputKey.CANCEL,
    KeyU: EInputKey.SUB1,
    KeyJ: EInputKey.SUB2,

    Space: EInputKey.SELECT,
    Backspace: EInputKey.START,

    KeyQ: EInputKey.L_SHOULDER,
    KeyE: EInputKey.R_SHOULDER,

    keyM: EInputKey.DEBUG,
    Digit1: EInputKey.DEBUG1,
    Digit2: EInputKey.DEBUG2,
    Digit3: EInputKey.DEBUG3,
    Digit4: EInputKey.DEBUG4,
    Digit5: EInputKey.DEBUG5,
    Digit6: EInputKey.DEBUG6,
    Digit7: EInputKey.DEBUG7,
    Digit8: EInputKey.DEBUG8,
    Digit9: EInputKey.DEBUG9,
};

function GetKeySetting(key) {
    if (key === "Numpad1") key = "Digit1";
    if (key === "Numpad2") key = "Digit2";
    if (key === "Numpad3") key = "Digit3";
    if (key === "Numpad4") key = "Digit4";
    if (key === "Numpad5") key = "Digit5";
    if (key === "Numpad6") key = "Digit6";
    if (key === "Numpad7") key = "Digit7";
    if (key === "Numpad8") key = "Digit8";
    if (key === "Numpad9") key = "Digit9";
    return KeySetting[key];
}

// Pad Settings
const PadSetting = {
    dpleft: EInputKey.LEFT,
    dpright: EInputKey.RIGHT,
    dpup: EInputKey.UP,
    dpdown: EInputKey.DOWN,

    a: EInputKey.ENTER,
    b: EInputKey.CANCEL,
    x: EInputKey.SUB1,
    y: EInputKey.SUB2,

    back: EInputKey.DEBUG,
    start: EInputKey.START,

    leftshoulder: EInputKey.L_SHOULDER,
    rightshoulder: EInputKey.R_SHOULDER,
};

// Mouse Settings
const MouseSetting = {
    left: EInputKey.ENTER,
    right: EInputKey.CANCEL,
    wheel_up: EInputKey.UP,
    wheel_down: EInputKey.DOWN,
};

// Key Input Info
const KeyInputInfo = {
    new: function () {
        return {
            isOn: false,
            isOnTrigger: false,
            isOnFirstTrigger: false,
            isUp: false,
            time: 0,
            repeatTime: 0,
            count: 0,

            isRepeat: false,
            firstRepeatTime: 0.4,
            secondRepeatTime: 0.2,
            reset: KeyInputInfo.reset,
            setup: KeyInputInfo.setup
        };
    },

    reset: function () {
        this.isOn = false;
        this.isOnTrigger = false;
        this.isOnFirstTrigger = false;
        this.isUp = false;
        this.time = 0;
        this.repeatTime = 0;
        this.count = 0;
    },

    setup: function (isRepeat, firstRepeatTime, secondRepeatTime) {
        this.isRepeat = isRepeat;
        this.firstRepeatTime = firstRepeatTime || 0;
        this.secondRepeatTime = secondRepeatTime || 0;
    }
};

// Input Management
const Input = {
    new: function () {
        const obj = {
            enableKeyboard: true,
            keyInputInfos: {},
            lastInputAxis: { x: 0, y: 0 },
            lastInputTurnAxis: { x: 0, y: 0 },
            inputAxis: { x: 0, y: 0 },
            inputTurnAxis: { x: 0, y: 0 },
            lastMousePosition: { x: 0, y: 0 },
            inputMousePosition: { x: 0, y: 0 },
            lastMoveMousePosition: { x: 0, y: 0 },
            inputMoveMousePosition: { x: 0, y: 0 },
            lastMouseDownPosition: { x: 0, y: 0 },
            inputMouseDownPosition: { x: 0, y: 0 },
            lastMouseUpPosition: { x: 0, y: 0 },
            inputMouseUpPosition: { x: 0, y: 0 },
            lastMouseClick: false,
            inputMouseClick: false,
            lastMouseDown: false,
            inputMouseDown: false,
            lastMouseUp: false,
            inputMouseUp: false,
            lastMouseWheelMove: { x: 0, y: 0 },
            inputMouseWheelMove: { x: 0, y: 0 },

            setEnableKeyboard: function (enable) {
                this.enableKeyboard = enable;
            },

            isOnInputKey: function (key) {
                return this.getKeyInfo(key).isOn;
            },

            isOnTriggerInputKey: function (key) {
                return this.getKeyInfo(key).isOnTrigger;
            },

            isOnFirstTriggerInputKey: function (key) {
                return this.getKeyInfo(key).isOnFirstTrigger;
            },

            isUpInputKey: function (key) {
                return this.getKeyInfo(key).isUp;
            },

            getKeyInfo: function (key) {
                return this.keyInputInfos[key];
            },

            getLastInputAxis: function () {
                return this.lastInputAxis;
            },

            getLastInputTurnAxis: function () {
                return this.lastInputTurnAxis;
            },

            isLastMouseClick: function () {
                return this.lastMouseClick;
            },

            isLastMouseDown: function () {
                return this.lastMouseDown;
            },

            isLastMouseUp: function () {
                return this.lastMouseUp;
            },

            getLastMousePosition: function () {
                return this.lastMousePosition;
            },

            getLastMoveMousePosition: function () {
                return this.lastMoveMousePosition;
            },

            getLastMouseDownPosition: function () {
                return this.lastMouseDownPosition;
            },

            getLastMouseUpPosition: function () {
                return this.lastMouseUpPosition;
            },

            getLastMouseWheelMove: function () {
                return this.lastMouseWheelMove;
            },

            updateInput: function (dt) {
                // key
                for (let i in this.keyInputInfos) {
                    let info = this.keyInputInfos[i];
                    info.isOnTrigger = false;
                    info.isOnFirstTrigger = false;
                    info.isUp = false;
                    if (info.isOn) {
                        if (info.count < 1) {
                            info.isOnTrigger = true;
                            info.isOnFirstTrigger = true;
                            info.count++;
                            info.time = 0.0;
                            info.repeatTime = info.firstRepeatTime;
                        } else if (info.isRepeat) {
                            info.time += dt;
                            while (info.time >= info.repeatTime) {
                                info.isOnTrigger = true;
                                info.time -= info.repeatTime;
                                info.repeatTime = info.secondRepeatTime;
                                info.count++;
                                if (info.count > 100) {
                                    info.count %= 100;
                                }
                            }
                        }
                    } else {
                        const prevIsOn = info.count > 0;
                        info.reset();
                        info.isUp = prevIsOn;
                    }
                }

                // axis
                this.lastInputAxis.x = this.inputAxis.x;
                this.lastInputAxis.y = this.inputAxis.y;
                this.inputAxis.x = 0;
                this.inputAxis.y = 0;

                this.lastInputTurnAxis.x = this.inputTurnAxis.x;
                this.lastInputTurnAxis.y = this.inputTurnAxis.y;
                this.inputTurnAxis.x = 0;
                this.inputTurnAxis.y = 0;

                // mouse
                this.lastMousePosition.x = this.inputMousePosition.x;
                this.lastMousePosition.y = this.inputMousePosition.y;

                this.lastMoveMousePosition.x = this.inputMoveMousePosition.x;
                this.lastMoveMousePosition.y = this.inputMoveMousePosition.y;
                this.inputMoveMousePosition.x = 0;
                this.inputMoveMousePosition.y = 0;

                if (this.inputMouseDown) {
                    this.lastMouseDownPosition.x = this.inputMouseDownPosition.x;
                    this.lastMouseDownPosition.y = this.inputMouseDownPosition.y;
                }
                this.inputMouseDownPosition.x = 0;
                this.inputMouseDownPosition.y = 0;

                if (this.inputMouseUp) {
                    this.lastMouseUpPosition.x = this.inputMouseUpPosition.x;
                    this.lastMouseUpPosition.y = this.inputMouseUpPosition.y;
                }
                this.inputMouseUpPosition.x = 0;
                this.inputMouseUpPosition.y = 0;

                this.lastMouseUp = this.inputMouseUp;
                if (this.lastMouseUp) {
                    const diff_x = this.lastMouseUpPosition.x - this.lastMouseDownPosition.x;
                    const diff_y = this.lastMouseUpPosition.y - this.lastMouseDownPosition.y;
                    const diff_mag = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
                    if (diff_mag < 10) {
                        this.inputMouseClick = true;
                    }
                    this.lastMouseDown = false;
                }

                this.lastMouseDown = this.lastMouseDown || this.inputMouseDown;
                this.lastMouseClick = this.inputMouseClick;

                this.inputMouseDown = false;
                this.inputMouseUp = false;
                this.inputMouseClick = false;

                this.lastMouseWheelMove.x = clamp(this.inputMouseWheelMove.x, -1, 1);
                this.lastMouseWheelMove.y = clamp(this.inputMouseWheelMove.y, -1, 1);
                this.inputMouseWheelMove.x = 0;
                this.inputMouseWheelMove.y = 0;
            },

            setup: function () {
                for (let key in EInputKey) {
                    this.keyInputInfos[EInputKey[key]] = KeyInputInfo.new();
                }
                this.setupArrow(true, 0.4, 0.08);
                this.setupButton(false, 0.4, 0.08);
                this.setupLR(true, 0.4, 0.08);
                this.setupStartSelect(false, 0.4, 0.08);
            },

            setupArrow: function (isRepeat, firstRepeat, secondRepeat) {
                this.getKeyInfo(EInputKey.UP).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.DOWN).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.LEFT).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.RIGHT).setup(isRepeat, firstRepeat, secondRepeat);
            },

            setupButton: function (isRepeat, firstRepeat, secondRepeat) {
                this.getKeyInfo(EInputKey.ENTER).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.CANCEL).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.SUB1).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.SUB2).setup(isRepeat, firstRepeat, secondRepeat);
            },

            setupLR: function (isRepeat, firstRepeat, secondRepeat) {
                this.getKeyInfo(EInputKey.L_TRIGGER).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.R_TRIGGER).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.L_SHOULDER).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.R_SHOULDER).setup(isRepeat, firstRepeat, secondRepeat);
            },

            setupStartSelect: function (isRepeat, firstRepeat, secondRepeat) {
                this.getKeyInfo(EInputKey.START).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.SELECT).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.L_STICK_PUSH).setup(isRepeat, firstRepeat, secondRepeat);
                this.getKeyInfo(EInputKey.R_STICK_PUSH).setup(isRepeat, firstRepeat, secondRepeat);
            },

            update: function (dt) {
                this.updateInput(dt);
            },

            keypressed: function (keycode) {
                if (!this.enableKeyboard) return;
                const key = GetKeySetting(keycode);
                // console.log(keycode);
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = true;
                }
            },

            keyreleased: function (keycode) {
                if (!this.enableKeyboard) return;
                const key = GetKeySetting(keycode);
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = false;
                }
            },

            gamepadpressed: function (btn) {
                const key = PadSetting[btn];
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = true;
                }
            },

            gamepadreleased: function (btn) {
                const key = PadSetting[btn];
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = false;
                }
            },

            gamepadAxis: function (x, y) {
                this.inputAxis.x = x;
                this.inputAxis.y = y;
            },

            gamepadTurnAxis: function (x, y) {
                this.inputTurnAxis.x = x;
                this.inputTurnAxis.y = y;
            },

            mousepressed: function (x, y, button) {
                this.inputMousePosition.x = x;
                this.inputMousePosition.y = y;
                this.inputMouseDownPosition.x = x;
                this.inputMouseDownPosition.y = y;
                this.inputMouseDown = true;

                if (button === 0) button = "left";
                else if (button === 1) button = "right";

                const key = MouseSetting[button];
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = true;
                }
            },

            mousereleased: function (x, y, button) {
                this.inputMouseUp = true;
                this.inputMouseUpPosition.x = x;
                this.inputMouseUpPosition.y = y;

                if (button === 0) button = "left";
                else if (button === 1) button = "right";

                const key = MouseSetting[button];
                if (key !== undefined) {
                    this.getKeyInfo(key).isOn = false;
                }
            },

            mousemoved: function (x, y, dx, dy) {
                this.inputMousePosition.x = x;
                this.inputMousePosition.y = y;
                this.inputMoveMousePosition.x = dx;
                this.inputMoveMousePosition.y = dy;
            },

            wheelmoved: function (x, y) {
                this.inputMouseWheelMove.x = x;
                this.inputMouseWheelMove.y = y;
            },

            touchpressed: function (id, x, y, dx, dy) {
                console.log(`[input.touchpressed] id:${id}, x:${x}, y:${y}, dx:${dx}, dy:${dy}`);
            },

            touchreleased: function (id, x, y, dx, dy) {
                console.log(`[input.touchreleased] id:${id}, x:${x}, y:${y}, dx:${dx}, dy:${dy}`);
            },

            touchmoved: function (id, x, y, dx, dy) {
                console.log(`[input.touchmoved] id:${id}, x:${x}, y:${y}, dx:${dx}, dy:${dy}`);
            },
        };
        obj.setup();
        return obj;
    }
};

// Input Functions
Input.setEnableKeyboard = function (enable) {
    return g_Input_Instance.setEnableKeyboard(enable);
};

Input.isOnInputKey = function (key) {
    return g_Input_Instance.isOnInputKey(key);
};

Input.isOnTriggerInputKey = function (key) {
    return g_Input_Instance.isOnTriggerInputKey(key);
};

Input.isOnFirstTriggerInputKey = function (key) {
    return g_Input_Instance.isOnFirstTriggerInputKey(key);
};

Input.isUpInputKey = function (key) {
    return g_Input_Instance.isUpInputKey(key);
};

Input.getLastInputAxis = function () {
    return g_Input_Instance.getLastInputAxis();
};

Input.getLastInputTurnAxis = function () {
    return g_Input_Instance.getLastInputTurnAxis();
};

Input.getLastAxisCrossInput = function (crossRate = 1) {
    const axis = Input.getLastInputAxis();
    let x = axis.x;
    let y = axis.y;

    if (Input.isOnInputKey(EInputKey.LEFT)) {
        x = -crossRate;
    } else if (Input.isOnInputKey(EInputKey.RIGHT)) {
        x = crossRate;
    }
    if (Input.isOnInputKey(EInputKey.UP)) {
        y = -crossRate;
    } else if (Input.isOnInputKey(EInputKey.DOWN)) {
        y = crossRate;
    }
    if (x !== 0 && y !== 0) {
        const mag = Math.sqrt(x * x + y * y);
        if (mag !== 0) {
            x /= mag;
            y /= mag;
            x *= crossRate;
            y *= crossRate;
        }
    }

    return { x, y };
};

Input.isClickMouse = function () {
    return g_Input_Instance.isLastMouseClick();
};

Input.isMouseDown = function () {
    return g_Input_Instance.isLastMouseDown();
};

Input.isMouseUp = function () {
    return g_Input_Instance.isLastMouseUp();
};

Input.isMoveMouse = function () {
    const move = g_Input_Instance.getLastMoveMousePosition();
    return move.x !== 0 || move.y !== 0;
};

Input.getLastMoveMousePosition = function () {
    return g_Input_Instance.getLastMoveMousePosition();
};

Input.getLastMousePosition = function () {
    return g_Input_Instance.getLastMousePosition();
};

Input.getLastMouseDownPosition = function () {
    return g_Input_Instance.getLastMouseDownPosition();
};

Input.getLastMouseUpPosition = function () {
    return g_Input_Instance.getLastMouseUpPosition();
};

Input.getLastMouseWheelMove = function () {
    return g_Input_Instance.getLastMouseWheelMove();
};

Input.keypressed = function (keycode) {
    g_Input_Instance.keypressed(keycode);
};

Input.keyreleased = function (keycode) {
    g_Input_Instance.keyreleased(keycode);
};

Input.gamepadpressed = function (btn) {
    g_Input_Instance.gamepadpressed(btn);
};

Input.gamepadreleased = function (btn) {
    g_Input_Instance.gamepadreleased(btn);
};

Input.gamepadAxis = function (x, y) {
    g_Input_Instance.gamepadAxis(x, y);
};

Input.gamepadTurnAxis = function (x, y) {
    g_Input_Instance.gamepadTurnAxis(x, y);
};

Input.mousepressed = function (x, y, btn) {
    g_Input_Instance.mousepressed(x, y, btn);
};

Input.mousereleased = function (x, y, btn) {
    g_Input_Instance.mousereleased(x, y, btn);
};

Input.wheelmoved = function (x, y) {
    g_Input_Instance.wheelmoved(x, y);
};

Input.mousemoved = function (x, y, dx, dy) {
    g_Input_Instance.mousemoved(x, y, dx, dy);
};

Input.touchpressed = function (id, x, y, dx, dy) {
    g_Input_Instance.touchpressed(id, x, y, dx, dy);
};

Input.touchreleased = function (id, x, y, dx, dy) {
    g_Input_Instance.touchreleased(id, x, y, dx, dy);
};

Input.touchmoved = function (id, x, y, dx, dy) {
    g_Input_Instance.touchmoved(id, x, y, dx, dy);
};

Input.setMousePosition = function (x, y) {
    // Assuming this is a web environment
    // document.body.style.cursor = `auto`;
};

Input.update = function (dt) {
    g_Input_Instance.update(dt);
};

// Instantiate the input manager

let g_Input_Instance = Input.new();

export { Input, EInputKey };
