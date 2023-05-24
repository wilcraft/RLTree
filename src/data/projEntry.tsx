import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import type { GenericTree } from "features/trees/tree";
import { branchedResetPropagation, createTree } from "features/trees/tree";
import { globalBus } from "game/events";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { LayerData, Player } from "game/player";
import player from "game/player";
import type { DecimalSource } from "util/bignum";
import Decimal, { format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed, toRaw } from "vue";
import manalayer from "./layers/mana";
import goldlayer from "./layers/gold";
import { createUpgrade, Upgrade } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import { noPersist } from "game/persistence";
import arcanum from "./layers/arcanum";
import madness from "./layers/madness";

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    const mana = createResource<DecimalSource>(10, "Mana");
    const best = trackBest(mana);
    const total = trackTotal(mana);

    const manaGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = new Decimal(1);
        gain = gain.add(manalayer.studyArcaneMod.apply(0)).add(manalayer.broadenHorizonsMod.apply(0));
        gain = gain.multiply(manalayer.delveArcaneMod.apply(1));
        gain = gain.multiply(arcanum.arcaneFocusMod.apply(1)).multiply(arcanum.arcaneSecretsMod.apply(1));
        return gain;
    });

    globalBus.on("update", diff => {
        mana.value = Decimal.add(mana.value, Decimal.times(manaGain.value, diff));
    });
    const oomps = trackOOMPS(mana, manaGain);

    const tree = createTree(() => ({
        nodes: [
            [manalayer.treeNode, goldlayer.treeNode, madness.treeNode],
            [arcanum.treeNode]
        ],
        branches: [],
        onReset() {
            mana.value = toRaw(this.resettingNode.value) === toRaw(manalayer.treeNode) ? 0 : 10;
            goldlayer.gold.value = 0;
            best.value = mana.value;
            total.value = mana.value;
        },
        resetPropagation: branchedResetPropagation
    })) as GenericTree;

    return {
        name: "Tree",
        links: tree.links,
        display: jsx(() => (
            <>
                {player.devSpeed === 0 ? <div>Game Paused</div> : null}
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>Dev Speed: {format(player.devSpeed)}x</div>
                ) : null}
                {player.offlineTime != null && player.offlineTime !== 0 ? (
                    <div>Offline Time: {formatTime(player.offlineTime)}</div>
                ) : null}
                <div>
                    {Decimal.lt(mana.value, "1e1000") ? <span>You have </span> : null}
                    <h2>{format(mana.value)}</h2>
                    {Decimal.lt(mana.value, "1e1e6") ? <span> mana</span> : null}
                </div>
                {Decimal.gt(manaGain.value, 0) ? <div>({oomps.value})</div> : null}
                <Spacer />
                {render(tree)}
            </>
        )),
        mana,
        best,
        total,
        oomps,
        tree,
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => {
    const layers: GenericLayer[] = [main, manalayer, goldlayer, arcanum, madness];
    // if ((player.layers?.gold as LayerData<typeof goldlayer>)?.buyScriptumArcanum?.bought) {
    //     layers.push(arcanum);
    // }
    return layers;
}

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
