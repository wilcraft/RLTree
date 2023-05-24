/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, trackOOMPS } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderRow } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createUpgrade } from "features/upgrades/upgrade";
import { noPersist } from "game/persistence";
import { createCostRequirement } from "game/requirements";
import Decimal from "util/bignum";
import { createSequentialModifier, createMultiplicativeModifier, createModifierSection, createAdditiveModifier } from "game/modifiers";
import { computed } from "vue";

const id = "M";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Mana";
    const color = "#72ede7";

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
    }));

    
    const studyArcaneUpg = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: main.mana,
            cost: 10
        })),
        display: "Gain 1 mana/second"
    }));
    const studyArcaneMod = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            enabled: studyArcaneUpg.bought
        }))
    ]);

    const delveArcaneUpg = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: main.mana,
            cost: 40
        })),
        display: "Double mana gain"
    }));
    const delveArcaneMod = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: 2,
            enabled: delveArcaneUpg.bought
        }))
    ]);

    const ManaUpgrades = {studyArcaneUpg}

    return {
        name,
        color,
        studyArcaneUpg,
        delveArcaneUpg,
        studyArcaneMod,
        delveArcaneMod,
        display: jsx(() => (
            <>
                <MainDisplay resource={main.mana} color={color} />
                {renderRow(studyArcaneUpg, delveArcaneUpg)}
            </>
        )),
        treeNode,
    };
});

export default layer;