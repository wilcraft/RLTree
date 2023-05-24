import { createLayerTreeNode } from "data/common";
import { main } from "data/projEntry";
import { createClickable } from "features/clickables/clickable";
import { createCumulativeConversion } from "features/conversion";
import { Visibility, jsx } from "features/feature";
import { createUpgrade } from "features/upgrades/upgrade";
import { createLayer, BaseLayer } from "game/layers";
import { createSequentialModifier, createAdditiveModifier, createMultiplicativeModifier } from "game/modifiers";
import { noPersist } from "game/persistence";
import { createCostRequirement, createBooleanRequirement } from "game/requirements";
import Decimal, { DecimalSource } from "lib/break_eternity";
import { formatWhole } from "util/break_eternity";
import { render, renderRow } from "util/vue";
import { computed } from "vue";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import goldlayer from './gold';
import { createAction } from "features/action";
import { createAchievement } from "features/achievements/achievement";

const id = "MAD";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Madness";
    const color = "#d13636";
    const madness = createResource<DecimalSource>(0, "Madness");

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        visibility: computed(() => {
            return Decimal.gt(madness.value, 0) ? Visibility.Visible : Visibility.None
        })
    }));

    const madnessMilestone1 = createAchievement(() => ({
        requirements: createBooleanRequirement(() => Decimal.gte(madness.value, 1)),
        display: {
            requirement: `Madness Level 1`,
            effectDisplay: "Add 1 to mana gain"
        }
    }));
    const madnessMilestone2 = createAchievement(() => ({
        requirements: createBooleanRequirement(() => Decimal.gte(madness.value, 10)),
        display: {
            requirement: `Madness Level 2`,
            effectDisplay: "Unlocks Devote to Evil"
        }
    }));
    const madnessMilestone3 = createAchievement(() => ({
        requirements: createBooleanRequirement(() => Decimal.gte(madness.value, 100)),
        display: {
            requirement: `Madness Level 3`,
            effectDisplay: "Unlocks Long Lost Knowledge and Sacrificial Rite"
        }
    }));
    const madnessMilestone4 = createAchievement(() => ({
        requirements: createBooleanRequirement(() => Decimal.gte(madness.value, 1000)),
        display: {
            requirement: `Madness Level 4`,
            effectDisplay: "Unlocks the Necromantic Practices"
        }
    }));
    const madnessMilestone5 = createAchievement(() => ({
        requirements: createBooleanRequirement(() => Decimal.gte(madness.value, 10000)),
        display: {
            requirement: `Madness Level 5`,
            effectDisplay: "Unlocks the Eldritch Priest"
        }
    }));

    const devoteToEvil = createUpgrade(() => ({
        visibility: computed(() => {
            return madnessMilestone2.earned.value? Visibility.Visible : Visibility.None;
        }),
        requirements: createCostRequirement(() => ({
            resource: noPersist(madness),
            cost: 5
        })),
        display: {
            title: "Devote to Evil",
            description: "Gain 1 madness per second"
        }
    }));
    const devoteToEvilMod = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            enabled: devoteToEvil.bought
        }))
    ]);

    this.on("update", diff => {
        madness.value = Decimal.add(madness.value, Decimal.times(devoteToEvilMod.apply(0), diff));
    });

    return {
        name,
        color,
        madness,
        madnessMilestone1,
        madnessMilestone2,
        madnessMilestone3,
        madnessMilestone4,
        madnessMilestone5,
        devoteToEvil,
        display: jsx(() => (
            <>
                <MainDisplay resource={madness} color={color} />
                {renderRow(madnessMilestone1, madnessMilestone2, madnessMilestone3, madnessMilestone4, madnessMilestone5)}
                {renderRow(devoteToEvil)}
            </>
        )),
        treeNode,
    };
});

export default layer;