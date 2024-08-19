import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Model {
    constructor(obj, animations){
        this.obj = obj;
        this.animations = animations;
        this.mixer = new THREE.AnimationMixer(obj);
        this.clips = new Map();
        this.playingAnim = null;
        if(this.animations){
            for(let i = 0; i < this.animations.length; ++i){
                let animation = this.animations[i];
                let action = this.mixer.clipAction(animation);
                this.clips.set(action.name, action);
            }
        }
    }

    /*
    アニメーション再生.
    */
    playAnim(anim, isLoop, onFinished){
        if(this.clips.has(anim)){
            let _this = this;
            let action = this.clips.get(anim);
            action.finished = null;
            if(isLoop){
                action.setLoop(THREE.LoopRepeat);
            }
            else{
                action.setLoop(THREE.LoopOnce);
                action.finished = (e) => {
                    _this.stopAnim();
                    onFinished();
                }; // (e) => {}
            }
            this.playingAnim = action;
            action.play();
        }
    }
    pauseAnim(){
        if(this.playingAnim){
            this.playingAnim.paused = true;
        }
    }
    resumeAnim(){
        if(this.playingAnim){
            this.playingAnim.paused = false;
        }
    }
    resetAnim(){
        if(this.playingAnim){
            this.playingAnim.reset();
        }
    }
    stopAnim(){
        if(this.playingAnim){
            this.playingAnim.stop();
        }
    }
    // 頂点を取得する処理
    getVerticies(){
        const mesh = this.getMesh();
        if(!mesh) return null;
        const geometry = mesh.geometry;
        return {verticies:geometry.attributes.position.array, triangles:geometry.index.array}
    }
    getMesh(){
        for(let i = 0; i < this.obj.children.length; ++i){
            if(this.obj.children[i].isMesh){
                return this.obj.children[i];
            }
        }
        return null;
    }
}

export class ModelLoader{
    constructor() {
        this.loader = new GLTFLoader();
    }
    static createInstance(){
        ModelLoader.instance = new ModelLoader();
        return ModelLoader.instance;
    }
    static getInstance(){
        if(ModelLoader.instance){
            return ModelLoader.instance;
        }
        return ModelLoader.createInstance();
    }
    static async load(path, onloaded){
        THREE.Cache.enabled = true;
        const gltf = await ModelLoader.getInstance().loader.loadAsync(path);
        if(gltf){
            const obj = gltf.scene;
            const animations = gltf.animations;
            let model = new Model(obj, animations);
            if(onloaded) onloaded(model);
            return model;
        }
        else{
            console.error(path + ": load error.");
        }
        return null;
    }
}