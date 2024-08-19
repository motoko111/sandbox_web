import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const clock = new THREE.Clock();


const vertShaderText = `// vert
uniform float u_time;
uniform vec2 u_resolution;

void main()
{
    gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position,1.0);
}
`;
        const fragShaderText = `// frag
uniform float u_time;
uniform vec2 u_resolution;

void main() 
{
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;


class ShaderEditor{
    constructor(id){
        this.id = id;
        this.showTrueCode = false;
        this.editor = ace.edit(id);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/glsl");
        this.onChange = null;
        this.onSave = null;
        let _this = this;
        this.editor.session.on('change', function(){
            let txt = _this.editor.getValue();;
            if(_this.onChange) _this.onChange(txt);
        });
        this.editor.commands.addCommand({
            name: 'save',
            bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
            exec: function(editor) {
                if(_this.onSave)_this.onSave();
            }
        });
        this.editor.commands.addCommand({
            name: 'show true code',
            bindKey: {win: "Alt-T", "mac": "Alt-T"},
            exec: function(editor) {
                _this.setVisibleTrueCode(!_this.showTrueCode);
            }
        });
        this.editor.setOption("printMargin", false); // 線を消す
        this.setupGLSLComplete();

        this.editor_true = ace.edit(id + "_true");
        this.editor_true.setTheme("ace/theme/monokai");
        this.editor_true.session.setMode("ace/mode/glsl");
        this.editor_true.commands.addCommand({
            name: 'show true code',
            bindKey: {win: "Alt-T", "mac": "Alt-T"},
            exec: function(editor) {
                _this.setVisibleTrueCode(!_this.showTrueCode);
            }
        });
    }
    saveLocalStorage(){
        let content = this.editor.getValue();
        localStorage.setItem(this.id, content);
    }
    loadLocalStorage(){
        let content = localStorage.getItem(this.id);
        if(content){
            this.editor.setValue(content, -1);
        }
    }
    setVisibleTrueCode(flag){
        this.showTrueCode = flag;
        if(this.showTrueCode){
            document.querySelector("#" + this.id).classList.add("hidden");
            document.querySelector("#" + this.id + "_true").classList.remove("hidden");
            this.editor_true.gotoLine(1, 0);
        }
        else{
            document.querySelector("#" + this.id).classList.remove("hidden");
            document.querySelector("#" + this.id + "_true").classList.add("hidden");
            this.editor.gotoLine(1, 0);
        }
    }
    setError(txt){
        document.querySelector("#" + this.id + "_error").textContent = txt;
    }
    setupGLSLComplete(add_keywords = [], add_keyword_map = {}){
        let _this = this;
        ace.config.loadModule('ace/ext/language_tools', function() {
            _this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            const glslKeywords = [
                "vec2", "vec3", "vec4", "mat2", "mat3", "mat4", "float", "int", "bool", "void",
                "gl_FragColor", "gl_FragCoord", "gl_Position", "sin", "cos", "tan", "asin", "acos", "atan",
                "pow", "exp", "log", "sqrt", "abs", "floor", "ceil", "fract", "mod", "min", "max", "clamp",
                "mix", "step", "smoothstep", "length", "distance", "dot", "cross", "normalize", "reflect",
                "refract", "texture2D", "texture","sampler2D",
                "include", "uniform", "varying", "attribute",
            ];
            add_keywords.forEach((keyword) => {
                glslKeywords.push(keyword);
            });
            // 変数を動的に抽出する関数
            function extractVariables(code) {
                const variableRegex = /\b((?:uniform|varying|attribute|const|vec[234]|float|int|bool)\s+)+(\w+)/g;
                let match;
                const variables = new Set();
                while (match = variableRegex.exec(code)) {
                    if(!add_keyword_map[match[match.length-1]]){
                        variables.add(match[match.length-1]);
                    }
                }
                return Array.from(variables);
            }
            const customCompleter = {
                getCompletions: function(editor, session, pos, prefix, callback) {
                    const code = session.getValue();
                    const variables = extractVariables(code);

                    const completions = variables.map(variable => ({
                        caption: variable,
                        value: variable,
                        meta: add_keyword_map[variable] ? add_keyword_map[variable] : "dynamic variable"
                    }));
                    if(completions.length > 0){
                        callback(null, completions);
                    }

                    if (prefix.length === 0) {
                        return callback(null, []);
                    } else {
                        callback(null, glslKeywords.map(function(word) {
                            return {
                                caption: word,
                                value: word,
                                meta: add_keyword_map[word] ? add_keyword_map[word] : ""
                            };
                        }));
                    }
                }
            };
            _this.editor.completers = [customCompleter];
        }
        );
    }
}

export class ThreeShaderEditor{
    constructor(){
        this.canvas = document.querySelector("#threeCanvas");
        this.editors = [];
        this.vertexShaderEditor = this.setupEditor("editor_vert", vertShaderText);
        this.fragmentShaderEditor = this.setupEditor("editor_frag", fragShaderText);
        this.editors.push(this.vertexShaderEditor );
        this.editors.push(this.fragmentShaderEditor);

        this.setupThree();

        let _this = this;
        this.vertexShaderEditor.onChange = (txt) =>{
            _this.updateShader(true, false);
        };
        this.fragmentShaderEditor.onChange = (txt) =>{
            _this.updateShader(false, true);
        };
        this.vertexShaderEditor.onSave = () => {
            _this.vertexShaderEditor.saveLocalStorage();
            _this.fragmentShaderEditor.saveLocalStorage();
        };
        this.fragmentShaderEditor.onSave = () => {
            _this.vertexShaderEditor.saveLocalStorage();
            _this.fragmentShaderEditor.saveLocalStorage();
        };
        let keywords = [];
        let keywordsMap = {};
        let getType = (v) => {
            let type = typeof v;
            if(type == "object"){
                if(v instanceof THREE.Vector2){
                    type = "vec2";
                }
                else if(v instanceof THREE.Vector3){
                    type = "vec3";
                }
                else if(v instanceof THREE.Vector4){
                    type = "vec4";
                }
                else if(v instanceof THREE.Matrix2){
                    type = "mat2";
                }
                else if(v instanceof THREE.Matrix3){
                    type = "mat3";
                }
                else if(v instanceof THREE.Matrix4){
                    type = "mat4";
                }
                else if(v instanceof THREE.Color){
                    type = "color";
                }
                else{
                    type = Object.prototype.toString.call(v);
                }
            }
            return type;
        };
        for(let key in this.uniforms){
            keywords.push(key);
            let v = this.uniforms[key].value;
            let type = this.uniforms[key].type;
            if(!type){
                type = getType(v);
            }
            keywordsMap[key] = "uniform " + type;
        }
        // https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
        // 標準のuniformとattribute
        let defaultMap = {
            'modelMatrix':['uniform','mat4'],
            'modelViewMatrix':['uniform','mat4'],
            'projectionMatrix':['uniform','mat4'],
            'viewMatrix':['uniform','mat4'],
            'normalMatrix':['uniform','mat4'],
            'cameraPosition':['uniform','mat3'],

            'position':['attribute','vec3'],
            'normal':['attribute','vec3'],
            'uv':['attribute','vec2'],
        }
        for(let key in defaultMap){
            keywords.push(key);
            keywordsMap[key] = defaultMap[key][0] + " " + defaultMap[key][1];
        }
        this.vertexShaderEditor.setupGLSLComplete(keywords,keywordsMap);
        this.fragmentShaderEditor.setupGLSLComplete(keywords,keywordsMap);
    }
    setupEditor(id,txt){
        let editor = new ShaderEditor(id);
        editor.editor.setValue(txt, -1);
        editor.loadLocalStorage();
        return editor;
    }
    setupThree(){
        // サイズを指定
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // レンダラーを作成
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false
        });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = false;

        // シーン
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x2c5e44 );

        // カメラ
        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        this.camera.position.set(0,2,3);
        this.scene.add(this.camera);

        // ライト
        this.ambientLight = new THREE.AmbientLight( 0xffffff , 2 );
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.directionalLight.position.set(80, 100, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.set( 512, 512 );
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.left = -50;
        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);

        // カメラ操作
        this.controls = new OrbitControls(this.camera, this.canvas);

        // グリッド
        this.gridHelper = new THREE.GridHelper(50,50);
        this.scene.add(this.gridHelper);

        // 方向
        this.axesHelper = new THREE.AxesHelper(180);
        this.scene.add(this.axesHelper);

        // texture
        const texLoader = new THREE.TextureLoader();
        let pixelTex = (tex) => {
            tex.minFilter = THREE.NearestFilter
            tex.magFilter = THREE.NearestFilter
            tex.generateMipmaps = false
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.RepeatWrapping
            return tex
        };
        this.texture = pixelTex( texLoader.load( "./assets/checker.png" ) );

        // var cubeShader = THREE.ShaderLib['cube'];
        // THREE.ShaderLib

        // uniform
        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.common,
            THREE.UniformsLib.specularmap,
            THREE.UniformsLib.envmap,
            THREE.UniformsLib.aomap,
            THREE.UniformsLib.lightmap,
            THREE.UniformsLib.emissivemap,
            THREE.UniformsLib.bumpmap,
            THREE.UniformsLib.normalmap,
            THREE.UniformsLib.displacementmap,
            THREE.UniformsLib.gradientmap,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.lights,
            THREE.UniformsLib.points,
            THREE.UniformsLib.sprite,
            // custom
            {
                u_resolution: { 
                    value:new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight)
                },
                u_time: {
                    value:0.0
                },
                u_texture : {
                    value:this.texture
                }
            }
        ]);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertShaderText,
            fragmentShader: fragShaderText,
            lights: true,
        });
        this.geometry_box = new THREE.BoxGeometry(1,1,1);
        this.mesh = new THREE.Mesh(this.geometry_box, this.material);
        this.scene.add(this.mesh);

        let _this = this;
        let tick = () => {
            _this.material.uniforms.u_time.value = clock.getElapsedTime();
            _this.renderer.render(_this.scene, _this.camera);
            requestAnimationFrame(tick);
        };
        tick();

        this.renderer.debug.checkShaderErrors = true;
        this.renderer.debug.onShaderError = (gl, program, glVertexShader, glFragmentShader) => {
            let vs = gl.getShaderSource(glVertexShader);
            let fs = gl.getShaderSource(glFragmentShader);
            const vs_errors = gl.getShaderInfoLog(glVertexShader).trim();
            const fs_errors = gl.getShaderInfoLog(glFragmentShader).trim();

            _this.material.vertexShader = _this.prevVertexShaderText;
            _this.material.fragmentShader = _this.prevFragmentShaderText;
            _this.material.needsUpdate = true;

            console.log(vs_errors);
            console.log(fs_errors);

            _this.vertexShaderEditor.setError(vs_errors);
            _this.fragmentShaderEditor.setError(fs_errors);
        };

        this.updateShader();
        
        this.prevVertexShaderText = this.material.vertexShader;
        this.prevFragmentShaderText = this.material.fragmentShader;
    }
    updateShader(vertex = true, frag = true){
        let _this = this;
        
        let gl = this.renderer.getContext();
        const program = this.renderer.properties.get(this.material).program;
        //const vertexShader = program.vertexShader; // 頂点シェーダー
        //const fragmentShader = program.fragmentShader; // フラグメントシェーダー

        if(vertex)
        {
            _this.prevVertexShaderText = _this.material.vertexShader;
            let prev =  _this.material.vertexShader;
            _this.vertexShaderEditor.setError("");
            //_this.vertexShaderEditor.editor_true.setValue(gl.getShaderSource(vertexShader));
            if(_this.checkCompile("vertexShader", _this.vertexShaderEditor.editor.getValue())){
                _this.material.needsUpdate = true;
            }
            else{
                console.log("error.")
                _this.material.vertexShader = prev;
                _this.material.needsUpdate = true;
            }
        }
        if(frag)
        {
            _this.prevFragmentShaderText = _this.material.fragmentShader;
            let prev =  _this.material.fragmentShader;
            _this.fragmentShaderEditor.setError("");
            //_this.fragmentShaderEditor.editor_true.setValue(gl.getShaderSource(fragmentShader));
            if(_this.checkCompile("fragmentShader", _this.fragmentShaderEditor.editor.getValue())){
                _this.material.needsUpdate = true;
            }
            else{
                console.log("error.")
                _this.material.fragmentShader = prev;
                _this.material.needsUpdate = true;
            }
        }
    }
    checkCompile(shaderName, txt){
        try{
            this.material[shaderName] = txt;
            this.renderer.compile( this.mesh, this.camera );
        }
        catch(e){
            const programs = this.renderer.info.programs;
            console.log(programs);
            return false;
        }
        return true;
    }
    onResize(w,h){
        this.canvas.width = w * 0.5;
        this.canvas.height = h;
        w = this.canvas.clientWidth;
        h = this.canvas.clientHeight;
        this.renderer.setSize(w,h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.material.uniforms.u_resolution.value.set(this.canvas.clientWidth, this.canvas.clientHeight);
    }
}
