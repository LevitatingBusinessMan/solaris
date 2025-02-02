const ValidationError = require('../../errors/validation');

module.exports = (router, io, container) => {

    const middleware = require('../middleware')(container);

    router.get('/api/game/:gameId/specialists/carrier', middleware.authenticate, middleware.loadGameLean, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let specialists = await container.specialistService.listCarrier(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.get('/api/game/:gameId/specialists/star', middleware.authenticate, middleware.loadGameLean, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let specialists = await container.specialistService.listStar(req.game);

            return res.status(200).json(specialists);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/carrier/:carrierId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = await container.specialistHireService.hireCarrierSpecialist(
                req.game,
                req.player,
                req.params.carrierId,
                +req.params.specialistId);

            await container.eventService.createPlayerCarrierSpecialistHired(
                req.game,
                req.player,
                result.carrier,
                result.specialist
            );

            return res.status(200).json({
                waypoints: result.waypoints
            });
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    router.put('/api/game/:gameId/star/:starId/hire/:specialistId', middleware.authenticate, middleware.loadGame, middleware.validateGameLocked, middleware.validateGameNotFinished, middleware.loadPlayer, middleware.validateUndefeatedPlayer, async (req, res, next) => {
        let errors = [];

        if (errors.length) {
            throw new ValidationError(errors);
        }

        try {
            let result = await container.specialistHireService.hireStarSpecialist(
                req.game,
                req.player,
                req.params.starId,
                +req.params.specialistId);

            await container.eventService.createPlayerStarSpecialistHired(
                req.game,
                req.player,
                result.star,
                result.specialist
            );

            return res.sendStatus(200);
        } catch (err) {
            return next(err);
        }
    }, middleware.handleError);

    return router;

};
