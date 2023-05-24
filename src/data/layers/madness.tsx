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

    return {
        name,
        color,
        madness,
        display: jsx(() => (
            <>
                <MainDisplay resource={madness} color={color} />
            </>
        )),
        treeNode,
    };
});

export default layer;