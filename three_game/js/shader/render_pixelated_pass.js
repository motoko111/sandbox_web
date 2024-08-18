// 参考
// https://github.com/KodyJKing/hello-threejs

import * as THREE from "three"
import { WebGLRenderer, WebGLRenderTarget } from "three"
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js"

export class RenderPixelatedPass extends Pass {
    constructor(resolution, pixelSize, scene, camera, options = {}){
        super();
        this.pixelSize = pixelSize;
        this.resolution = new THREE.Vector2(); // THREE.Vector2
        this.renderResolution = new THREE.Vector2();
        this.setSize(resolution.x,resolution.y);

        this.scene = scene;
        this.camera = camera;
        this.fsQuad = new FullScreenQuad( this.material() );

        this.normalEdgeStrength = options.normalEdgeStrength ?? .7;
		this.depthEdgeStrength = options.depthEdgeStrength ?? .7;

        this.rgbRenderTarget = pixelRenderTarget(this.resolution, THREE.RGBAFormat, true);
        this.normalRenderTarget = pixelRenderTarget(this.resolution, THREE.RGBFormat, false);

        this.normalMaterial = new THREE.MeshNormalMaterial();
    }
    render(renderer, writeBuffer){
        const uniforms = this.fsQuad.material.uniforms;
        uniforms.normalEdgeStrength.value = this.normalEdgeStrength;
        uniforms.depthEdgeStrength.value = this.depthEdgeStrength;

        renderer.setRenderTarget(this.rgbRenderTarget);
        renderer.render(this.scene, this.camera);

        const overrideMaterial_old = this.scene.overrideMaterial;
        renderer.setRenderTarget( this.normalRenderTarget );
        this.scene.overrideMaterial = this.normalMaterial;
        renderer.render( this.scene, this.camera );
        this.scene.overrideMaterial = overrideMaterial_old;

        uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
        uniforms.tDepth.value = this.rgbRenderTarget.depthTexture;
        uniforms.tNormal.value = this.normalRenderTarget.texture;
        if(this.renderToScreen){
            renderer.setRenderTarget(null);
        }
        else{
            renderer.setRenderTarget(writeBuffer);
            if(this.clear) renderer.clear();
        }
        this.fsQuad.render(renderer);
    }
    dispose() {

		this.rgbRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		this.fsQuad.dispose();

	}
    setSize( width, height ) {

		this.resolution.set( width, height );
		this.renderResolution.set( ( width / this.pixelSize ) | 0, ( height / this.pixelSize ) | 0 );
		const { x, y } = this.renderResolution;
		this.rgbRenderTarget?.setSize( x, y );
		this.normalRenderTarget?.setSize( x, y );
		this.fsQuad?.material.uniforms.resolution.value.set( x, y, 1 / x, 1 / y );

	}
    setPixelSize( pixelSize ) {

		this.pixelSize = pixelSize;
		this.setSize( this.resolution.x, this.resolution.y );

	}
    
    material(){
        return new THREE.ShaderMaterial( {
            uniforms: {
                tDiffuse: { value: null },
                tDepth:  { value: null },
                tNormal:  { value: null },
                resolution: {
                    value: new THREE.Vector4(
                        this.resolution.x,
                        this.resolution.y,
                        1 / this.resolution.x,
                        1 / this.resolution.y,
                    )
                },
                normalEdgeStrength: {value:0},
                depthEdgeStrength: {value:0}
            },
            vertexShader:
                `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
                `,
            fragmentShader:
                `
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                uniform sampler2D tNormal;
                uniform vec4 resolution;
                uniform float normalEdgeStrength;
                uniform float depthEdgeStrength;
                varying vec2 vUv;

                float getDepth(int x, int y) {
                    return texture2D( tDepth, vUv + vec2(x, y) * resolution.zw ).r;
                }

                vec3 getNormal(int x, int y) {
                    return texture2D( tNormal, vUv + vec2(x, y) * resolution.zw ).rgb * 2.0 - 1.0;
                }

                float neighborNormalEdgeIndicator(int x, int y, float depth, vec3 normal) {
                    float depthDiff = getDepth(x, y) - depth;
                    vec3 neighborNormal = getNormal(x, y);
                    
                    // Edge pixels should yield to faces closer to the bias direction.
                    vec3 normalEdgeBias = vec3(1., 1., 1.); // This should probably be a parameter.
                    float normalDiff = dot(normal - neighborNormal, normalEdgeBias);
                    float normalIndicator = clamp(smoothstep(-.01, .01, normalDiff), 0.0, 1.0);
                    
                    // Only the shallower pixel should detect the normal edge.
                    float depthIndicator = clamp(sign(depthDiff * .25 + .0025), 0.0, 1.0);

                    return  (1.0 - dot(normal, neighborNormal)) * depthIndicator * normalIndicator;
                }

                float depthEdgeIndicator(float depth, vec3 normal) {
                    float diff = 0.0;
                    diff += clamp(getDepth(1, 0) - depth, 0.0, 1.0);
                    diff += clamp(getDepth(-1, 0) - depth, 0.0, 1.0);
                    diff += clamp(getDepth(0, 1) - depth, 0.0, 1.0);
                    diff += clamp(getDepth(0, -1) - depth, 0.0, 1.0);
                    return floor(smoothstep(0.01, 0.02, diff) * 2.) / 2.;
                }

                float normalEdgeIndicator(float depth, vec3 normal) {
                    float indicator = 0.0;

                    indicator += neighborNormalEdgeIndicator(0, -1, depth, normal);
                    indicator += neighborNormalEdgeIndicator(0, 1, depth, normal);
                    indicator += neighborNormalEdgeIndicator(-1, 0, depth, normal);
                    indicator += neighborNormalEdgeIndicator(1, 0, depth, normal);

                    return step(0.1, indicator);
                }

                float lum(vec4 color) {
                    vec4 weights = vec4(.2126, .7152, .0722, .0);
                    return dot(color, weights);
                }

                float smoothSign(float x, float radius) {
                    return smoothstep(-radius, radius, x) * 2.0 - 1.0;
                }

                void main() {
                    vec4 texel = texture2D( tDiffuse, vUv );

                    float depth = 0.0;
                    vec3 normal = vec3(0,0,0);
                    if(depthEdgeStrength > 0.0 || normalEdgeStrength > 0.0)
                    {
                        depth = getDepth(0,0);
                        normal = getNormal(0,0);
                    }

                    float dei = 0.0;
                    if(depthEdgeStrength > 0.0){
                        dei = depthEdgeIndicator(depth, normal);
                    }

                    float nei = 0.0;
                    if(normalEdgeStrength > 0.0){
                        nei = normalEdgeIndicator(depth, normal);
                    }
                    
                    float strength = dei > 0.0 ? (1.0 - depthEdgeStrength * dei) : (1.0 + normalEdgeStrength * nei);

                    gl_FragColor = vec4(texel.rgb * strength,texel.a);
                }
                `
        } )
    }
}

let pixelRenderTarget = function ( resolution, pixelFormat, depthTexture ) {
    const renderTarget = new WebGLRenderTarget(
        resolution.x, resolution.y,
        !depthTexture ?
            undefined
            : {
                depthTexture: new THREE.DepthTexture(
                    resolution.x,
                    resolution.y
                ),
                depthBuffer: true
            }
    )
    renderTarget.texture.format = pixelFormat
    renderTarget.texture.minFilter = THREE.NearestFilter
    renderTarget.texture.magFilter = THREE.NearestFilter
    renderTarget.texture.generateMipmaps = false
    renderTarget.stencilBuffer = false
    return renderTarget
}