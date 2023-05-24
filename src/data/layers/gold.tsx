import { createLayerTreeNode } from "data/common";
import { main } from "data/projEntry";
import { createClickable } from "features/clickables/clickable";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createUpgrade } from "features/upgrades/upgrade";
import { createLayer, BaseLayer, addLayer } from "game/layers";
import { createSequentialModifier, createAdditiveModifier, createMultiplicativeModifier } from "game/modifiers";
import { noPersist } from "game/persistence";
import { createCostRequirement, createBooleanRequirement } from "game/requirements";
import Decimal, { DecimalSource } from "lib/break_eternity";
import { formatWhole } from "util/break_eternity";
import { renderRow } from "util/vue";
import { render } from "vue";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { createAchievement, GenericAchievement } from "features/achievements/achievement";
import player from "game/player";
import arcanum from "./arcanum";

const id = "G";
const layer = createLayer(id, function (this: BaseLayer) {
    const gold = createResource<DecimalSource>(0, "Gold");
    const name = "Gold";
    const color = "#ebd06e";

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
    }));

    const buyScriptumArcanum = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(gold),
            cost: 10
        })),
        display: {
            title: "Scriptum Arcanum",
            description: "Unlock Basic Arcane Spells"
        }
    }));

    const buyScriptumAchievement = createAchievement(() => ({
        requirements: createBooleanRequirement(() => buyScriptumArcanum.bought.value),
        display: {
            requirement: `Buy the Scriptum Arcanum`,
            effectDisplay: 'Unlock Basic Arcane Spells'
        },
        onComplete() {
            addLayer(arcanum, player);
        }
    })) as GenericAchievement;

    return {
        name,
        color,
        gold,
        buyScriptumArcanum,
        buyScriptumAchievement,
        display: jsx(() => (
            <>
                <MainDisplay resource={gold} color={color} />
                {renderRow(buyScriptumArcanum)}
            </>
        )),
        treeNode,
    };
});

export default layer;