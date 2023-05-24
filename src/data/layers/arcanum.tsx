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
import madness from "./madness";

const id = "A";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Arcanum";
    const color = "#78e3e1";
    const arcaneFocusLeft = createResource<DecimalSource>(0);
    const arcaneSecretsLeft = createResource<DecimalSource>(0);
    const gazedIntoForbidden = createResource<boolean>(false);

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        visibility: computed(() => {
            return goldlayer.buyScriptumArcanum.bought.value ? Visibility.Visible : Visibility.None
        })
    }));

    const arcaneFocusMod = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: 2,
            enabled: computed(() => {
                return Decimal.gt(arcaneFocusLeft.value, 0)
            })
        }))
    ]);

    const arcaneSecretsMod = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: 2,
            enabled: computed(() => {
                return Decimal.gt(arcaneSecretsLeft.value, 0)
            })
        }))
    ]);

    const gazeIntoForbidden = createClickable(() => ({
        display: {
            title: "Gaze Into the Forbidden",
            description: "Unlock Arcane Secrets in exchange of Madness",
        },
        style: {
            backgroundColor: "black",
            color: "white"
        },
        visibility: computed(() => {
            let tmp: Visibility = Visibility.Visible;
            tmp = gazedIntoForbidden.value ? Visibility.None : Visibility.Visible;
            return tmp;
        }),
        onClick() {
            gazedIntoForbidden.value = true;
            madness.madness.value = Decimal.add(madness.madness.value, 1);
        }
    }))

    const TEMPGOOD = createClickable(() => ({
        display: {
            title: "TEMP GOOD",
            description: "TEMP GOOD"
        },
        style: {
            backgroundColor: "white",
            color: "black"
        },
        visibility: computed(() => {
            let tmp: Visibility = Visibility.Visible;
            tmp = gazedIntoForbidden.value ? Visibility.None : Visibility.Visible;
            return tmp;
        }),
        onClick() {
            
        }
    }))

    const arcaneFocus = createAction(() => ({
        duration: 10,
        display: {
            title: "Arcane Focus",
            description: "Temporarily double mana gain"
        },
        onClick() {
            arcaneFocusLeft.value = 10;
        }
    }));

    const arcaneSecrets = createAction(() => ({
        duration: 10,
        display: {
            title: "Arcane Secrets",
            description: "Temporarily double mana gain in exchange of madness"
        },
        style: {
            backgroundColor: "black",
            color: "white"
        },
        visibility: computed(() => {
            return gazedIntoForbidden.value? Visibility.Visible : Visibility.None;
        }),
        onClick() {
            arcaneSecretsLeft.value = 10;
            madness.madness.value = Decimal.add(madness.madness.value, 1);
        }
    }));

    this.on("update", diff => {
        arcaneFocusLeft.value = Decimal.max(Decimal.sub(arcaneFocusLeft.value, Decimal.times(1, diff)), 0);
        arcaneSecretsLeft.value = Decimal.max(Decimal.sub(arcaneSecretsLeft.value, Decimal.times(1, diff)), 0);
    });

    return {
        name,
        color,
        arcaneFocusLeft,
        arcaneFocus,
        arcaneFocusMod,
        arcaneSecrets,
        arcaneSecretsMod,
        arcaneSecretsLeft,
        gazedIntoForbidden,
        gazeIntoForbidden,
        TEMPGOOD,
        display: jsx(() => (
            <>
                <MainDisplay resource={main.mana} color={color} />
                {renderRow(arcaneFocus)}
                {renderRow(gazeIntoForbidden, TEMPGOOD)}
                {renderRow(arcaneSecrets)}
            </>
        )),
        treeNode,
    };
});

export default layer;