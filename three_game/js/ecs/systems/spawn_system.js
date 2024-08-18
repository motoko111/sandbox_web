import {System} from "../system.js";
import {BodyComponent} from "../components/body_component.js";
import { ObjectComponent } from "../components/object_component.js";
import { ThreePhysics } from "../../three_physics.js";
import { EnemyTag, PlayerTag } from "../components/tags.js";
import { Input,EInputKey } from '../../input.js';
import { MoveComponent } from "../components/move_component.js";
import { ThreeRender } from "../../three_render.js";
import * as THREE from "three";

export class SpawnSystem extends System {
    constructor(em, spawnFunc) {
        super();
        this.em = em;
        this.targetEntities = [];

        this.spawn = spawnFunc;
    }

    update() {
        let _this = this;
        let dt = GetDeltaTime();

        let isSpawn = Input.isOnTriggerInputKey(EInputKey.ENTER);
        if(isSpawn){
            this.spawn();
        }
    }
}