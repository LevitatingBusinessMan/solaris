const mongoose = require('mongoose');
const moment = require('moment');
const EventEmitter = require('events');

module.exports = class PlayerService extends EventEmitter {
    
    constructor(gameModel, randomService, mapService, starService, carrierService, starDistanceService, technologyService, specialistService) {
        super();
        
        this.gameModel = gameModel;
        this.randomService = randomService;
        this.mapService = mapService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.starDistanceService = starDistanceService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    getByObjectId(game, playerId) {
        return game.galaxy.players.find(p => p._id.equals(playerId));
    }

    getById(game, playerId) {
        return game.galaxy.players.find(p => p._id.toString() === playerId.toString());
    }

    getByUserId(game, userId) {
        return game.galaxy.players.find(p => p.userId && p.userId.toString() === userId.toString());
    }
    
    getPlayersWithinScanningRangeOfStar(game, starId, players) {
        if (players == null) {
            players = game.galaxy.players;
        }

        let star = this.starService.getById(game, starId);

        let playersWithinRange = players.filter(p => {
            return this.starService.isStarInScanningRangeOfPlayer(game, star, p);
        });

        return playersWithinRange;
    }

    getPlayersWithinScanningRangeOfPlayer(game, player) {
        let inRange = [player];

        for (let p of game.galaxy.players) {
            if (inRange.indexOf(p) > -1) {
                continue;
            }

            let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, p._id);

            let isInRange = false;

            for (let s of playerStars) {
                if (this.starService.isStarInScanningRangeOfPlayer(game, s, player)) {
                    isInRange = true;
                    break;
                }
            }
            
            if (isInRange) {
                inRange.push(p);
            }
        }

        return inRange;
    }

    isInScanningRangeOfPlayer(game, sourcePlayer, targetPlayer) {
        return this.getPlayersWithinScanningRangeOfPlayer(game, sourcePlayer)
            .find(p => p._id.equals(targetPlayer._id)) != null;
    }

    createEmptyPlayer(game, colour, shape) {
        return {
            _id: mongoose.Types.ObjectId(),
            userId: null,
            alias: 'Empty Slot',
            colour: colour,
            shape: shape,
            credits: game.settings.player.startingCredits,
            renownToGive: game.settings.general.playerLimit,
            carriers: [],
            research: {
                terraforming: { level: game.settings.technology.startingTechnologyLevel.terraforming },
                experimentation: { level: game.settings.technology.startingTechnologyLevel.experimentation },
                scanning: { level: game.settings.technology.startingTechnologyLevel.scanning },
                hyperspace: { level: game.settings.technology.startingTechnologyLevel.hyperspace },
                manufacturing: { level: game.settings.technology.startingTechnologyLevel.manufacturing },
                banking: { level: game.settings.technology.startingTechnologyLevel.banking },
                weapons: { level: game.settings.technology.startingTechnologyLevel.weapons }
            }
        };
    }

    createEmptyPlayers(game) {
        let players = [];

        let shapes = ['circle', 'square', 'diamond', 'hexagon'];
        let shapeIndex = 0;
        let colours = require('../config/game/colours').slice();

        for(let i = 0; i < game.settings.general.playerLimit; i++) {
            // Get a random colour to assign to the player.
            if (!colours.length) {
                colours = require('../config/game/colours').slice();
                shapeIndex++;
            }

            let colour = colours.splice(this.randomService.getRandomNumber(colours.length - 1), 1)[0];
            let shape = shapes[shapeIndex];

            let player = this.createEmptyPlayer(game, colour, shape);

            this._setDefaultResearchTechnology(game, player);
            players.push(player);
        }

        if (game.galaxy.homeStars && game.galaxy.homeStars.length) {
            this._distributePlayerLinkedHomeStars(game, players);
        } else {
            this._distributePlayerHomeStars(game, players);
        }

        if (game.galaxy.linkedStars && game.galaxy.linkedStars.length) {
            this._distributePlayerLinkedStartingStars(game, players);
        }
        else {
            this._distributePlayerStartingStars(game, players);
        }

        return players;
    }

    _distributePlayerLinkedHomeStars(game, players) {
        for(let player of players) {
            let homeStarId = game.galaxy.homeStars.pop();

            // Set up the home star
            let homeStar = this.starService.getByObjectId(game, homeStarId);

            this.starService.setupHomeStar(game, homeStar, player, game.settings);
        }
    }

    _distributePlayerHomeStars(game, players) {
        // Divide the galaxy into equal chunks, each player will spawned
        // at near equal distance from the center of the galaxy.
        const starLocations = game.galaxy.stars.map(s => s.location);

        // Calculate the center point of the galaxy as we need to add it onto the starting location.
        let galaxyCenter = this.mapService.getGalaxyCenterOfMass(starLocations);

        const distanceFromCenter = this._getPlayerDistanceFromCenter(game, starLocations);

        let radians = this._getPlayerStartingLocationRadians(game.settings.general.playerLimit);

        // Create each player starting at angle 0 at a distance of half the galaxy radius

        for(let player of players) {
            let homeStar = this._getNewPlayerHomeStar(game, starLocations, galaxyCenter, distanceFromCenter, radians);

            // Set up the home star
            this.starService.setupHomeStar(game, homeStar, player, game.settings);
        }
    }

    _getPlayerDistanceFromCenter(game, starLocations) {
        let distanceFromCenter;

        // doughnut galaxies the distance from the center needs to be slightly more than others
        if (game.settings.galaxy.galaxyType === 'doughnut') {
            distanceFromCenter = this.mapService.getGalaxyDiameter(starLocations).x / 2 / 1.5;
        }
        else {
            // The desired distance from the center is half way from the galaxy center and the edge
            // for all galaxies other than doughnut.
            distanceFromCenter = this.mapService.getGalaxyDiameter(starLocations).x / 2 / 2;
        }

        return distanceFromCenter;
    }

    _distributePlayerLinkedStartingStars(game, players) {
        for (let player of players) {
            let linkedStars = game.galaxy.linkedStars.pop();

            for (let starId of linkedStars) {
                let star = this.starService.getByObjectId(game, starId);

                this.setupStarForGameStart(game, star, player); 
            }
        }
    }

    _distributePlayerStartingStars(game, players) {
        // The fairest way to distribute stars to players is to
        // iterate over each player and give them 1 star at a time, this is arguably the fairest way
        // otherwise we'll end up with the last player potentially having a really bad position as their
        // stars could be miles away from their home star.
        let starsToDistribute = game.settings.player.startingStars - 1;

        while (starsToDistribute--) {
            for (let player of players) {
                let homeStar = this.starService.getByObjectId(game, player.homeStarId);

                // Get X closest stars to the home star and also give those to the player.
                let s = this.starDistanceService.getClosestUnownedStar(homeStar, game.galaxy.stars);

                // Set up the closest star.
                this.setupStarForGameStart(game, s, player);
            }
        }
    }

    setupStarForGameStart(game, star, player) {
        if (player.homeStarId.equals(star._id)) {
            this.starService.setupHomeStar(game, star, player, game.settings);
        } else {
            star.ownedByPlayerId = player._id;
            star.garrisonActual = game.settings.player.startingShips;
            star.garrison = star.garrisonActual;
            star.warpGate = false;
            star.ignoreBulkUpgrade = false;
            star.specialistId = null;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;
        }
    }

    resetPlayerForGameStart(game, player) {
        player.userId = null;
        player.alias = "Empty Slot";
        player.avatar = null;
        player.credits = game.settings.player.startingCredits;
        player.ready = false;

        // Reset the player's research
        this._setDefaultResearchTechnology(game, player);

        // Reset the player's stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            this.setupStarForGameStart(game, star, player);
        }

        // Reset the player's carriers
        this.carrierService.clearPlayerCarriers(game, player);

        let homeCarrier = this.createHomeStarCarrier(game, player);
        
        game.galaxy.carriers.push(homeCarrier);
    }

    _getNewPlayerHomeStar(game, starLocations, galaxyCenter, distanceFromCenter, radians) {
        switch (game.settings.specialGalaxy.playerDistribution) {
            case 'circular':
                return this._getNewPlayerHomeStarCircular(game, starLocations, galaxyCenter, distanceFromCenter, radians);
            case 'random':
                return this._getNewPlayerHomeStarRandom(game);
        }

        throw new Error(`Unsupported player distribution setting: ${game.settings.specialGalaxy.playerDistribution}`);
    }

    _getNewPlayerHomeStarCircular(game, starLocations, galaxyCenter, distanceFromCenter, radians) {
        // Get the player's starting location.
        let startingLocation = this._getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter);

        // Find the star that is closest to this location, that will be the player's home star.
        let homeStar = this.starDistanceService.getClosestUnownedStarFromLocation(startingLocation, game.galaxy.stars);

        return homeStar;
    }

    _getNewPlayerHomeStarRandom(game) {
        // Pick a random unowned star.
        let unownedStars = game.galaxy.stars.filter(s => s.ownedByPlayerId == null);

        let rnd = this.randomService.getRandomNumber(unownedStars.length);

        return unownedStars[rnd];
    }

    _getPlayerStartingLocationRadians(playerCount) {
        const increment = 360 / playerCount * Math.PI / 180;
        let current = 0;

        let radians = [];

        for (let i = 0; i < playerCount; i++) {
            radians.push(current);
            current += increment;
        }

        return radians;
    }

    _getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter) {
        // Pick a random radian for the player's starting position.
        let radianIndex = this.randomService.getRandomNumber(radians.length);
        let currentRadians = radians.splice(radianIndex, 1)[0];

        // Get the desired player starting location.
        let startingLocation = {
            x: distanceFromCenter * Math.cos(currentRadians),
            y: distanceFromCenter * Math.sin(currentRadians)
        };

        // Add the galaxy center x and y so that the desired location is relative to the center.
        startingLocation.x += galaxyCenter.x;
        startingLocation.y += galaxyCenter.y;

        return startingLocation;
    }

    _setDefaultResearchTechnology(game, player) {
        let enabledTechs = this.technologyService.getEnabledTechnologies(game);

        // TODO: Should we select a random enabled technology instead of the first enabled one?

        player.researchingNow = enabledTechs[0] || 'weapons';
        player.researchingNext = player.researchingNow;
    }

    createHomeStarCarriers(game) {
        let carriers = [];

        for (let i = 0; i < game.galaxy.players.length; i++) {
            let player = game.galaxy.players[i];

            let homeCarrier = this.createHomeStarCarrier(game, player);

            carriers.push(homeCarrier);
        }

        return carriers;
    }

    createHomeStarCarrier(game, player) {
        let homeStar = this.starService.getPlayerHomeStar(game.galaxy.stars, player);

        if (!homeStar) {
            throw new Error('The player must have a home star in order to set up a carrier');
        }

        // Create a carrier for the home star.
        let homeCarrier = this.carrierService.createAtStar(homeStar, game.galaxy.carriers);

        return homeCarrier;
    }

    calculateTotalStars(player, stars) {
        let playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        return playerStars.length;
    }

    calculateTotalShips(ownedStars, ownedCarriers) {
        return ownedStars.reduce((sum, s) => sum + Math.floor(s.garrisonActual), 0) 
            + ownedCarriers.reduce((sum, c) => sum + c.ships, 0);
    }

    calculateTotalEconomy(playerStars) {
        let totalEconomy = playerStars.reduce((sum, s) => {
            let multiplier = this.specialistService.getEconomyInfrastructureMultiplier(s);

            return sum + (s.infrastructure.economy * multiplier)
        }, 0);

        return totalEconomy;
    }

    calculateTotalIndustry(playerStars) {
        let totalIndustry = playerStars.reduce((sum, s) => sum + s.infrastructure.industry, 0);

        return totalIndustry;
    }

    calculateTotalScience(playerStars) {
        let totalScience = playerStars.reduce((sum, s) => {
            let multiplier = this.specialistService.getScienceInfrastructureMultiplier(s);

            return sum + (s.infrastructure.science * multiplier)
        }, 0);

        return totalScience;
    }

    calculateTotalManufacturing(game, playerStars) {
        // Calculate the manufacturing level for all of the stars the player owns.
        playerStars.forEach(s => {
            let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, s);

            s.manufacturing = this.starService.calculateStarShipsByTicks(effectiveTechs.manufacturing, s.infrastructure.industry, 1, game.settings.galaxy.productionTicks)
        });

        let totalManufacturing = playerStars.reduce((sum, s) => sum + s.manufacturing, 0);

        return Math.round((totalManufacturing + Number.EPSILON) * 100) / 100
    }

    calculateWarpgates(playerStars) {
        return playerStars.reduce((sum, s) => s.warpGate ? sum + 1 : sum, 0);
    }

    calculateTotalCarriers(player, carriers) {
        let playerCarriers = this.carrierService.listCarriersOwnedByPlayer(carriers, player._id);

        return playerCarriers.length;
    }

    calculateTotalStarSpecialists(playerStars) {
        return playerStars.filter(s => s.specialistId).length;
    }

    calculateTotalCarrierSpecialists(playerCarriers) {
        return playerCarriers.filter(c => c.specialistId).length;
    }

    getStats(game, player) {
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        let playerCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        let totalStarSpecialists = this.calculateTotalStarSpecialists(playerStars);
        let totalCarrierSpecialists = this.calculateTotalCarrierSpecialists(playerCarriers);

        return {
            totalStars: playerStars.length,
            totalCarriers: playerCarriers.length,
            totalShips: this.calculateTotalShips(playerStars, playerCarriers),
            totalEconomy: this.calculateTotalEconomy(playerStars),
            totalIndustry: this.calculateTotalIndustry(playerStars),
            totalScience: this.calculateTotalScience(playerStars),
            newShips: this.calculateTotalManufacturing(game, playerStars),
            warpgates: this.calculateWarpgates(playerStars),
            totalStarSpecialists,
            totalCarrierSpecialists,
            totalSpecialists: totalStarSpecialists + totalCarrierSpecialists
        };
    }

    updateLastSeen(game, player, date) {
        player.lastSeen = date || moment().utc();
    }

    async updateLastSeenLean(gameId, userId, ipAddress) {
        await this.gameModel.updateOne({
            _id: gameId,
            'galaxy.players.userId': userId
        }, {
            $set: {
                'galaxy.players.$.lastSeen': moment().utc(),
                'galaxy.players.$.lastSeenIP': ipAddress
            }
        });
    }

    givePlayerMoney(game, player) {
        let isBankingEnabled = this.technologyService.isTechnologyEnabled(game, 'banking');

        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        let effectiveTechs = this.technologyService.getPlayerEffectiveTechnologyLevels(game, player);
        let totalEco = this.calculateTotalEconomy(playerStars);

        let bankingMultiplier = isBankingEnabled ? effectiveTechs.banking : 0;

        let creditsFromEconomy = totalEco * 10;
        let creditsFromBanking = playerStars.length ? bankingMultiplier * 75 : 0; // Players must have stars in order to get credits from banking.
        let creditsTotal = creditsFromEconomy + creditsFromBanking;

        player.credits += creditsTotal;

        return {
            creditsFromEconomy,
            creditsFromBanking,
            creditsTotal
        };
    }

    async declareReady(game, player) {
        player.ready = true;

        await game.save();

        this.emit('onGamePlayerReady', {
            game
        });
    }

    async undeclareReady(game, player) {
        player.ready = false;

        await game.save();

        this.emit('onGamePlayerNotReady', {
            game
        });
    }

    async getGameNotes(game, player) {
        return player.notes;
    }

    async updateGameNotes(game, player, notes) {
        player.notes = notes;

        await this.gameModel.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.notes': notes
            }
        });
    }

    performDefeatedOrAfkCheck(game, player, isTurnBasedGame) {
        if (isTurnBasedGame) {
            // Reset whether we have sent the player a turn reminder.
            player.hasSentTurnReminder = false;

            // If the player wasn't ready when the game ticked, increase their number of missed turns.
            if (!player.ready) {
                player.missedTurns++;
                player.ready = true; // Bit of a bodge, this ensures that we don't keep incrementing this value every iteration.
            }
            else {
                player.missedTurns = 0; // Reset the missed turns if the player was ready, we'll kick the player if they have missed consecutive turns only.
            }
        }

        // Check if the player has been AFK.
        let isAfk = this.isAfk(game, player, isTurnBasedGame);

        if (isAfk) {
            this.setPlayerAsAfk(game, player);
        }

        // Check if the player has been defeated by conquest.
        if (!player.defeated) {
            let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

            // If there are no stars and there are no carriers then the player is defeated.
            if (stars.length === 0) {
                let carriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id); // Note: This logic looks a bit weird, but its more performant.
    
                if (carriers.length === 0) {
                    this.setPlayerAsDefeated(game, player);
                }
            }
        }
    }

    isAfk(game, player, isTurnBasedGame, afkThresholdDate) {
        // The player is afk if:
        // 1. The afk threshold date is less than the last seen date
        // 2. The number of missed turns is greater or equal to the missed turn liimt
        // 3. The game is RT and the first cycle has completed and the player has not been seen since the start of the game
        // 4. The game is TB and the first turn has been missed.

        if (isTurnBasedGame) {
            // Calculate what turn this is.
            let isFirstTurn = game.state.tick <= game.settings.gameTime.turnJumps;

            if (isFirstTurn) {
                return player.missedTurns > 0;
            } else {
                return player.missedTurns >= game.settings.gameTime.missedTurnLimit;
            }
        } else {
            // If we have reached the first production tick then check here to see if
            // the player has been active during the cycle.
            let isFirstCycle = game.state.tick === game.settings.galaxy.productionTicks;

            if (isFirstCycle) {
                return moment(player.lastSeen).utc() <= moment(game.state.startDate).utc();
            } else {
                return moment(player.lastSeen).utc() < moment().utc().subtract(3, 'days');
            }
        }
    }

    setPlayerAsDefeated(game, player) {
        player.defeated = true;
        player.researchingNext = 'random'; // Set up the AI for random research.

        // Make sure all stars are marked as not ignored - This is so the AI can bulk upgrade them.
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            star.ignoreBulkUpgrade = false;
        }

        // Clear out any carriers that have looped waypoints.
        this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);
    }

    setPlayerAsAfk(game, player) {
        this.setPlayerAsDefeated(game, player);

        player.afk = true;
    }

}
