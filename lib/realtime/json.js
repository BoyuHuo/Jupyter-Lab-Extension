"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const map_1 = require("./map");
/**
 * A collaborative map for JSON data.
 */
class GoogleJSON extends map_1.GoogleMap {
    /**
     * Constructor for a collaborative JSON object.
     */
    constructor(map) {
        super(map, coreutils_1.JSONExt.deepEqual);
    }
    /**
     * Serialize the model to JSON.
     */
    toJSON() {
        const out = Object.create(null);
        for (let key of this.keys()) {
            const value = this.get(key);
            if (!value) {
                continue;
            }
            if (coreutils_1.JSONExt.isPrimitive(value)) {
                out[key] = value;
            }
            else {
                out[key] = JSON.parse(JSON.stringify(value));
            }
        }
        return out;
    }
}
exports.GoogleJSON = GoogleJSON;
