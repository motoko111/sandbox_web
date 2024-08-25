import * as THREE from "three"
const clock = new THREE.Clock();

const vert = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main()
{
    vUv = uv;
    vNormal = normal;
    vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelMatrix * viewMatrix * instanceMatrix * vec4(position,1.0);
}
`;

const frag = `
// frag
uniform float u_time;
uniform float opacity;
uniform vec2 u_uv_scroll;
uniform sampler2D u_texture;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() 
{
    vec2 scroll = u_uv_scroll * u_time;
    vec4 color = texture2D(u_texture,mod(vUv + scroll, vec2(1.0,1.0)));
    color.a = opacity;
    if(color.a <= 0.0) {
        discard;
    }
    gl_FragColor = color;
}
`;

export class BoxMaterial extends THREE.ShaderMaterial {
    constructor(texture, option){
        const uniforms = THREE.UniformsUtils.merge([
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
            //THREE.UniformsLib.points,
            //THREE.UniformsLib.sprite,
            // custom
            {
                u_time: {
                    value:clock.getElapsedTime()
                },
                u_uv_scroll:{
                    value:new THREE.Vector2(0,0),
                },
                u_texture:{
                    value:texture
                }
            }
        ]);
        super({
            vertexShader:vert,
            fragmentShader:frag,
            uniforms:uniforms
        });
        if(option){
            for(let key in option){
                if(this.uniforms[key] !== undefined){
                    this.uniforms[key].value = option[key];
                }
            }
        }
        if(this.uniforms.opacity.value < 1){
            this.transparent = true;
        }
    }
    onBeforeRender(
        renderer,
        scene,
        camera,
        geometry,
        object,
        group,
    ) {
        this.uniforms.u_time.value = clock.getElapsedTime();
    }
}