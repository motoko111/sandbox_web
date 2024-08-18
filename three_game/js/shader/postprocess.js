import * as THREE from "three"
import { GreaterEqualDepth, Vector2 } from "three"
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { PixelatePass } from './pixelate_pass.js';
import { RenderPixelatedPass } from "./render_pixelated_pass.js"

export class PostProcess{
    constructor(renderer, scene, camera, screenWidth, screenHeight){
        this.pass = {};

        let screenResolution = new Vector2( screenWidth, screenHeight );
        let renderResolution = screenResolution.clone().divideScalar( 6 );
        // 整数へキャスト
        renderResolution.x |= 0;
        renderResolution.y |= 0;

        // composerを生成
        this.composer = new EffectComposer(renderer);
        // レンダーパスを追加
        //this.renderPass = new RenderPass(scene, camera);
        //this.composer.addPass(this.renderPass);
        this.pass.pixelated = new RenderPixelatedPass( renderResolution, 4, scene, camera, {normalEdgeStrength:1, depthEdgeStrength:1} );
        this.composer.addPass( this.pass.pixelated );
        // 各種ポスプロを追加
        this.pass.bloom = new UnrealBloomPass( screenResolution, .4, .1, .9 );
        this.pass.bloom.enabled = false;
        this.composer.addPass( this.pass.bloom );
        // this.composer.addPass( new PixelatePass(renderResolution));
    }

    update(){
        this.composer.render();
    }

    destroy(){
    }

    onResize(w,h){
        if(this.pass["pixelated"]){
            this.pass["pixelated"].setSize(w,h);
        }
    }

    isActive(){
        for(const key in this.pass){
            if(this.pass[key].enabled){
                return true;
            }
        }
        return false;
    }

    addDebugGUI(gui){
        let root = gui.addFolder("postProcess");
        {
            let folder = root.addFolder("pixelated");
            if(this.pass.pixelated){
                folder.add( this.pass.pixelated, 'enabled' );
                folder.add( this.pass.pixelated, "pixelSize" ).min( 1 ).max( 16 ).step( 1 )
                .onChange( () => {
                    this.pass.pixelated.setPixelSize( this.pass.pixelated.pixelSize )
                } );
                folder.add( this.pass.pixelated.renderResolution, "x").listen().disable();
                folder.add( this.pass.pixelated.renderResolution, "y").listen().disable();
                folder.add( this.pass.pixelated, 'normalEdgeStrength' ).min( 0 ).max( 2 ).step( .05 );
                folder.add( this.pass.pixelated, 'depthEdgeStrength' ).min( 0 ).max( 1 ).step( .05 );
            }
        }
        {
            let folder = root.addFolder("bloom");
            if(this.pass.bloom){
                folder.add( this.pass.bloom, 'enabled' );
                folder.add( this.pass.bloom, 'threshold' ).min( 0 ).max( 1 ).step( .05 );
                folder.add( this.pass.bloom, 'strength' ).min( 0 ).max( 3 ).step( .05 );
                folder.add( this.pass.bloom, 'radius' ).min( 0 ).max( 1 ).step( .05 );
            }
        }
    }
}