<template>
	<div class="menu-content bg-dark" v-if="menuState">
      <!-- <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div> -->

      <welcome v-if="menuState == MENU_STATES.WELCOME" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player v-if="menuState == MENU_STATES.PLAYER" @onCloseRequested="onCloseRequested" :playerId="menuArguments" :key="menuArguments"
        @onViewConversationRequested="onViewConversationRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" @onCloseRequested="onCloseRequested"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :starId="menuArguments" :key="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onViewHireStarSpecialistRequested="onViewHireStarSpecialistRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"
        @onShipTransferRequested="onShipTransferRequested"/>
      <carrier-detail v-if="menuState == MENU_STATES.CARRIER_DETAIL" 
        @onCloseRequested="onCloseRequested" :carrierId="menuArguments" :key="menuArguments"
        @onShipTransferRequested="onShipTransferRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onEditWaypointRequested="onEditWaypointRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"
        @onCarrierRenameRequested="onCarrierRenameRequested" 
        @onViewCarrierCombatCalculatorRequested="onViewCarrierCombatCalculatorRequested"/>
      <carrier-waypoints v-if="menuState == MENU_STATES.CARRIER_WAYPOINTS"
        @onCloseRequested="onCloseRequested" :carrierId="menuArguments"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onEditWaypointRequested="onEditWaypointRequested"/>
      <carrier-waypoint v-if="menuState == MENU_STATES.CARRIER_WAYPOINT_DETAIL"
        @onCloseRequested="onCloseRequested"
        :carrierId="menuArguments.carrierId"
        :waypoint="menuArguments.waypoint"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <carrier-rename v-if="menuState == MENU_STATES.CARRIER_RENAME"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        :carrierId="menuArguments" />
      <combat-calculator v-if="menuState == MENU_STATES.COMBAT_CALCULATOR" 
        :carrierId="menuArguments"
        @onCloseRequested="onCloseRequested"/>
      <ship-transfer v-if="menuState == MENU_STATES.SHIP_TRANSFER" @onCloseRequested="onCloseRequested" :carrierId="menuArguments" @onShipsTransferred="onShipsTransferred" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <build-carrier v-if="menuState == MENU_STATES.BUILD_CARRIER"
        :starId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"/>
      <inbox v-if="menuState == MENU_STATES.INBOX"
        @onCloseRequested="onCloseRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onCreateNewConversationRequested="onCreateNewConversationRequested"/>
      <intel v-if="menuState == MENU_STATES.INTEL" @onCloseRequested="onCloseRequested" :compareWithPlayerId="menuArguments"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <bulk-infrastructure-upgrade v-if="menuState == MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" @onCloseRequested="onCloseRequested"/>
      <map-object-selector v-if="menuState == MENU_STATES.MAP_OBJECT_SELECTOR" 
        @onCloseRequested="onCloseRequested" 
        :mapObjects="menuArguments" 
        @onOpenStarDetailRequested="onOpenStarDetailRequested" 
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested" 
        @onEditWaypointsRequested="onEditWaypointsRequested" 
        @onShipTransferRequested="onShipTransferRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"/>
      <ruler v-if="menuState == MENU_STATES.RULER" @onCloseRequested="onCloseRequested"/>
      <ledger v-if="menuState == MENU_STATES.LEDGER" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <hire-specialist-carrier v-if="menuState == MENU_STATES.HIRE_SPECIALIST_CARRIER"
        :carrierId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <hire-specialist-star v-if="menuState == MENU_STATES.HIRE_SPECIALIST_STAR"
        :starId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <game-notes v-if="menuState == MENU_STATES.GAME_NOTES"
        @onCloseRequested="onCloseRequested"/>
      <options v-if="menuState == MENU_STATES.OPTIONS"
        @onCloseRequested="onCloseRequested"/>
      <create-conversation v-if="menuState == MENU_STATES.CREATE_CONVERSATION"
        :participantIds="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenInboxRequested="onOpenInboxRequested"
        @onViewConversationRequested="onViewConversationRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION"
        :conversationId="menuArguments"
        :key="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenInboxRequested="onOpenInboxRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
    </div>
</template>