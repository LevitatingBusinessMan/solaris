<template>
<div class="row bg-primary" v-if="userPlayer && player">
    <div class="col">
        <div class="table-responsive mb-0">
            <table class="table table-sm mb-0">
                <thead>
                    <tr v-if="userPlayer && player != userPlayer">
                        <th></th>
                        <th></th>
                        <th></th>
                        <th class="text-right">You</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="row-icon"><i class="fas fa-binoculars"></i></td>
                        <td>Scanning</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('scanning'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('scanning')}">
                            {{player.research.scanning.level}}
                            <span v-if="player.research.scanning.level != player.research.scanning.level">({{player.research.scanning.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.scanning.level > player.research.scanning.level,
                                    'text-danger': userPlayer.research.scanning.level < player.research.scanning.level}">
                            {{userPlayer.research.scanning.level}}
                            <span v-if="userPlayer.research.scanning.level != userPlayer.research.scanning.level">({{userPlayer.research.scanning.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-gas-pump"></i></td>
                        <td>Hyperspace Range</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('hyperspace'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('hyperspace')}">
                            {{player.research.hyperspace.level}}
                            <span v-if="player.research.hyperspace.level != player.research.hyperspace.level">({{player.research.hyperspace.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.hyperspace.level > player.research.hyperspace.level,
                                    'text-danger': userPlayer.research.hyperspace.level < player.research.hyperspace.level}">
                            {{userPlayer.research.hyperspace.level}}
                            <span v-if="userPlayer.research.hyperspace.level != userPlayer.research.hyperspace.level">({{userPlayer.research.hyperspace.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-globe-europe"></i></td>
                        <td>Terraforming</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('terraforming'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('terraforming')}">
                            {{player.research.terraforming.level}}
                            <span v-if="player.research.terraforming.level != player.research.terraforming.level">({{player.research.terraforming.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.terraforming.level > player.research.terraforming.level,
                                    'text-danger': userPlayer.research.terraforming.level < player.research.terraforming.level}">
                            {{userPlayer.research.terraforming.level}}
                            <span v-if="userPlayer.research.terraforming.level != userPlayer.research.terraforming.level">({{userPlayer.research.terraforming.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-microscope"></i></td>
                        <td>Experimentation</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('experimentation'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('experimentation')}">
                            {{player.research.experimentation.level}}
                            <span v-if="player.research.experimentation.level != player.research.experimentation.level">({{player.research.experimentation.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.experimentation.level > player.research.experimentation.level,
                                    'text-danger': userPlayer.research.experimentation.level < player.research.experimentation.level}">
                            {{userPlayer.research.experimentation.level}}
                            <span v-if="userPlayer.research.experimentation.level != userPlayer.research.experimentation.level">({{userPlayer.research.experimentation.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-fighter-jet"></i></td>
                        <td>Weapons</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('weapons'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('weapons')}">
                            {{player.research.weapons.level}}
                            <span v-if="player.research.weapons.level != player.research.weapons.level">({{player.research.weapons.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.weapons.level > player.research.weapons.level,
                                    'text-danger': userPlayer.research.weapons.level < player.research.weapons.level}">
                            {{userPlayer.research.weapons.level}}
                            <span v-if="userPlayer.research.weapons.level != userPlayer.research.weapons.level">({{userPlayer.research.weapons.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-money-bill-alt"></i></td>
                        <td>Banking</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('banking'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('banking')}">
                            {{player.research.banking.level}}
                            <span v-if="player.research.banking.level != player.research.banking.level">({{player.research.banking.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.banking.level > player.research.banking.level,
                                    'text-danger': userPlayer.research.banking.level < player.research.banking.level}">
                            {{userPlayer.research.banking.level}}
                            <span v-if="userPlayer.research.banking.level != userPlayer.research.banking.level">({{userPlayer.research.banking.level}})</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="row-icon"><i class="fas fa-industry"></i></td>
                        <td>Manufacturing</td>
                        <td class="text-right"
                            :class="{'text-success': userPlayer && player == userPlayer && hasHighestTechLevel('manufacturing'),
                                    'text-danger': userPlayer && player == userPlayer && hasLowestTechLevel('manufacturing')}">
                            {{player.research.manufacturing.level}}
                            <span v-if="player.research.manufacturing.level != player.research.manufacturing.level">({{player.research.manufacturing.level}})</span>
                        </td>
                        <td v-if="userPlayer && player != userPlayer" class="text-right"
                            :class="{'text-success': userPlayer.research.manufacturing.level > player.research.manufacturing.level,
                                    'text-danger': userPlayer.research.manufacturing.level < player.research.manufacturing.level}">
                            {{userPlayer.research.manufacturing.level}}
                            <span v-if="userPlayer.research.manufacturing.level != userPlayer.research.manufacturing.level">({{userPlayer.research.manufacturing.level}})</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  methods: {
      hasHighestTechLevel (techKey) {
          return gameHelper.userPlayerHasHighestTechLevel(this.$store.state.game, techKey)
      },
      hasLowestTechLevel (techKey) {
          return gameHelper.userPlayerHasLowestTechLevel(this.$store.state.game, techKey)
      }
  },
  computed: {
      player () {
          return gameHelper.getPlayerById(this.$store.state.game, this.playerId)
      },
      userPlayer () {
          return gameHelper.getUserPlayer(this.$store.state.game)
      }
  }
}
</script>

<style scoped>
.row-icon {
    width: 1%;
}
</style>
