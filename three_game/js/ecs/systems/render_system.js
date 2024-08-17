import {System} from "../system.js";
import * as THREE from "three";
import { AddObjectTag, DeleteObjectTag, ObjectComponent } from "../components/object_component.js";
import { RenderResizeEvent } from "../components/events.js";
import { ThreeRender } from "../../three_render.js";

export class RenderSystem extends System {
    constructor(em) {
        super();
        this.em = em;
        this.targetEntities = [];
    }

    update() {
        // 描画
        ThreeRender.getInstance().update();
    }
}