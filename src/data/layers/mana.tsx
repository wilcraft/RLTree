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
import { BaseLayer, addLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderRow } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createUpgrade } from "features/upgrades/upgrade";
import { noPersist } from "game/persistence";
import { createBooleanRequirement, createCostRequirement, requirementsMet } from "game/requirements";
import Decimal from "util/bignum";
import { createSequentialModifier, createMultiplicativeModifier, createModifierSection, createAdditiveModifier } from "game/modifiers";
import { computed } from "vue";
import { createClickable } from "features/clickables/clickable";
import { formatWhole } from "util/break_eternity";
import Formula from "game/formulas/formulas";
import goldlayer from "./gold";
import player from "game/player";


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
            resource: noPersist(main.mana),
            cost: 10
        })),
        display: {
            title: "Study the Arcane",
            description: "Add 1 to mana gain"
        }
    }));
    const studyArcaneMod = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            enabled: studyArcaneUpg.bought
        }))
    ]);

    const delveArcaneUpg = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(main.mana),
            cost: 40
        })),
        display: {
            title: "Delve into the Arcane",
            description: "Double mana gain"
        }
    }));
    const delveArcaneMod = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: 2,
            enabled: delveArcaneUpg.bought
        }))
    ]);

    const broadenHorizonsUpg = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(main.mana),
            cost: 100
        })),
        display: {
            title: "Broaden Your Horizons",
            description: "Add 3 to mana gain"
        }
    }));
    const broadenHorizonsMod = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 3,
            enabled: broadenHorizonsUpg.bought
        }))
    ]);

    const hostMagicShow = createClickable(() => ({
        requirements: createBooleanRequirement(() => Decimal.gt(main.mana.value, 10)),
        display: {
            title: "Host a Magic Show",
            description: `Spend 10 Mana for 1 Gold`
        },
        canClick: computed(() => Decimal.gt(main.mana.value, 10)),
        onClick() {
            main.mana.value = Decimal.sub(main.mana.value, 10);
            goldlayer.gold.value = Decimal.add(goldlayer.gold.value, 1);
        }
    }));


    const ManaUpgrades = {studyArcaneUpg}

    return {
        name,
        color,
        hostMagicShow,
        studyArcaneUpg,
        delveArcaneUpg,
        studyArcaneMod,
        delveArcaneMod,
        broadenHorizonsUpg,
        broadenHorizonsMod,
        display: jsx(() => (
            <>
                <MainDisplay resource={main.mana} color={color} />
                {render(hostMagicShow)}
                {renderRow(studyArcaneUpg, delveArcaneUpg, broadenHorizonsUpg)}
            </>
        )),
        treeNode
    };
});

export default layer;