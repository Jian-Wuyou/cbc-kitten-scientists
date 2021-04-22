// ==UserScript==
// @name        Kitten Scientists
// @namespace   http://www.reddit.com/r/kittensgame/comments/34gb2u/kitten_scientists_automation_script/
// @description Launch Kitten Scientists
// @include     *bloodrizer.ru/games/kittens/*
// @include     file:///*kitten-game*
// @include     *kittensgame.com/web/*
// @include     *kittensgame.com/beta/*
// @include     *kittensgame.com/alpha/*
// @version     1.5.0
// @grant       none
// @copyright   2015, cameroncondry
// ==/UserScript==

// ==========================================
// Begin Kitten Scientist's Automation Engine
// ==========================================

var kg_version = 'Kitten Scientists version 1.5.0';
var address = '1HDV6VEnXH9m8PJuT4eQD7v8jRnucbneaq';

// Game will be referenced in loadTest function
var game = null;
var i18ng = null;
var lang = 'en';

var run = function() {

    var i18nData = {/*snipped*/};
    
    var i18n = function(key, args) {/*snipped*/}

    var options = {/*snipped*/};

    // GameLog Modification
    // ====================

    var printoutput = function (args) {/*snipped*/};

    // Used for option change messages and other special notifications
    var message = function () {
        var args = Array.prototype.slice.call(arguments);
        args.push('ks-default');
        args.push(options.msgcolor);
        printoutput(args);
    };

    var activity = function () {
        var args = Array.prototype.slice.call(arguments);
        var activityClass = args.length > 1 ? ' type_' + args.pop() : '';
        args.push('ks-activity' + activityClass);
        args.push(options.activitycolor);
        printoutput(args);
    };

    var summary = function () {
        var args = Array.prototype.slice.call(arguments);
        args.push('ks-summary');
        args.push(options.summarycolor);
        printoutput(args);
    };

    var warning = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('Warning!');

        if (console) console.log(args);
    };

    // i18n support
    var imessage = function(key, args, t) { message(i18n(key, args), t); }
    var iactivity = function(key, args, t) { activity(i18n(key, args), t); }
    var isummary = function(key, args, t) { summary(i18n(key, args), t); }
    var iwarning = function(key, args, t) { warning(i18n(key, args), t); }

    // Core Engine for Kitten Scientists
    // =================================

    var Engine = function () {
        this.upgradeManager = new UpgradeManager();
        this.buildManager = new BuildManager();
        this.spaceManager = new SpaceManager();
        this.craftManager = new CraftManager();
        this.bulkManager = new BulkManager();
        this.tradeManager = new TradeManager();
        this.religionManager = new ReligionManager();
        this.timeManager = new TimeManager();
        this.explorationManager = new ExplorationManager();
        this.villageManager = new TabManager('Village');
        this.cacheManager = new CacheManager();
    };

    Engine.prototype = {
        upgradeManager: undefined,
        buildManager: undefined,
        spaceManager: undefined,
        craftManager: undefined,
        bulkManager: undefined,
        tradeManager: undefined,
        religionManager: undefined,
        timeManager: undefined,
        explorationManager: undefined,
        villageManager: undefined,
        cacheManager: undefined,
        loop: undefined,
        start: function (msg=true) {
            if (this.loop) return;

            this.loop = setInterval(this.iterate.bind(this), options.interval);
            if(msg) imessage('status.ks.enable');
        },
        stop: function (msg=true) {
            if (!this.loop) return;

            clearInterval(this.loop);
            this.loop = undefined;
            if (msg) imessage('status.ks.disable');
        },
        iterate: async function () {
            var subOptions = options.auto.options;
            if (subOptions.enabled && subOptions.items.observe.enabled)                     {this.observeStars()};
            if (options.auto.upgrade.enabled)                                               {this.upgrade()};
            if (subOptions.enabled && subOptions.items.festival.enabled)                    {this.holdFestival()};
            if (options.auto.build.enabled)                                                 {this.build()};
            if (options.auto.space.enabled)                                                 {this.space()};
            if (options.auto.craft.enabled)                                                 {this.craft()};
            if (subOptions.enabled && subOptions.items.hunt.enabled)                        {this.hunt()};
            if (options.auto.trade.enabled)                                                 {this.trade()};
            if (options.auto.faith.enabled)                                                 {this.worship()};
            if (options.auto.time.enabled)                                                  {this.chrono()};
            if (subOptions.enabled && subOptions.items.crypto.enabled)                      {this.crypto()};
            if (subOptions.enabled && subOptions.items.explore.enabled)                     {this.explore()};
            if (subOptions.enabled && subOptions.items.autofeed.enabled)                    {this.autofeed()};
            if (subOptions.enabled && subOptions.items.promote.enabled)                     {this.promote()};
            if (options.auto.distribute.enabled)                                            {this.distribute()};
            if (options.auto.timeCtrl.enabled)                                              {this.timeCtrl()};
            if (subOptions.enabled)                                                         {this.miscOptions()};
            if (options.auto.timeCtrl.enabled && options.auto.timeCtrl.items.reset.enabled) {await this.reset()};
        },
        reset: async function () {

            // check challenge
            if (game.challenges.currentChallenge)
                return;

            var checkedList = [];
            var checkList = [];
            var check = function (buttons) {
                if (checkList.length != 0) {
                    for (var i in buttons) {
                        if (!buttons[i].model.metadata)
                            continue;
                        var name = buttons[i].model.metadata.name;
                        var index = checkList.indexOf(name)
                        if (index != -1) {
                            checkList.splice(index, 1)
                            if (game.resPool.hasRes(buttons[i].model.prices))
                                return true;
                        }
                    }
                }
                return false;
            }
            
            // check building
            var opt = options.auto.build.items;
            for (var name in opt)
                if (opt[name].checkForReset) {
                    var bld = game.bld.get(name);
                    checkedList.push({name: bld.label, trigger: opt[name].triggerForReset, val: bld.val})
                    if (opt[name].triggerForReset > 0) {
                        if (opt[name].triggerForReset > bld.val)
                            return;
                    } else {
                        checkList.push(name);
                    }
                }
            // unicornPasture
            opt = options.auto.unicorn.items.unicornPasture
            if (opt.checkForReset) {
                var bld = game.bld.get('unicornPasture');
                checkedList.push({name: bld.label, trigger: opt.triggerForReset, val: bld.val})
                if (opt.triggerForReset > 0) {
                    if (opt.triggerForReset > bld.val)
                        return;
                } else {
                    checkList.push('unicornPasture');
                }
            }
            if (check(this.buildManager.manager.tab.buttons) || checkList.length)
                return;
            
            // check space
            opt = options.auto.space.items;
            for (var name in opt)
                if (opt[name].checkForReset) {
                    var bld = game.space.getBuilding(name)
                    checkedList.push({name: bld.label, trigger: opt[name].triggerForReset, val: bld.val})
                    if (opt[name].triggerForReset > 0) {
                        if (opt[name].triggerForReset > bld.val)
                            return;
                    } else {
                        checkList.push(name);
                    }
                }
            if (checkList.length != 0) {
                var panels = this.spaceManager.manager.tab.planetPanels;
                for (var i in panels) {
                    for (var j in panels[i].children) {
                        var model = panels[i].children[j].model;
                        var name = model.metadata.name;
                        var index = checkList.indexOf(name)
                        if (index != -1) {
                            checkList.splice(index, 1)
                            if (game.resPool.hasRes(model.prices))
                                this.return;
                        }
                    }
                }
            }
            if (checkList.length)
                return;
            
            // check religion
            opt = options.auto.faith.items;
            for (var name in opt)
                if (opt[name].checkForReset) {
                    var bld = this.religionManager.getBuild(name, opt[name].variant);
                    checkedList.push({name: bld.label, trigger: opt[name].triggerForReset, val: bld.val})
                    if (opt[name].triggerForReset > 0) {
                        if (opt[name].triggerForReset > bld.val)
                            return;
                    } else {
                        checkList.push(name);
                    }
                }
            opt = options.auto.unicorn.items
            for (var name in opt)
                if (opt[name].checkForReset && opt[name].variant == 'z') {
                    var bld = this.religionManager.getBuild(name, 'z')
                    checkedList.push({name: bld.label, trigger: opt[name].triggerForReset, val: bld.val})
                    if (opt[name].triggerForReset > 0) {
                        if (opt[name].triggerForReset > bld.val)
                            return;
                    } else {
                        checkList.push(name);
                    }
                }
            if (check(this.religionManager.manager.tab.zgUpgradeButtons) || 
                check(this.religionManager.manager.tab.rUpgradeButtons) ||
                check(this.religionManager.manager.tab.children[0].children[0].children) ||
                checkList.length)
                return;
            
            // check time
            opt = options.auto.time.items;
            for (var name in opt)
                if (opt[name].checkForReset) {
                    var bld = this.timeManager.getBuild(name, opt[name].variant);
                    checkedList.push({name: bld.label, trigger: opt[name].triggerForReset, val: bld.val})
                    if (opt[name].triggerForReset > 0) {
                        if (opt[name].triggerForReset > bld.val)
                            return;
                    } else {
                        checkList.push(name);
                    }
                }

            if (check(this.timeManager.manager.tab.children[2].children[0].children) ||
                check(this.timeManager.manager.tab.children[3].children[0].children) ||
                checkList.length)
                return;
                
            // check resources
            opt = options.auto.resources;
            for (var name in opt)
                if (opt[name].checkForReset) {
                    var res = game.resPool.get(name);
                    checkedList.push({name: res.title, trigger: opt[name].stockForReset, val: res.value})
                    if (opt[name].stockForReset > res.value)
                        return;
                }

            // stop!
            this.stop(false);
            
            var sleep = function (time=1500) {
                return new Promise(resolve => {
                    if (!(options.auto.engine.enabled && options.auto.timeCtrl.enabled && options.auto.timeCtrl.items.reset.enabled))
                        throw 'canceled by player'
                    setTimeout(resolve, time)
                })
            }

            try {
                for (var i in checkedList) {
                    await sleep(500);
                    var checked = checkedList[i];
                    imessage('reset.check', [checked.name, game.getDisplayValueExt(checked.trigger), game.getDisplayValueExt(checked.val)]);
                }
                
                await sleep(0).then(() => {
                    imessage('reset.checked');
                    return sleep();
                }).then(() => {
                    iactivity('reset.tip');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.10');
                    return sleep(2000);
                }).then(() => {
                    imessage('reset.countdown.9');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.8');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.7');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.6');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.5');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.4');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.3');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.2');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.1');
                    return sleep();
                }).then(() => {
                    imessage('reset.countdown.0');
                    return sleep();
                }).then(() => {
                    iactivity('reset.last.message');
                    return sleep();
                });
            } catch (error) {
                imessage('reset.cancel.message');
                iactivity('reset.cancel.activity');
                return;
            }

            if (typeof kittenStorage.reset === 'undefined')
                kittenStorage.reset = {};
            
            kittenStorage.reset.karmaLastTime = game.resPool.get('karma').value;
            kittenStorage.reset.paragonLastTime = game.resPool.get('paragon').value;
            kittenStorage.reset.times += 1;
            kittenStorage.reset.reset = true;
            saveToKittenStorage();

            //=============================================================
            for (var i = 0; i < game.challenges.challenges.length; i++){
                game.challenges.challenges[i].pending = false;
            }
            game.resetAutomatic();
            //=============================================================
        },
        timeCtrl: function () {
            var optionVals = options.auto.timeCtrl.items;

            // Tempus Fugit
            if (optionVals.accelerateTime.enabled && !game.time.isAccelerated) {
                var tf = game.resPool.get('temporalFlux')
                if (tf.value >= tf.maxValue * optionVals.accelerateTime.subTrigger) {
                    game.time.isAccelerated = true;
                    iactivity('act.accelerate', [], 'ks-accelerate');
                    storeForSummary('accelerate', 1);
                }
            }

            // Combust time crystal
            TimeSkip:
            if (optionVals.timeSkip.enabled && game.workshop.get('chronoforge').researched) {
                if (game.calendar.day < 0)
                    break TimeSkip;

                var timeCrystal = game.resPool.get('timeCrystal');
                if (timeCrystal.value < optionVals.timeSkip.subTrigger)
                    break TimeSkip;

                var season = game.calendar.season;
                if (!optionVals.timeSkip[game.calendar.seasons[season].name])
                    break TimeSkip;
                
                var currentCycle = game.calendar.cycle;
                if (!optionVals.timeSkip[currentCycle])
                    break TimeSkip;

                var heatMax = game.getEffect('heatMax');
                var heatNow = game.time.heat;
                if (heatNow >= heatMax)
                    break TimeSkip;
                
                var yearsPerCycle = game.calendar.yearsPerCycle;
                var remainingYearsCurrentCycle = yearsPerCycle - game.calendar.cycleYear;
                var cyclesPerEra = game.calendar.cyclesPerEra;
                var factor = game.challenges.getChallenge("1000Years").researched ? 5 : 10;
                var canSkip = Math.min(Math.floor((heatMax - heatNow) / factor), optionVals.timeSkip.maximum);
                var willSkip = 0;
                if (canSkip < remainingYearsCurrentCycle){
                    willSkip = canSkip;
                } else {
                    willSkip += remainingYearsCurrentCycle;
                    canSkip -= remainingYearsCurrentCycle;
                    var skipCycles = 1;
                    while (canSkip > yearsPerCycle && optionVals.timeSkip[(currentCycle + skipCycles) % cyclesPerEra]) {
                        willSkip += yearsPerCycle;
                        canSkip -= yearsPerCycle;
                        skipCycles += 1;
                    }
                    if (optionVals.timeSkip[(currentCycle + skipCycles) % cyclesPerEra] && canSkip > 0)
                        willSkip += canSkip;
                }
                if (willSkip > 0) {
                    var shatter = game.timeTab.cfPanel.children[0].children[0]; // check?
                    iactivity('act.time.skip', [willSkip], 'ks-timeSkip');
                    shatter.controller.doShatterAmt(shatter.model, willSkip);
                    storeForSummary('time.skip', willSkip);
                }
            }
        },
        promote: function () {
            if (game.science.get('civil').researched && game.village.leader != null) {
                var leader = game.village.leader;
                var rank = leader.rank;
                var gold = this.craftManager.getResource('gold');
                var goldStock = this.craftManager.getStock('gold');

                // game.village.sim.goldToPromote will check gold
                // game.village.sim.promote check both gold and exp
                if (game.village.sim.goldToPromote(rank, rank+1, gold-goldStock)[0] && game.village.sim.promote(leader, rank+1) == 1) {
                    iactivity('act.promote', [rank+1], 'ks-promote');
                    gamePage.tabs[1].censusPanel.census.renderGovernment(gamePage.tabs[1].censusPanel.census);
                    gamePage.tabs[1].censusPanel.census.update();
                    storeForSummary('promote', 1);
                }
            }
        },
        distribute: function () {
            var freeKittens = game.village.getFreeKittens();
            if (!freeKittens)
                return;

            var jobName = '';
            var minRatio = Infinity;
            var currentRatio = 0;
            for (var i in game.village.jobs) {
                var name = game.village.jobs[i].name;
                var unlocked = game.village.jobs[i].unlocked;
                var enabled = options.auto.distribute.items[name].enabled;
                var maxGame = game.village.getJobLimit(name);
                var maxKS = options.auto.distribute.items[name].max;
                var val = game.village.jobs[i].value
                var limited = options.auto.distribute.items[name].limited;
                if (unlocked && enabled && val < maxGame && (!limited || val < maxKS)) {
                    currentRatio = val/maxKS;
                    if (currentRatio < minRatio) {
                        minRatio = currentRatio;
                        jobName = name;
                    }
                }
            }
            if (jobName) {
                game.village.assignJob(game.village.getJob(jobName), 1);
                this.villageManager.render();
                iactivity('act.distribute', [i18n('$village.job.' + jobName)], 'ks-distribute');
                storeForSummary('distribute', 1);
            }
        },
        autofeed: function () {
            var levi = game.diplomacy.get("leviathans");
            var nCorn = game.resPool.get("necrocorn");
            if (!(levi.unlocked && nCorn.value > 0)) {return;}
            if (nCorn.value >= 1) {
                if (levi.energy < game.diplomacy.getMarkerCap()) {
                    game.diplomacy.feedElders();
                    iactivity('act.feed');
                    storeForSummary('feed', 1);
                }
            } else {
                if (0.25 * (1 + game.getEffect("corruptionBoostRatio")) < 1) {
                    storeForSummary('feed', nCorn.value);
                    game.diplomacy.feedElders();
                    iactivity('dispose.necrocorn');
                }
            }
        },
        crypto: function () {
            var coinPrice = game.calendar.cryptoPrice;
            var previousRelic = game.resPool.get('relic').value;
            var previousCoin = game.resPool.get('blackcoin').value;
            var exchangedCoin = 0.0;
            var exchangedRelic = 0.0;
            var waitForBestPrice = false;

            // Waits for coin price to drop below a certain treshold before starting the exchange process
            if (waitForBestPrice == true && coinPrice < 860.0) { waitForBestPrice = false; }

            // Exchanges up to a certain threshold, in order to keep a good exchange rate, then waits for a higher treshold before exchanging for relics.
            if (waitForBestPrice == false && coinPrice < 950.0 && previousRelic > options.auto.options.items.crypto.subTrigger) {
                var currentCoin;

                // function name changed in v1.4.8.0
                if (typeof game.diplomacy.buyEcoin === 'function') {
                  game.diplomacy.buyEcoin();
                } else {
                  game.diplomacy.buyBcoin();
                }

                currentCoin = game.resPool.get('blackcoin').value;
                exchangedCoin = Math.round(currentCoin - previousCoin);
                iactivity('blackcoin.buy', [exchangedCoin]);
            }
            else if (coinPrice > 1050.0 && game.resPool.get('blackcoin').value > 0) {
                var currentRelic;

                waitForBestPrice = true;

                // function name changed in v1.4.8.0
                if (typeof game.diplomacy.sellEcoin === 'function') {
                  game.diplomacy.sellEcoin();
                } else {
		  game.diplomacy.sellBcoin();
                }

                currentRelic = game.resPool.get('relic').value;
                exchangedRelic = Math.round(currentRelic - previousRelic);

                iactivity('blackcoin.sell', [exchangedRelic]);
            }
        },
        explore: function () {
            var manager = this.explorationManager;
            var expeditionNode = game.village.map.expeditionNode;

            if ( expeditionNode == null) {
                manager.getCheapestNode();

                manager.explore(manager.cheapestNodeX, manager.cheapestNodeY);

                iactivity('act.explore', [manager.cheapestNodeX, manager.cheapestNodeY]);
            }
        },
        worship: function () {
            var builds = options.auto.faith.items;
            var manager = this.religionManager;
            var buildManager = this.buildManager;
            var craftManager = this.craftManager;
            var option = options.auto.faith.addition;
            
            if (option.bestUnicornBuilding.enabled) {
                var bestUnicornBuilding = this.getBestUnicornBuilding();
                if (bestUnicornBuilding) {
                    if (bestUnicornBuilding == 'unicornPasture')
                        buildManager.build(bestUnicornBuilding, undefined, 1);
                    else
                    {
                        var btn = manager.getBuildButton(bestUnicornBuilding, 'z');                        
                        for (var i in btn.model.prices)
                            if (btn.model.prices[i].name=='tears')
                                var tearNeed = btn.model.prices[i].val;
                        var tearHave = craftManager.getValue('tears') - craftManager.getStock('tears');
                        if (tearNeed > tearHave)
                        {
                            // if no ziggurat, getBestUnicornBuilding will return unicornPasture
                            var maxSacrifice = Math.floor((craftManager.getValue('unicorns') - craftManager.getStock('unicorns')) / 2500);
                            var needSacrifice = Math.ceil((tearNeed-tearHave) / game.bld.getBuildingExt('ziggurat').meta.on);
                            if (needSacrifice < maxSacrifice)
                            game.religionTab.sacrificeBtn.controller._transform(game.religionTab.sacrificeBtn.model, needSacrifice);
                            // iactivity?
                        }
                        religionManager.build(bestUnicornBuilding, 'z', 1);
                    }
                }
            } else {
                builds = Object.assign({}, builds, Object.fromEntries(Object.entries(options.auto.unicorn.items).filter(([k,v]) => v.variant!='zp')));
                if (options.auto.unicorn.items.unicornPasture.enabled)
                    this.build({unicornPasture: {require: false, enabled: true}});
            }
            // religion build
            this._worship(builds);

            var faith = craftManager.getResource('faith');
            var rate = faith.value / faith.maxValue;
            // enough faith, and then TAP
            if (0.98 <= rate) {
                var worship = game.religion.faith;
                var epiphany = game.religion.faithRatio;
                var transcendenceReached = game.religion.getRU("transcendence").on;
                var tt = transcendenceReached ? game.religion.transcendenceTier : 0;

                // Transcend
                if (option.transcend.enabled && transcendenceReached) 
                {
                    var adoreIncreaceRatio = Math.pow((tt + 2) / (tt + 1), 2);
                    var needNextLevel = game.religion._getTranscendTotalPrice(tt + 1) - game.religion._getTranscendTotalPrice(tt);

                    var x = needNextLevel;
                    var k = adoreIncreaceRatio;
                    var epiphanyRecommend = (1-k+Math.sqrt(80*(k*k-1)*x+(k-1)*(k-1)))*k/(40*(k+1)*(k+1)*(k-1))+x+x/(k*k-1);

                    if(epiphany >= epiphanyRecommend) {

                        // code copy from kittens game's religion.js: game.religion.transcend()
                        // game.religion.transcend() need confirm by player
                        // game version: 1.4.8.1
                        // ========================================================================================================
                        // DO TRANSCEND START
                        // ========================================================================================================
                        game.religion.faithRatio -= needNextLevel;
                        game.religion.tcratio += needNextLevel;
                        game.religion.transcendenceTier += 1;
                        var atheism = game.challenges.getChallenge("atheism");
                        atheism.calculateEffects(atheism, game);
                        var blackObelisk = game.religion.getTU("blackObelisk");
                        blackObelisk.calculateEffects(blackObelisk, game);
                        game.msg($I("religion.transcend.msg.success", [game.religion.transcendenceTier]));
                        // ========================================================================================================
                        // DO TRANSCEND END
                        // ========================================================================================================

                        epiphany = game.religion.faithRatio;
                        tt = game.religion.transcendenceTier;
                        iactivity('act.transcend', [game.getDisplayValueExt(needNextLevel), tt], 'ks-transcend');
                        storeForSummary('transcend', 1);
                    }
                }

                // Adore
                if (option.adore.enabled && game.religion.getRU('apocripha').on) {
                    // game version: 1.4.8.1
                    var maxSolarRevolution = 10 + game.getEffect("solarRevolutionLimit")
                    var triggerSolarRevolution = maxSolarRevolution*option.adore.subTrigger;
                    var epiphanyInc = worship / 1000000 * tt * tt * 1.01;
                    var epiphanyAfterAdore = epiphany + epiphanyInc;
                    var worshipAfterAdore = 0.01 + faith.value*(1 + game.getUnlimitedDR(epiphanyAfterAdore, 0.1)*0.1);
                    var solarRevolutionAdterAdore = game.getLimitedDR(game.getUnlimitedDR(worshipAfterAdore, 1000)/100, maxSolarRevolution);
                    if (solarRevolutionAdterAdore >= triggerSolarRevolution) {

                        game.religion._resetFaithInternal(1.01);

                        iactivity('act.adore', [game.getDisplayValueExt(worship), game.getDisplayValueExt(epiphanyInc)], 'ks-adore');
                        storeForSummary('adore', epiphanyInc);
                        epiphany = game.religion.faithRatio;
                        worship = game.religion.faith;
                    }
                }
            }
            // Praise
            if (option.autoPraise.enabled && rate >= option.autoPraise.subTrigger) {
                if (!game.religion.getFaithBonus) {
                    var apocryphaBonus = game.religion.getApocryphaBonus();
                } else {
                    var apocryphaBonus = game.religion.getFaithBonus();
                }
                var worshipInc = faith.value * (1 + apocryphaBonus)
                storeForSummary('praise', worshipInc);
                iactivity('act.praise', [game.getDisplayValueExt(faith.value), game.getDisplayValueExt(worshipInc)], 'ks-praise');
                game.religion.praise();
            }
        },
        _worship: function (builds) {
            var builds = builds || options.auto.faith.items;
            var buildManager = this.religionManager;
            var craftManager = this.craftManager;
            var bulkManager = this.bulkManager;
            var trigger = options.auto.faith.trigger;

            // Render the tab to make sure that the buttons actually exist in the DOM. Otherwise we can't click them.
            buildManager.manager.render();

            var metaData = {};
            for (var name in builds) {
                var build = builds[name]
                metaData[name] = buildManager.getBuild(name, build.variant);
                if (!buildManager.getBuildButton(name, build.variant)) {
                    metaData[name].rHidden = true;
                } else {
                    var model = buildManager.getBuildButton(name, build.variant).model;
                    var panel = (build.variant === 'c') ? game.science.get('cryptotheology').researched : true;
                    metaData[name].rHidden = !(model.visible && model.enabled && panel);
                }
            }

            var buildList = bulkManager.bulk(builds, metaData, trigger);

            var refreshRequired = false;
            for (var entry in buildList) {
                if (buildList[entry].count > 0) {
                    buildManager.build(buildList[entry].id, buildList[entry].variant, buildList[entry].count);
                    refreshRequired = true;
                }
            }

            if (refreshRequired) {game.ui.render();}
        },
        chrono: function () {
            if (!game.timeTab.visible) {return;}
            var builds = options.auto.time.items;
            var buildManager = this.timeManager;
            var craftManager = this.craftManager;
            var bulkManager = this.bulkManager;
            var trigger = options.auto.time.trigger;

            // Render the tab to make sure that the buttons actually exist in the DOM. Otherwise we can't click them.
            buildManager.manager.render();

            var metaData = {};
            for (var name in builds) {
                var build = builds[name]
                metaData[name] = buildManager.getBuild(name, build.variant);
                var model = buildManager.getBuildButton(name, build.variant).model;
                var panel = (build.variant === 'chrono') ? buildManager.manager.tab.cfPanel : buildManager.manager.tab.vsPanel;
                metaData[name].tHidden = (!model.visible || !model.enabled || !panel.visible);
            }

            var buildList = bulkManager.bulk(builds, metaData, trigger);

            var refreshRequired = false;
            for (var entry in buildList) {
                if (buildList[entry].count > 0) {
                    buildManager.build(buildList[entry].id, buildList[entry].variant, buildList[entry].count);
                    refreshRequired = true;
                }
            }

            if (refreshRequired) {game.ui.render();}
        },
        upgrade: function () {
            var upgrades = options.auto.upgrade.items;
            var upgradeManager = this.upgradeManager;
            var craftManager = this.craftManager;
            var bulkManager = this.bulkManager;
            var buildManager = this.buildManager;

            upgradeManager.workManager.render();
            upgradeManager.sciManager.render();
            upgradeManager.spaManager.render();

            if (upgrades.upgrades.enabled && gamePage.tabs[3].visible) {
                var work = game.workshop.upgrades;
                workLoop:
                for (var upg in work) {
                    if (work[upg].researched || !work[upg].unlocked) {continue;}

                    var prices = dojo.clone(work[upg].prices); // game.village.getEffectLeader will override its argument
                    prices = game.village.getEffectLeader("scientist", prices);
                    for (var resource in prices) {
                        if (craftManager.getValueAvailable(prices[resource].name, true) < prices[resource].val) {continue workLoop;}
                    }
                    upgradeManager.build(work[upg], 'workshop');
                }
            }

            if (upgrades.techs.enabled && gamePage.tabs[2].visible) {
                var tech = game.science.techs;
                techLoop:
                for (var upg in tech) {
                    if (tech[upg].researched || !tech[upg].unlocked) {continue;}

                    var prices = dojo.clone(tech[upg].prices);
                    prices = game.village.getEffectLeader("scientist", prices);
                    for (var resource in prices) {
                        if (craftManager.getValueAvailable(prices[resource].name, true) < prices[resource].val) {continue techLoop;}
                    }
                    upgradeManager.build(tech[upg], 'science');
                }
            }

            if (upgrades.missions.enabled && gamePage.tabs[6].visible) {
                var missions = game.space.meta[0].meta;
                missionLoop:
                for (var i = 0; i < missions.length; i++) {
                    if (!(missions[i].unlocked && missions[i].val < 1)) {continue;}

                    var model = this.spaceManager.manager.tab.GCPanel.children[i];
                    var prices = model.model.prices;
                    for (var resource in prices) {
                        if (craftManager.getValueAvailable(prices[resource].name, true) < prices[resource].val) {continue missionLoop;}
                    }
                    model.domNode.click();
                    if (i === 7 || i === 12) {
                        iactivity('upgrade.space.mission', [missions[i].label], 'ks-upgrade');
                    } else {
                        iactivity('upgrade.space', [missions[i].label], 'ks-upgrade');
                    }
                }
            }

            if (upgrades.races.enabled && gamePage.tabs[4].visible) {
                var maxRaces = (game.diplomacy.get('leviathans').unlocked) ? 8 : 7;
                if (game.diplomacyTab.racePanels.length < maxRaces) {
                    var manpower = craftManager.getValueAvailable('manpower', true);
                    if (!game.diplomacy.get('lizards').unlocked) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('sharks').unlocked) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('griffins').unlocked) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('nagas').unlocked && game.resPool.get("culture").value >= 1500) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('zebras').unlocked && game.resPool.get("ship").value >= 1) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('spiders').unlocked && game.resPool.get("ship").value >= 100 && game.resPool.get("science").maxValue > 125000) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                    if (!game.diplomacy.get('dragons').unlocked && game.science.get("nuclearFission").researched) {
                        if (manpower >= 1000) {
                            game.resPool.get('manpower').value -= 1000;
                            iactivity('upgrade.race', [ game.diplomacy.unlockRandomRace().title], 'ks-upgrade');
                            manpower -= 1000;
                            game.ui.render();
                        }
                    }
                }
            }

            if (upgrades.buildings.enabled) {
                var pastures = (game.bld.getBuildingExt('pasture').meta.stage === 0) ? game.bld.getBuildingExt('pasture').meta.val: 0;
                var aqueducts = (game.bld.getBuildingExt('aqueduct').meta.stage === 0) ? game.bld.getBuildingExt('aqueduct').meta.val: 0;

                var pastureMeta = game.bld.getBuildingExt('pasture').meta;
                if (pastureMeta.stage === 0) {
                    if (pastureMeta.stages[1].stageUnlocked) {
                        if (craftManager.getPotentialCatnip(true, 0, aqueducts) > 0) {
                            var prices = pastureMeta.stages[1].prices;
                            var priceRatio = bulkManager.getPriceRatio(pastureMeta, true);
                            if (bulkManager.singleBuildPossible(pastureMeta, prices, 1)) {
                                var button = buildManager.getBuildButton('pasture', 0);
                                button.controller.sellInternal(button.model, 0);
                                pastureMeta.on = 0;
                                pastureMeta.val = 0;
                                pastureMeta.stage = 1;
                                iactivity('upgrade.building.pasture', [], 'ks-upgrade');
                                game.ui.render();
                                buildManager.build('pasture', 1, 1);
                                game.ui.render();
                                return;
                            }
                        }
                    }
                }

                var aqueductMeta = game.bld.getBuildingExt('aqueduct').meta;
                if (aqueductMeta.stage === 0) {
                    if (aqueductMeta.stages[1].stageUnlocked) {
                        if (craftManager.getPotentialCatnip(true, pastures, 0) > 0) {
                            var prices = aqueductMeta.stages[1].prices;
                            var priceRatio = bulkManager.getPriceRatio(aqueductMeta, true);
                            if (bulkManager.singleBuildPossible(aqueductMeta, prices, 1)) {
                                var button = buildManager.getBuildButton('aqueduct', 0);
                                button.controller.sellInternal(button.model, 0);
                                aqueductMeta.on = 0
                                aqueductMeta.val = 0
                                aqueductMeta.stage = 1
                                aqueductMeta.calculateEffects(aqueductMeta, game)
                                iactivity('upgrade.building.aqueduct', [], 'ks-upgrade');
                                game.ui.render();
                                buildManager.build('aqueduct', 1, 1);
                                game.ui.render();
                                return;
                            }
                        }
                    }
                }

                var libraryMeta = game.bld.getBuildingExt('library').meta;
                if (libraryMeta.stage === 0) {
                    if (libraryMeta.stages[1].stageUnlocked) {
                        var enCon = (game.workshop.get('cryocomputing').researched) ? 1 : 2;
                        if (game.challenges.currentChallenge == 'energy') {enCon *= 2;}
                        var libToDat = 3;
                        if (game.workshop.get('uplink').researched) {
                            libToDat *= (1 + game.bld.get('biolab').val * game.getEffect('uplinkDCRatio'));
                        }
                        if (game.workshop.get('machineLearning').researched) {
                            libToDat *= (1 + game.bld.get('aiCore').on * game.getEffect('dataCenterAIRatio'));
                        }
                        if (game.resPool.energyProd >= game.resPool.energyCons + enCon*libraryMeta.val/libToDat) {
                            var prices = libraryMeta.stages[1].prices;
                            var priceRatio = bulkManager.getPriceRatio(libraryMeta, true);
                            if (bulkManager.singleBuildPossible(libraryMeta, prices, 1)) {
                                var button = buildManager.getBuildButton('library', 0);
                                button.controller.sellInternal(button.model, 0);
                                libraryMeta.on = 0
                                libraryMeta.val = 0
                                libraryMeta.stage = 1
                                libraryMeta.calculateEffects(libraryMeta, game)
                                iactivity('upgrade.building.library', [], 'ks-upgrade');
                                game.ui.render();
                                buildManager.build('library', 1, 1);
                                game.ui.render();
                                return;
                            }
                        }
                    }

                }

                var amphitheatreMeta = game.bld.getBuildingExt('amphitheatre').meta;
                if (amphitheatreMeta.stage === 0) {
                    if (amphitheatreMeta.stages[1].stageUnlocked) {
                        var prices = amphitheatreMeta.stages[1].prices;
                        var priceRatio = bulkManager.getPriceRatio(amphitheatreMeta, true);
                        if (bulkManager.singleBuildPossible(amphitheatreMeta, prices, 1)) {
                            var button = buildManager.getBuildButton('amphitheatre', 0);
                            button.controller.sellInternal(button.model, 0);
                            amphitheatreMeta.on = 0
                            amphitheatreMeta.val = 0
                            amphitheatreMeta.stage = 1
                            iactivity('upgrade.building.amphitheatre', [], 'ks-upgrade');
                            game.ui.render();
                            buildManager.build('amphitheatre', 1, 1);
                            game.ui.render();
                            return;
                        }
                    }
                }
            }
        },
        build: function (builds) {
            var builds = builds || options.auto.build.items;
            var buildManager = this.buildManager;
            var craftManager = this.craftManager;
            var bulkManager = this.bulkManager;
            var trigger = options.auto.build.trigger;

            // Render the tab to make sure that the buttons actually exist in the DOM. Otherwise we can't click them.
            buildManager.manager.render();

            var metaData = {};
            for (var name in builds) {
                var build = builds[name]
                metaData[name] = buildManager.getBuild(build.name || name).meta;
            }

            var buildList = bulkManager.bulk(builds, metaData, trigger, 'bonfire');

            var refreshRequired = false;
            for (var entry in buildList) {
                if (buildList[entry].count > 0) {
                    buildManager.build(buildList[entry].name || buildList[entry].id, buildList[entry].stage, buildList[entry].count);
                    refreshRequired = true;
                }
            }
            if (refreshRequired) {game.ui.render();}
        },
        space: function () {
            var builds = options.auto.space.items;
            var buildManager = this.spaceManager;
            var craftManager = this.craftManager;
            var bulkManager = this.bulkManager;
            var trigger = options.auto.space.trigger;

            // Render the tab to make sure that the buttons actually exist in the DOM. Otherwise we can't click them.
            buildManager.manager.render();

            var metaData = {};
            for (var name in builds) {
                var build = builds[name]
                metaData[name] = buildManager.getBuild(name);
            }

            var buildList = bulkManager.bulk(builds, metaData, trigger, 'space');

            var refreshRequired = false;
            for (var entry in buildList) {
                if (buildList[entry].count > 0) {
                    buildManager.build(buildList[entry].id, buildList[entry].count);
                    refreshRequired = true;
                }
            }
            if (refreshRequired) {game.ui.render();}
        },
        craft: function () {
            var crafts = options.auto.craft.items;
            var manager = this.craftManager;
            var trigger = options.auto.craft.trigger;

            for (var name in crafts) {
                var craft = crafts[name];
                var current = !craft.max ? false : manager.getResource(name);
                var require = !craft.require ? false : manager.getResource(craft.require);
                var season = game.calendar.season;
                var amount = 0;
                // Ensure that we have reached our cap
                if (current && current.value > craft.max) continue;
                if (!manager.singleCraftPossible(name)) {continue;}
                // Craft the resource if we meet the trigger requirement
                if (!require || trigger <= require.value / require.maxValue) {
                    amount = manager.getLowestCraftAmount(name, craft.limited, craft.limRat, true);
                } else if (craft.limited) {
                    amount = manager.getLowestCraftAmount(name, craft.limited, craft.limRat, false);
                }
                if (amount > 0) {
                    manager.craft(name, amount);
                }
            }
        },
        holdFestival: function () {
            if (!(game.science.get('drama').researched && game.calendar.festivalDays < 400)) {return;}
            if (!game.prestige.getPerk('carnivals').researched && game.calendar.festivalDays > 0) {return;}

            var craftManager = this.craftManager;
            if (craftManager.getValueAvailable('manpower', true) < 1500 || craftManager.getValueAvailable('culture', true) < 5000
                || craftManager.getValueAvailable('parchment', true) < 2500) {return;}

            var catpowProf = 4000 * craftManager.getTickVal(craftManager.getResource('manpower'), true) > 1500;
            var cultureProf = 4000 * craftManager.getTickVal(craftManager.getResource('culture'), true) > 5000;
            var parchProf = 4000 * craftManager.getTickVal(craftManager.getResource('parchment'), true) > 2500;

            if (!(catpowProf && cultureProf && parchProf)) {return;}

            // Render the tab to make sure that the buttons actually exist in the DOM. Otherwise we can't click them.
            this.villageManager.render();

            if (game.villageTab.festivalBtn.model.enabled) {
                var beforeDays = game.calendar.festivalDays;
                game.villageTab.festivalBtn.onClick();
                storeForSummary('festival');
                if (beforeDays > 0) {
                    iactivity('festival.extend', [], 'ks-festival');
                } else {
                    iactivity('festival.hold', [], 'ks-festival');
                }
            }
        },
        observeStars: function () {
            if (game.calendar.observeBtn != null){
                game.calendar.observeHandler();
                iactivity('act.observe', [], 'ks-star');
                storeForSummary('stars', 1);
            }
        },
        hunt: function () {
            var manpower = this.craftManager.getResource('manpower');

            if (options.auto.options.items.hunt.subTrigger <= manpower.value / manpower.maxValue && manpower.value >= 100) {
                // No way to send only some hunters. Thus, we hunt with everything
                var huntCount = Math.floor(manpower.value/100);
                storeForSummary('hunt', huntCount);
                iactivity('act.hunt', [huntCount], 'ks-hunt');

                var huntCount = Math.floor(manpower.value/100);
                var aveOutput = this.craftManager.getAverageHunt();
                var trueOutput = {};

                for (var out in aveOutput) {
                    var res = this.craftManager.getResource(out);
                    trueOutput[out] = (res.maxValue > 0) ? Math.min(aveOutput[out] * huntCount, Math.max(res.maxValue - res.value, 0)) : aveOutput[out] * huntCount;
                }

                this.cacheManager.pushToCache({'materials': trueOutput, 'timeStamp': game.timer.ticksTotal});

                game.village.huntAll();
            }
        },
        trade: function () {
            var craftManager = this.craftManager;
            var tradeManager = this.tradeManager;
            var cacheManager = this.cacheManager;
            var gold = craftManager.getResource('gold');
            var trades = [];
            var requireTrigger = options.auto.trade.trigger;

            tradeManager.manager.render();

            if (!tradeManager.singleTradePossible(undefined)) {return;}

            var season = game.calendar.getCurSeason().name;

            // Determine how many races we will trade this cycle
            for (var name in options.auto.trade.items) {
                var trade = options.auto.trade.items[name];

                // Check if the race is in season, enabled, unlocked, and can actually afford it
                if (!trade.enabled) continue;
                if (!trade[season]) continue;
                var race = tradeManager.getRace(name);
                if (!race.unlocked) {continue;}
                var button = tradeManager.getTradeButton(race.name);
                if (!button.model.enabled) {continue;}
                if (!tradeManager.singleTradePossible(name)) {continue;}

                var require = !trade.require ? false : craftManager.getResource(trade.require);

                // If we have enough to trigger the check, then attempt to trade
                var prof = tradeManager.getProfitability(name);
                if (trade.limited && prof) {
                    trades.push(name);
                } else if ((!require || requireTrigger <= require.value / require.maxValue) && requireTrigger <= gold.value / gold.maxValue) {
                    trades.push(name);
                }
            }

            if (trades.length === 0) {return;}

            // Figure out how much we can currently trade
            var maxTrades = tradeManager.getLowestTradeAmount(undefined, true, false);

            // Distribute max trades without starving any race

            if (maxTrades < 1) {return;}

            var maxByRace = [];
            for (var i = 0; i < trades.length; i++) {
                var name = trades[i];
                var trade = options.auto.trade.items[name];
                var require = !trade.require ? false : craftManager.getResource(trade.require);
                var trigConditions = ((!require || requireTrigger <= require.value / require.maxValue) && requireTrigger <= gold.value / gold.maxValue);
                var tradePos = tradeManager.getLowestTradeAmount(name, trade.limited, trigConditions);
                if (tradePos < 1) {
                    trades.splice(i, 1);
                    i--;
                    continue;
                }
                maxByRace[i] = tradePos;
            }

            if (trades.length === 0) {return;}

            var tradesDone = {};
            while (trades.length > 0 && maxTrades >= 1) {
                if (maxTrades < trades.length) {
                    var j = Math.floor(Math.random() * trades.length);
                    if (!tradesDone[trades[j]]) {tradesDone[trades[j]] = 0;}
                    tradesDone[trades[j]] += 1;
                    maxTrades -= 1;
                    trades.splice(j, 1);
                    maxByRace.splice(j, 1);
                    continue;
                }
                var minTrades = Math.floor(maxTrades / trades.length);
                var minTradePos = 0;
                for (var i = 0; i < trades.length; i++) {
                    if (maxByRace[i] < minTrades) {
                        minTrades = maxByRace[i];
                        minTradePos = i;
                    }
                }
                if (!tradesDone[trades[minTradePos]]) {tradesDone[trades[minTradePos]] = 0;}
                tradesDone[trades[minTradePos]] += minTrades;
                maxTrades -= minTrades;
                trades.splice(minTradePos, 1);
                maxByRace.splice(minTradePos, 1);
            }
            if (tradesDone.length === 0) {return;}

            var tradeNet = {};
            for (var name in tradesDone) {
                var race = tradeManager.getRace(name);

                var materials = tradeManager.getMaterials(name);
                for (var mat in materials) {
                    if (!tradeNet[mat]) {tradeNet[mat] = 0;}
                    tradeNet[mat] -= materials[mat] * tradesDone[name];
                }

                var meanOutput = tradeManager.getAverageTrade(race);
                for (var out in meanOutput) {
                    var res = craftManager.getResource(out);
                    if (!tradeNet[out]) {tradeNet[out] = 0;}
                    tradeNet[out] += (res.maxValue > 0) ? Math.min(meanOutput[out] * tradesDone[name], Math.max(res.maxValue - res.value, 0)) : meanOutput[out] * tradesDone[name];
                }
            }

            cacheManager.pushToCache({'materials': tradeNet, 'timeStamp': game.timer.ticksTotal});

            for (var name in tradesDone) {
                if (tradesDone[name] > 0) {
                    tradeManager.trade(name, tradesDone[name]);
                }
            }
        },
        miscOptions: function () {
            var craftManager = this.craftManager;
            var buildManager = this.buildManager;
            var optionVals = options.auto.options.items;

            AutoEmbassy:
            if (optionVals.buildEmbassies.enabled && !!game.diplomacy.races[0].embassyPrices) {
                var culture = craftManager.getResource('culture');
                if (optionVals.buildEmbassies.subTrigger <= culture.value / culture.maxValue) {
                    var racePanels = game.diplomacyTab.racePanels;
                    var cultureVal = craftManager.getValueAvailable('culture', true);

                    var embassyBulk = {};
                    var bulkTracker = [];

                    for (var i = 0; i < racePanels.length; i++) {
                        if (!racePanels[i].embassyButton) {continue;}
                        var name = racePanels[i].race.name;
                        var race = game.diplomacy.get(name);
                        embassyBulk[name] = {'val': 0, 'basePrice': race.embassyPrices[0].val, 'currentEm': race.embassyLevel, 'priceSum': 0, 'race': race};
                        bulkTracker.push(name);
                    }

                    if (bulkTracker.length === 0) {break AutoEmbassy;}

                    var refreshRequired = false;

                    while (bulkTracker.length > 0) {
                        for (var i=0; i < bulkTracker.length; i++) {
                            var name = bulkTracker[i];
                            var emBulk = embassyBulk[name];
                            var nextPrice = emBulk.basePrice * Math.pow(1.15, emBulk.currentEm + emBulk.val);
                            if (nextPrice <= cultureVal) {
                                cultureVal -= nextPrice;
                                emBulk.priceSum += nextPrice;
                                emBulk.val += 1;
                                refreshRequired = true;
                            } else {
                                bulkTracker.splice(i, 1);
                                i--;
                            }
                        }
                    }

                    for (var name in embassyBulk) {
                        var emBulk = embassyBulk[name];
                        if (emBulk.val === 0) {continue;}
                        var cultureVal = craftManager.getValueAvailable('culture', true);
                        if (emBulk.priceSum > cultureVal) {warning('Something has gone horribly wrong.' + [emBulk.priceSum, cultureVal]);}
                        game.resPool.resources[13].value -= emBulk.priceSum;
                        emBulk.race.embassyLevel += emBulk.val;
                        storeForSummary('embassy', emBulk.val);
                        if (emBulk.val !== 1) {
                            iactivity('build.embassies', [emBulk.val, emBulk.race.title], 'ks-trade');
                        } else {
                            iactivity('build.embassy', [emBulk.val, emBulk.race.title], 'ks-trade');
                        }
                    }

                    if (refreshRequired) {game.ui.render();}
                }
            }

            // fix Cryochamber
            if (optionVals.fixCry.enabled && game.time.getVSU("usedCryochambers").val > 0) {
                var fixed = 0;
                var btn = this.timeManager.manager.tab.vsPanel.children[0].children[0]; //check?
                // doFixCryochamber will check resources
                while (btn.controller.doFixCryochamber(btn.model)) 
                    fixed += 1;
                if (fixed > 0) {
                    iactivity('act.fix.cry', [fixed], 'ks-fixCry');
                    storeForSummary('fix.cry', fixed);
                }
            }
            
            // auto turn on steamworks
            if (optionVals._steamworks.enabled) {
                var st = game.bld.get('steamworks');
                if (st.val && st.on == 0) {
                    var button = buildManager.getBuildButton('steamworks');
                    button.controller.onAll(button.model);
                }
            }
        },
        // ref: https://github.com/Bioniclegenius/NummonCalc/blob/112f716e2fde9956dfe520021b0400cba7b7113e/NummonCalc.js#L490
        getBestUnicornBuilding: function () {
            var unicornPasture = 'unicornPasture';
            var pastureButton = buildManager.getBuildButton('unicornPasture');
            if(typeof pastureButton === 'undefined')
                return;
            var validBuildings = ['unicornTomb','ivoryTower','ivoryCitadel','skyPalace','unicornUtopia','sunspire'];
            var unicornsPerSecond = game.getEffect('unicornsPerTickBase') * game.getTicksPerSecondUI();
            var globalRatio = game.getEffect('unicornsGlobalRatio') + 1;
            var religionRatio = game.getEffect('unicornsRatioReligion') + 1;
            var paragonRatio = game.prestige.getParagonProductionRatio() + 1;
            var faithBonus = game.religion.getSolarRevolutionRatio() + 1;
            var cycle = 1;
            if(game.calendar.cycles[game.calendar.cycle].festivalEffects['unicorns'] != undefined)
                if(game.prestige.getPerk('numeromancy').researched && game.calendar.festivalDays)
                    cycle = game.calendar.cycles[game.calendar.cycle].festivalEffects['unicorns'];
            var onZig = Math.max(game.bld.getBuildingExt('ziggurat').meta.on, 1);
            var total = unicornsPerSecond * globalRatio * religionRatio * paragonRatio * faithBonus * cycle;
            var baseUnicornsPerRift = 500 * (1 + game.getEffect('unicornsRatioReligion') * 0.1);
            var riftChanceRatio = 1;
            if(game.prestige.getPerk('unicornmancy').researched)
                riftChanceRatio *= 1.1;
            var baseRift = game.getEffect('riftChance') * riftChanceRatio / (10000 * 2) * baseUnicornsPerRift;
            var bestAmoritization = Infinity;
            var bestBuilding = '';
            var pastureAmor = game.bld.getBuildingExt('unicornPasture').meta.effects['unicornsPerTickBase'] * game.getTicksPerSecondUI();
            pastureAmor = pastureAmor * globalRatio * religionRatio * paragonRatio * faithBonus * cycle;
            pastureAmor = pastureButton.model.prices[0].val / pastureAmor;
            if(pastureAmor < bestAmoritization){
                bestAmoritization = pastureAmor;
                bestBuilding = unicornPasture;
            }
            for(var i in this.religionManager.manager.tab.zgUpgradeButtons){
                var btn = this.religionManager.manager.tab.zgUpgradeButtons[i];
                if(validBuildings.indexOf(btn.id)!=-1){
                    if(btn.model.visible){
                        unicornPrice = 0;
                        for(var j in btn.model.prices){
                            if(btn.model.prices[j].name=='unicorns')
                                unicornPrice += btn.model.prices[j].val;
                            if(btn.model.prices[j].name=='tears')
                                unicornPrice += btn.model.prices[j].val * 2500 / onZig;
                        }
                        var bld = game.religion.getZU(btn.id);
                        var relBonus = religionRatio;
                        var riftChance = game.getEffect('riftChance');
                        for(var j in bld.effects){
                            if(j == 'unicornsRatioReligion')
                                relBonus += bld.effects[j]
                            if(j == 'riftChance')
                                riftChance += bld.effects[j];
                        }
                        var unicornsPerRift = 500 * ((relBonus -1) * 0.1 +1);
                        var riftBonus = riftChance * riftChanceRatio / (10000 * 2) * unicornsPerRift;
                        riftBonus -= baseRift;
                        var amor = unicornsPerSecond * globalRatio * relBonus * paragonRatio * faithBonus * cycle;
                        amor -= total;
                        amor = amor + riftBonus;
                        amor = unicornPrice / amor;
                        if(amor < bestAmoritization)
                            if(riftBonus > 0 || relBonus > religionRatio && unicornPrice > 0){
                                bestAmoritization = amor;
                                bestBuilding = btn.id;
                            }
                    }
                }
            }
            return bestBuilding;
        }
    };

    // Tab Manager
    // ===========

    var TabManager = function (name) {
        this.setTab(name);
    };

    TabManager.prototype = {
        tab: undefined,
        render: function () {},
        setTab: function (name) {}
    };

    // Exploration Manager
    // ===================

    var ExplorationManager = function () {
        this.manager = new TabManager('Village');
    };

    ExplorationManager.prototype = {
        manager: undefined,
        currentCheapestNode: null,
        currentCheapestNodeValue: null,
        cheapestNodeX: null,
        cheapestNodeY: null,
        explore: function(x, y) {},
        getCheapestNode: function () {},
        getNodeValue: function (x, y){}
    };

    // Religion manager
    // ================

    var ReligionManager = function () {
        this.manager = new TabManager('Religion');
        this.crafts = new CraftManager();
        this.bulkManager = new BulkManager();
    };

    ReligionManager.prototype = {
        manager: undefined,
        crafts: undefined,
        bulkManager: undefined,
        build: function (name, variant, amount) {},
        getBuild: function (name, variant) {},
        getBuildButton: function (name, variant) {}
    };

    // Time manager
    // ============

    var TimeManager = function () {
        this.manager = new TabManager('Time');
        this.crafts = new CraftManager();
        this.bulkManager = new BulkManager();
    };

    TimeManager.prototype = {
        manager: undefined,
        crafts: undefined,
        bulkManager: undefined,
        build: function (name, variant, amount) {},
        getBuild: function (name, variant) {},
        getBuildButton: function (name, variant) {}
    };

    // Upgrade manager
    // ============

    var UpgradeManager = function () {
        this.workManager = new TabManager('Workshop');
        this.sciManager = new TabManager('Science');
        this.spaManager = new TabManager('Space');
        this.crafts = new CraftManager();
    };

    UpgradeManager.prototype = {
        manager: undefined,
        crafts: undefined,
        build: function (upgrade, variant) {
            var button = this.getBuildButton(upgrade, variant);

            if (!button || !button.model.enabled) return;

            //need to simulate a click so the game updates everything properly
            button.domNode.click(upgrade);
            var label = upgrade.label;

            if (variant === 'workshop') {
                storeForSummary(label, 1, 'upgrade');
                iactivity('upgrade.upgrade', [label], 'ks-upgrade');
            } else {
                storeForSummary(label, 1, 'research');
                iactivity('upgrade.tech', [label], 'ks-research');
            }
        },
        getBuildButton: function (upgrade, variant) {
            if (variant === 'workshop') {
                var buttons = this.workManager.tab.buttons;
            } else if (variant === 'science') {
                var buttons = this.sciManager.tab.buttons;
            }
            for (var i in buttons) {
                var haystack = buttons[i].model.name;
                if (haystack === upgrade.label) {
                    return buttons[i];
                }
            }
        }
    };

    // Building manager
    // ================

    var BuildManager = function () {
        this.manager = new TabManager('Bonfire');
        this.crafts = new CraftManager();
        this.bulkManager = new BulkManager();
    };

    BuildManager.prototype = {
        manager: undefined,
        crafts: undefined,
        bulkManager: undefined,
        build: function (name, stage, amount) {
            var build = this.getBuild(name);
            var button = this.getBuildButton(name, stage);

            if (!button || !button.model.enabled) return;
            var amountTemp = amount;
            var label = build.meta.label ? build.meta.label : build.meta.stages[stage].label;
            amount=this.bulkManager.construct(button.model, button, amount);
            if (amount !== amountTemp) {warning(label + ' Amount ordered: '+amountTemp+' Amount Constructed: '+amount);}
            storeForSummary(label, amount, 'build');

            if (amount === 1) {
                iactivity('act.build', [label], 'ks-build');
            } else {
                iactivity('act.builds', [label, amount], 'ks-build');
            }
        },
        getBuild: function (name) {
            return game.bld.getBuildingExt(name);
        },
        getBuildButton: function (name, stage) {
            var buttons = this.manager.tab.children;
            var build = this.getBuild(name);
            var label = typeof stage !== 'undefined' ? build.meta.stages[stage].label : build.meta.label;

            for (var i in buttons) {
                var haystack = buttons[i].model.name;
                if (haystack.indexOf(label) !== -1){
                    return buttons[i];
                }
            }
        }
    };

    // Space manager
    // ================

    var SpaceManager = function () {
        this.manager = new TabManager('Space');
        this.crafts = new CraftManager();
        this.bulkManager = new BulkManager();
    };

    SpaceManager.prototype = {
        manager: undefined,
        crafts: undefined,
        bulkManager: undefined,
        build: function (name, amount) {
            var build = this.getBuild(name);
            var button = this.getBuildButton(name);

            if (!build.unlocked || !button || !button.model.enabled || !options.auto.space.items[name].enabled) return;
            var amountTemp = amount;
            var label = build.label;
            amount=this.bulkManager.construct(button.model, button, amount);
            if (amount !== amountTemp) {
                warning(label + ' Amount ordered: '+amountTemp+' Amount Constructed: '+amount);
            }
            storeForSummary(label, amount, 'build');

            if (amount === 1) {
                iactivity('act.build', [label], 'ks-build');
            } else {
                iactivity('act.builds', [label, amount], 'ks-build');
            }
        },
        getBuild: function (name) {
            return game.space.getBuilding(name);
        },
        getBuildButton: function (name) {
            var panels = this.manager.tab.planetPanels;

            for (var panel in panels) {
                for (var child in panels[panel].children) {
                    if (panels[panel].children[child].id === name) return panels[panel].children[child];
                }
            }
        }
    };

    // Crafting Manager
    // ================

    var CraftManager = function () {
        this.cacheManager = new CacheManager();
    };

    CraftManager.prototype = {
        craft: function (name, amount) {},
        canCraft: function (name, amount) {},
        getCraft: function (name) {},
        singleCraftPossible: function (name) {},
        getLowestCraftAmount: function (name, limited, limRat, aboveTrigger) {},
        getMaterials: function (name) {},
        getTickVal: function (res, preTrade) {},
        getAverageHunt: function() {},
        getResource: function (name) {},
        getValue: function (name) {},
        getStock: function (name) {},
        getValueAvailable: function (name, all, typeTrigger) {},
        getPotentialCatnip: function (worstWeather, pastures, aqueducts) {}
    };

    // Bulk Manager
    // ============

    var BulkManager = function () {
        this.craftManager = new CraftManager();
    };

    BulkManager.prototype = {
        craftManager: undefined,
        bulk: function (builds, metaData, trigger, source) {},
        construct: function (model, button, amount) {},
        getPriceRatio: function (data, source) {},
        singleBuildPossible: function (data, prices, priceRatio, source) {}
    };

    // Trading Manager
    // ===============

    var TradeManager = function () {
        this.craftManager = new CraftManager();
        this.manager = new TabManager('Trade');
    };

    TradeManager.prototype = {
        craftManager: undefined,
        manager: undefined,
        trade: function (name, amount) {

            if (!name || 1 > amount) {warning('KS trade checks are not functioning properly, please create an issue on the github page.');}

            var race = this.getRace(name);

            var button = this.getTradeButton(race.name);

            if (!button.model.enabled || !options.auto.trade.items[name].enabled) {warning('KS trade checks are not functioning properly, please create an issue on the github page.');}

            game.diplomacy.tradeMultiple(race, amount);
            storeForSummary(race.title, amount, 'trade');
            iactivity('act.trade', [amount, ucfirst(race.title)], 'ks-trade');
        },
        getProfitability: function (name) {
            var race = this.getRace(name);

            var materials = this.getMaterials(name);
            var cost = 0;
            for (var mat in materials) {
                var tick = this.craftManager.getTickVal(this.craftManager.getResource(mat));
                if (tick <= 0) {return false;}
                cost += materials[mat]/tick;
            }

            var output = this.getAverageTrade(race);
            var profit = 0;
            for (var prod in output) {
                var res = this.craftManager.getResource(prod);
                var tick = this.craftManager.getTickVal(res);
                if (tick === 'ignore') {continue;}
                if (tick <= 0) {return true;}
                profit += (res.maxValue > 0) ? Math.min(output[prod], Math.max(res.maxValue - res.value, 0))/tick : output[prod]/tick;
            }
            return (cost <= profit);
        },
        getAverageTrade: function (race) {
            // standingRatio
            // var standRat = game.getEffect("standingRatio");
            var standRat = game.getEffect("standingRatio") + game.diplomacy.calculateStandingFromPolicies(race.name, game);
            // standRat += (game.prestige.getPerk("diplomacy").researched) ? 10 : 0;
            // raceRatio
            var rRatio = 1 + race.energy * 0.02;
            // tradeRatio
            // var tRatio = 1 + game.diplomacy.getTradeRatio();
		    var tRatio = 1 + game.diplomacy.getTradeRatio() + game.diplomacy.calculateTradeBonusFromPolicies(race.name, game);
            // var successRat = (race.attitude === "hostile") ? Math.min(race.standing + standRat/100, 1) : 1;
            // var bonusRat = (race.attitude === "friendly") ? Math.min(race.standing + standRat/200, 1) : 0;
            // ref: var failedTradeAmount = race.standing < 0 ? this.game.math.binominalRandomInteger(totalTradeAmount, -(race.standing + standingRatio)) : 0;
		    // ref: var successfullTradeAmount = totalTradeAmount - failedTradeAmount;
            var failedRat = (race.standing < 0) ? (race.standing + standRat) : 0;
            var successRat = (failedRat < 0) ? (1 + failedRat) : 1;
            var bonusRat = (race.standing > 0) ? Math.min(race.standing + standRat / 2, 1) : 0;
            
            var output = {};
            for (var s in race.sells) {
                var item = race.sells[s];
                if (!this.isValidTrade(item, race)) {continue;}
                var resource = this.craftManager.getResource(item.name);
                var mean = 0;
                var tradeChance = (race.embassyPrices) ? item.chance * (1 + game.getLimitedDR(0.01 * race.embassyLevel, 0.75)) : item.chance;
                if (race.name == "zebras" && item.name == "titanium") {
                    var shipCount = game.resPool.get("ship").value;
                    var titanProb = Math.min(0.15 + shipCount * 0.0035, 1);
                    var titanRat = 1 + shipCount / 50;
                    mean = 1.5 * titanRat * (successRat * titanProb);
                } else {
                    var sRatio = (!item.seasons) ? 1 : 1 + item.seasons[game.calendar.getCurSeason().name];
                    var normBought = (successRat - bonusRat) * Math.min(tradeChance/100, 1);
                    var normBonus = bonusRat * Math.min(tradeChance/100, 1);
                    mean = (normBought + 1.25 * normBonus) * item.value * rRatio * sRatio * tRatio;
                }
                output[item.name] = mean;
            }

            var spiceChance = (race.embassyPrices) ? 0.35 * (1 + 0.01 * race.embassyLevel) : 0.35;
            var spiceTradeAmount = successRat * Math.min(spiceChance, 1);
            output['spice'] = 25 * spiceTradeAmount + 50 * spiceTradeAmount * tRatio / 2;

            output['blueprint'] = 0.1 * successRat;

            return output;
        },
        isValidTrade: function (item, race) {
            return (!(item.minLevel && race.embassyLevel < item.minLevel) && (game.resPool.get(item.name).unlocked || item.name === 'titanium' || item.name === 'uranium' || race.name === 'leviathans'));
        },
        getLowestTradeAmount: function (name, limited, trigConditions) {
            var amount = undefined;
            var highestCapacity = undefined;
            var materials = this.getMaterials(name);
            var race = this.getRace(name);

            for (var i in materials) {
                if (i === "manpower") {
                    var total = this.craftManager.getValueAvailable(i, true) / materials[i];
                } else {
                    var total = this.craftManager.getValueAvailable(i, limited, options.auto.trade.trigger) / materials[i];
                }

                amount = (amount === undefined || total < amount) ? total : amount;
            }

            amount = Math.floor(amount);

            if (amount === 0) {return 0;}

            if (race === null || options.auto.trade.items[name].allowcapped) return amount;

            // Loop through the items obtained by the race, and determine
            // which good has the most space left. Once we've determined this,
            // reduce the amount by this capacity. This ensures that we continue to trade
            // as long as at least one resource has capacity, and we never over-trade.

            var tradeOutput = this.getAverageTrade(race);
            for (var s in race.sells) {
                var item = race.sells[s];
                var resource = this.craftManager.getResource(item.name);
                var max = 0;

                // No need to process resources that don't cap
                if (!resource.maxValue) continue;

                max = tradeOutput[item.name];

                var capacity = Math.max((resource.maxValue - resource.value) / max, 0);

                highestCapacity = (capacity < highestCapacity) ? highestCapacity : capacity;
            }

            // We must take the ceiling of capacity so that we will trade as long
            // as there is any room, even if it doesn't have exact space. Otherwise
            // we seem to starve trading altogether.
            highestCapacity = Math.ceil(highestCapacity);

            if (highestCapacity === 0) {return 0;}

            // Now that we know the most we *should* trade for, check to ensure that
            // we trade for our max cost, or our max capacity, whichever is lower.
            // This helps us prevent trading for resources we can't store. Note that we
            // essentially ignore blueprints here. In addition, if highestCapacity was never set,
            // then we just

            amount = (highestCapacity < amount) ? Math.max(highestCapacity - 1, 1) : amount;

            return Math.floor(amount);
        },
        getMaterials: function (name) {
            var materials = {
                manpower: 50 - game.getEffect("tradeCatpowerDiscount"),
                gold: 15 - game.getEffect("tradeGoldDiscount")
            };

            if (name === undefined)
                return materials;

            var prices = this.getRace(name).buys;

            for (var i in prices) {
                var price = prices[i];

                materials[price.name] = price.val;
            }

            return materials;
        },
        getRace: function (name) {
            if (name === undefined)
                return null;
            else
                return game.diplomacy.get(name);
        },
        getTradeButton: function (race) {
            for (var i in this.manager.tab.racePanels) {
                var panel = this.manager.tab.racePanels[i];

                if (panel.race.name === race) return panel.tradeBtn;
            }
        },
        singleTradePossible: function (name) {
            var materials = this.getMaterials(name);
            for (var mat in materials) {
                if (this.craftManager.getValueAvailable(mat, true) < materials[mat]) {return false;}
            }
            return true;
        }
    };

    // Cache Manager
    // ===============

    var CacheManager = function () {};

    CacheManager.prototype = {
        pushToCache: function (data) {},
        getResValue: function (res) {}
    };

    // ==============================
    // Configure overall page display
    // ==============================

    var right = $('#rightColumn');

    var addRule = function (rule) {
        var sheets = document.styleSheets;
        sheets[0].insertRule(rule, 0);
    };

    var defaultSelector = 'body[data-ks-style]:not(.scheme_sleek)';

    addRule('body {' // low priority. make sure it can be covered by the theme
        + 'font-family: monospace;'
        + 'font-size: 12px;'
        + '}');
        
    addRule(defaultSelector + ' #game {'
        // + 'font-family: monospace;'
        // + 'font-size: 12px;'
        + 'min-width: 1300px;'
        + 'top: 32px;'
        + '}');

    // addRule(defaultSelector + ' {'
    //     + 'font-family: monospace;'
    //     + 'font-size: 12px;'
    //     + '}');

    addRule(defaultSelector + ' .column {'
        + 'min-height: inherit;'
        + 'max-width: inherit !important;'
        + 'padding: 1%;'
        + 'margin: 0;'
        + 'overflow-y: auto;'
        + '}');

    addRule(defaultSelector + ' #leftColumn {'
        + 'height: 92%;'
        + 'width: 26%;'
        + '}');

    addRule(defaultSelector + ' #midColumn {'
        + 'margin-top: 1% !important;'
        + 'height: 90%;'
        + 'width: 48%;'
        + '}');

    addRule(defaultSelector + ' #rightColumn {'
        + 'overflow-y: auto;'
        + 'height: 92%;'
        + 'width: 19%;'
        + '}');

    addRule('body #gamePageContainer #game #rightColumn {'
        + 'overflow-y: auto'
        + '}');

    // addRule(defaultSelector + ' #gameLog .msg {'
    //     + 'display: block;'
    //     + '}');

    addRule(defaultSelector + ' #gameLog {'
        + 'overflow-y: hidden !important;'
        + 'width: 100% !important;'
        + 'padding-top: 5px !important;'
        + '}');

    addRule(defaultSelector + ' #resContainer .maxRes {'
        + 'color: #676766;'
        + '}');

    addRule(defaultSelector + ' #game .btn {'
        + 'border-radius: 0px;'
        + 'font-family: monospace;'
        + 'font-size: 12px !important;'
        + 'margin: 0 5px 7px 0;'
        + 'width: 290px;'
        + '}');

    addRule(defaultSelector + ' #game .map-viewport {'
        + 'height: 340px;'
        + 'max-width: 500px;'
        + 'overflow: visible;'
        + '}');

    addRule(' #game .map-dashboard {'
        + 'height: 120px;'
        + 'width: 292px;'
        + '}');

    addRule('#ks-options ul {'
        + 'list-style: none;'
        + 'margin: 0 0 5px;'
        + 'padding: 0;'
        + '}');

    addRule('#ks-options ul:after {'
        + 'clear: both;'
        + 'content: " ";'
        + 'display: block;'
        + 'height: 0;'
        + '}');

    addRule('#ks-options ul li {'
        + 'display: block;'
        + 'float: left;'
        + 'width: 100%;'
        + '}');

    addRule('#ks-options #toggle-list-resources .stockWarn *,'
        + '#ks-options #toggle-reset-list-resources .stockWarn * {'
        + 'color: ' + options.stockwarncolor + ';'
        + '}');
    
    addRule('.right-tab {'
        + 'height: unset !important;'
        + '}');

    // Local Storage
    // =============

    var kittenStorageVersion = 2;

    var kittenStorage = {
        version: kittenStorageVersion,
        toggles: {},
        items: {},
        resources: {},
        triggers: {},
        reset: {
            reset: false,
            times: 0,
            paragonLastTime: 0,
            pargonTotal: 0,
            karmaLastTime: 0,
            karmaTotal: 0
        }
    };

    var initializeKittenStorage = function () {
        $("#items-list-build, #items-list-craft, #items-list-trade").find("input[id^='toggle-']").each(function () {
            kittenStorage.items[$(this).attr("id")] = $(this).prop("checked");
        });

        saveToKittenStorage();
    };

    var saveToKittenStorage = function () {
        kittenStorage.toggles = {
            build: options.auto.build.enabled,
            space: options.auto.space.enabled,
            craft: options.auto.craft.enabled,
            upgrade: options.auto.upgrade.enabled,
            trade: options.auto.trade.enabled,
            faith: options.auto.faith.enabled,
            time: options.auto.time.enabled,
            timeCtrl: options.auto.timeCtrl.enabled,
            distribute: options.auto.distribute.enabled,
            options: options.auto.options.enabled,
            filter: options.auto.filter.enabled
        };
        kittenStorage.resources = options.auto.resources;
        kittenStorage.triggers = {
            faith: options.auto.faith.trigger,
            time: options.auto.time.trigger,
            build: options.auto.build.trigger,
            space: options.auto.space.trigger,
            craft: options.auto.craft.trigger,
            trade: options.auto.trade.trigger
        };

        localStorage['cbc.kitten-scientists'] = JSON.stringify(kittenStorage);
    };

    var loadFromKittenStorage = function () {
        var saved = JSON.parse(localStorage['cbc.kitten-scientists'] || 'null');
        if (saved && saved.version == 1) {
            saved.version = 2;
            saved.reset = {
                reset: false,
                times: 0,
                paragonLastTime: 0,
                pargonTotal: 0,
                karmaLastTime: 0,
                karmaTotal: 0
            };
        }
        if (saved && saved.version == kittenStorageVersion) {
            kittenStorage = saved;

            if (saved.toggles) {
                for (var toggle in saved.toggles) {
                    if (toggle !== 'engine' && options.auto[toggle]) {
                        options.auto[toggle].enabled = !!saved.toggles[toggle];
                        var el = $('#toggle-' + toggle);
                        el.prop('checked', options.auto[toggle].enabled);
                    }
                }
            }

            for (var item in kittenStorage.items) {
                var value = kittenStorage.items[item];
                var el = $('#' + item);
                var option = el.data('option');
                var name = item.split('-');

                if (option === undefined) {
                    delete kittenStorage.items[item];
                    continue;
                }

                if (name[0] == 'set') {
                    el[0].title = value;
                    if (name[name.length -1] == 'max') {
                        el.text(i18n('ui.max', [value]));
                    } else if (name[name.length -1] == 'min') {
                        el.text(i18n('ui.min', [value]));
                    }
                } else {
                    el.prop('checked', value);
                }

                if (name.length == 2) {
                    option.enabled = value;
                } else if (name[1] == 'reset' && name.length >= 4) {
                    var type = name[2];
                    var itemName = name[3];
                    switch (name[0]) {
                        case 'toggle':
                            options.auto[type].items[itemName].checkForReset = value;
                            break;
                        case 'set':
                            options.auto[type].items[itemName].triggerForReset = value;
                            break;
                    }
                } else {
                    if (name[1] == 'limited') {
                        option.limited = value;
                    } else {
                        option[name[2]] = value;
                    }
                }
            }

            var resourcesList = $("#toggle-list-resources");
            var resetList = $("#toggle-reset-list-resources");
            for (var resource in kittenStorage.resources) {
                var res = kittenStorage.resources[resource];

                if (res.enabled) {
                    if ($('#resource-' + resource).length === 0)
                        resourcesList.append(addNewResourceOption(resource));
                    if ('stock' in res) setStockValue(resource, res.stock);
                    if ('consume' in res) setConsumeRate(resource, res.consume);
                }
                if (res.checkForReset) {
                    if ($('#resource-reset-' + resource).length === 0)
                        resetList.append(addNewResourceOption(resource, undefined, true));
                    if ('stockForReset' in res) setStockValue(resource, res.stockForReset ? res.stockForReset : Infinity, true);
                }
            }
            
            if (saved.triggers) {
                options.auto.faith.trigger = saved.triggers.faith;
                options.auto.time.trigger = saved.triggers.time;
                options.auto.build.trigger = saved.triggers.build;
                options.auto.space.trigger = saved.triggers.space;
                options.auto.craft.trigger = saved.triggers.craft;
                options.auto.trade.trigger = saved.triggers.trade;

                $('#trigger-faith')[0].title = options.auto.faith.trigger;
                $('#trigger-time')[0].title = options.auto.time.trigger;
                $('#trigger-build')[0].title = options.auto.build.trigger;
                $('#trigger-space')[0].title = options.auto.space.trigger;
                $('#trigger-craft')[0].title = options.auto.craft.trigger;
                $('#trigger-trade')[0].title = options.auto.trade.trigger;
            }

        } else {
            initializeKittenStorage();
        }
    };

    // Add options element
    // ===================

    var ucfirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    var roundToTwo = function (n) {
        return +(Math.round(n + "e+2") + "e-2")
    };

    var setStockWarning = function(name, value, forReset=false) {
        // simplest way to ensure it doesn't stick around too often; always do
        // a remove first then re-add only if needed
        var path = forReset ? '#resource-reset-'+name : '#resource-'+name;
        $(path).removeClass("stockWarn");

        var maxValue = game.resPool.resources.filter(i => i.name == name)[0].maxValue;
        if ((value > maxValue && !(maxValue === 0)) || value === Infinity) $(path).addClass("stockWarn");
    }

    var setStockValue = function (name, value, forReset=false) {
        var n = Number(value);

        if (isNaN(n) || n < 0) {
            warning('ignoring non-numeric or invalid stock value ' + value);
            return;
        }

        if (!options.auto.resources[name]) options.auto.resources[name] = {};
        if (forReset) {
            var path = '#resource-reset-' + name + ' #stock-value-' + name;
            n = n<0 ? Infinity : n;
            options.auto.resources[name].checkForReset = true;
            options.auto.resources[name].stockForReset = n;
        } else {
            var path = '#resource-' + name + ' #stock-value-' + name;
            options.auto.resources[name].enabled = true;
            options.auto.resources[name].stock = n;
        }
        $(path).text(i18n('resources.stock', [n === Infinity ? '∞' : game.getDisplayValueExt(n)]));

        setStockWarning(name, n, forReset);
    };

    var setConsumeRate = function (name, value) {
        var n = parseFloat(value);

        if (isNaN(n) || n < 0.0 || n > 1.0) {
            warning('ignoring non-numeric or invalid consume rate ' + value);
            return;
        }

        if (!options.auto.resources[name]) options.auto.resources[name] = {};
        options.auto.resources[name].consume = n;
        $('#consume-rate-' + name).text(i18n('resources.consume', [n.toFixed(2)]));
    };

    var removeResourceControl = function (name, forReset=false) {
        var opt = options.auto.resources[name];
        if (forReset)
            opt.checkForReset = false;
        else
            opt.enabled = false;

        if (!opt.enabled && !opt.checkForReset)
            delete options.auto.resources[name];
    };

    var addNewResourceOption = function (name, title, forReset=false) {
        title = title || game.resPool.get(name).title || ucfirst(name);
        var res = options.auto.resources[name];
        if (forReset && res && res.stockForReset)
            var stock = res.stockForReset;
        else if (!forReset && res && res.stock)
            var stock = res.stock;
        else
            var stock = 0;
        var consume = res && (res.consume != undefined) ? res.consume : options.consume;

        var container = $('<div/>', {
            id: (forReset ? 'resource-reset-' : 'resource-') + name,
            css: {display: 'inline-block', width: '100%'},
        });

        var label = $('<div/>', {
            id: 'resource-label-' + name,
            text: title,
            css: {display: 'inline-block', width: '95px'},
        });

        var stock = $('<div/>', {
            id: 'stock-value-' + name,
            text: i18n('resources.stock', [stock === Infinity ? '∞' : game.getDisplayValueExt(stock)]),
            css: {cursor: 'pointer', display: 'inline-block', width: '80px'},
        });

        var consume = $('<div/>', {
            id: 'consume-rate-' + name,
            text: i18n('resources.consume', [consume.toFixed(2)]),
            css: {cursor: 'pointer', display: 'inline-block'},
        });

        var del = $('<div/>', {
            id: 'resource-delete-' + name,
            text: i18n('resources.del'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray'},
        });

        if (forReset)
            container.append(label, stock, del);
        else
            container.append(label, stock, consume, del);

        // once created, set color if relevant
        if (res != undefined && res.stock != undefined) setStockWarning(name, res.stock);

        (function (stock, forReset) {
            stock.on('click', function () {
                var value = window.prompt(i18n('resources.stock.set', [title]));
                if (value !== null) {
                    setStockValue(name, value, forReset);
                    saveToKittenStorage();
                }
            })
        })(stock, forReset);

        consume.on('click', function () {
            var value = window.prompt(i18n('resources.consume.set', [title]));
            if (value !== null) {
                setConsumeRate(name, value);
                saveToKittenStorage();
            }
        });

        (function (del, forReset) {
            del.on('click', function () {
                if (window.confirm(i18n('resources.del.confirm', [title]))) {
                    container.remove();
                    removeResourceControl(name, forReset);
                    saveToKittenStorage();
                }
            })
        })(del, forReset);

        return container;
    };

    var getAvailableResourceOptions = function (forReset) {
        var items = [];
        var idPrefix = forReset ? '#resource-reset-' : '#resource-';

        for (var i in game.resPool.resources) {
            var res = game.resPool.resources[i];

            // Show only new resources that we don't have in the list and that are
            // visible. This helps cut down on total size.
            if (res.name && $(idPrefix + res.name).length === 0) {
                var item = $('<div/>', {
                    id: 'resource-add-' + res.name,
                    text: ucfirst(res.title ? res.title : res.name),
                    css: {cursor: 'pointer',
                        textShadow: '3px 3px 4px gray'},
                });

                // Wrapper function needed to make closure work
                (function (res, item, forReset) {
                    item.on('click', function () {
                        item.remove();
                        if (!options.auto.resources[res.name]) options.auto.resources[res.name] = {};
                        if (forReset) {
                            options.auto.resources[res.name].checkForReset = true;
                            options.auto.resources[res.name].stockForReset = Infinity;
                            $('#toggle-reset-list-resources').append(addNewResourceOption(res.name, res.title, forReset));

                        } else {
                            options.auto.resources[res.name].enabled = true;
                            options.auto.resources[res.name].stock = 0;
                            options.auto.resources[res.name].consume = options.consume;
                            $('#toggle-list-resources').append(addNewResourceOption(res.name, res.title, forReset));
                        }
                        saveToKittenStorage();
                    });
                })(res, item, forReset);

                items.push(item);
            }
        }

        return items;
    };

    var getResourceOptions = function (forReset=false) {
        var list = $('<ul/>', {
            id: forReset ? 'toggle-reset-list-resources' : 'toggle-list-resources',
            css: {display: 'none', paddingLeft: '20px'}
        });

        var add = $('<div/>', {
            id: 'resources-add',
            text: i18n('resources.add'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                textShadow: '3px 3px 4px gray',
                borderBottom: '1px solid rgba(185, 185, 185, 0.7)' },
        });

        var clearunused = $('<div/>', {
            id: 'resources-clear-unused',
            text: i18n('resources.clear.unused'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray' },
        });

        clearunused.on('click', function () {
            for (var name in options.auto.resources) {
                // Only delete resources with unmodified values. Require manual
                // removal of resources with non-standard values.
                if (!options.auto.resources[name].stock &&
                    options.auto.resources[name].consume == options.consume ||
                    options.auto.resources[name].consume == undefined) {
                    $('#resource-' + name).remove();
                }
            }
        });

        var allresources = $('<ul/>', {
            id: 'available-resources-list',
            css: {display: 'none', paddingLeft: '20px'}
        });

        (function (add, forReset) {
            add.on('click', function () {
                allresources.toggle();
                allresources.empty();
                allresources.append(getAvailableResourceOptions(forReset));
            });
        })(add, forReset);

        if (forReset)
            list.append(add, allresources);
        else
            list.append(add, clearunused, allresources);

        // Add all the current resources
        for (var name in options.auto.resources) {
            var res = options.auto.resources[name];
            if ((forReset && res.checkForReset) || (!forReset && res.enabled))
                list.append(addNewResourceOption(name, undefined, forReset));
        }

        return list;
    };

    var getOptionHead = function (toggleName) {
        var list = $('<ul/>', {
            id: 'items-list-' + toggleName,
            css: {display: 'none', paddingLeft: '20px'}
        });

        var disableall = $('<div/>', {
            id: 'toggle-all-items-' + toggleName,
            text: i18n('ui.disable.all'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                textShadow: '3px 3px 4px gray',
                marginRight: '8px'}
        });

        disableall.on('click', function () {
            // can't use find as we only want one layer of checkboxes
            var items = list.children().children(':checkbox');
            items.prop('checked', false);
            items.change();
            list.children().children(':checkbox').change();
        });

        list.append(disableall);

        var enableall = $('<div/>', {
            id: 'toggle-all-items-' + toggleName,
            text: i18n('ui.enable.all'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                textShadow: '3px 3px 4px gray'}
        });

        enableall.on('click', function () {
            // can't use find as we only want one layer of checkboxes
            var items = list.children().children(':checkbox');
            items.prop('checked', true);
            items.change();
            list.children().children(':checkbox').change();
        });

        list.append(enableall);
        return list
    }

    var getAdditionOptions = function () {
        var toggleName = 'faith-addition';
        var list = getOptionHead(toggleName);

        var addi = options.auto.faith.addition;
        for (var itemName in addi) {
            node = getOption(itemName, addi[itemName]);

            if (itemName == 'bestUnicornBuilding') {
                node.children('label').prop('title', i18n('option.faith.best.unicorn.desc'));
                input = node.children('input');
                input.unbind('change')
                var bub = addi.bestUnicornBuilding;
                input.on('change', function () {
                    if (input.is(':checked') && !bub.enabled) {

                        bub.enabled = true;
                        // enable all unicorn buildings
                        for (var unicornName in options.auto.unicorn.items) {
                            var building = $('#toggle-' + unicornName);
                            building.prop('checked', true);
                            building.trigger('change');
                        }
                        imessage('status.sub.enable', [i18n('option.faith.best.unicorn')]);

                    } else if ((!input.is(':checked')) && bub.enabled) {

                        bub.enabled = false;
                        imessage('status.sub.disable', [i18n('option.faith.best.unicorn')]);

                    }
                    kittenStorage.items[input.attr('id')] = bub.enabled;
                    saveToKittenStorage();
                });
            }

            if (addi[itemName].subTrigger !== undefined) {

                var triggerButton = $('<div/>', {
                    id: 'set-' + itemName + '-subTrigger',
                    text: i18n('ui.trigger'),
                    title: addi[itemName].subTrigger,
                    css: {cursor: 'pointer',
                        display: 'inline-block',
                        float: 'right',
                        paddingRight: '5px',
                        textShadow: '3px 3px 4px gray'}
                }).data('option', addi[itemName]);
            
                (function (itemName, triggerButton) {
                    if (itemName == 'adore') {
                        triggerButton.on('click', function () {
                            var value;
                            value = window.prompt(i18n('adore.trigger.set'), addi[itemName].subTrigger);
            
                            if (value !== null) {
                                addi[itemName].subTrigger = parseFloat(value);
                                kittenStorage.items[triggerButton[0].id] = addi[itemName].subTrigger;
                                saveToKittenStorage();
                                triggerButton[0].title = addi[itemName].subTrigger;
                            }
                        })
        
                    } else if (itemName == 'autoPraise') {
                        triggerButton.on('click', function () {
                            var value;
                            value = window.prompt(i18n('ui.trigger.set', [i18n('option.praise')]), addi[itemName].subTrigger);
            
                            if (value !== null) {
                                addi[itemName].subTrigger = parseFloat(value);
                                kittenStorage.items[triggerButton[0].id] = addi[itemName].subTrigger;
                                saveToKittenStorage();
                                triggerButton[0].title = addi[itemName].subTrigger;
                            }
                        });
                    }
                })(itemName, triggerButton);
                node.append(triggerButton);
            }

            list.append(node);
        }
        
        return list;
    }

    var getToggle = function (toggleName) {
        var itext = ucfirst(i18n('ui.' + toggleName));

        var auto = options.auto[toggleName];
        var element = $('<li/>', {id: 'ks-' + toggleName});

        var label = $('<label/>', {
            'for': 'toggle-' + toggleName,
            text: itext
        });

        var input = $('<input/>', {
            id: 'toggle-' + toggleName,
            type: 'checkbox'
        });

        if (auto.enabled) {
            input.prop('checked', true);
        }

        // engine needs a custom toggle
        if (toggleName !== 'engine') {
            input.on('change', function () {
                if (input.is(':checked') && auto.enabled == false) {
                    auto.enabled = true;
                    if (toggleName === 'filter' || toggleName === 'options') {
                        imessage('status.sub.enable', [itext]);
                    } else {
                        imessage('status.auto.enable', [itext]);
                    }
                    saveToKittenStorage();
                } else if ((!input.is(':checked')) && auto.enabled == true) {
                    auto.enabled = false;
                    if (toggleName === 'filter' || toggleName === 'options') {
                        imessage('status.sub.disable', [itext]);
                    } else {
                        imessage('status.auto.disable', [itext]);
                    }
                    saveToKittenStorage();
                }
            });
        }

        element.append(input, label);

        if (auto.items) {
            // Add a border on the element
            element.css('borderBottom', '1px  solid rgba(185, 185, 185, 0.7)');

            var toggle = $('<div/>', {
                css: {display: 'inline-block', float: 'right'}
            });

            var button = $('<div/>', {
                id: 'toggle-items-' + toggleName,
                text: i18n('ui.items'),
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            });

            element.append(button);

            var list = getOptionHead(toggleName);

            // merge unicorn to faith
            if (toggleName == 'faith')
                for (var itemName in options.auto.unicorn.items)
                    list.append(getOption(itemName, options.auto.unicorn.items[itemName]));

            // fill out list with toggle items
            for (var itemName in auto.items) {
                switch (toggleName) {
                    case 'trade':
                        list.append(getTradeOption(itemName, auto.items[itemName]));
                        break;
                    case 'craft':
                        list.append(getCraftOption(itemName, auto.items[itemName]));
                        break;
                    case 'timeCtrl':
                        list.append(getTimeCtrlOption(itemName, auto.items[itemName]));
                        break;
                    case 'options':
                        list.append(getOptionsOption(itemName, auto.items[itemName]));
                        break;
                    case 'upgrade':
                        list.append(getOption(itemName, auto.items[itemName], i18n('ui.upgrade.' + itemName)));
                        break;
                    case 'distribute':
                        list.append(getDistributeOption(itemName, auto.items[itemName]));
                        break;
                    case 'build':
                    case 'space':
                        list.append(getLimitedOption(itemName, auto.items[itemName]));
                        break;
                    default:
                        list.append(getOption(itemName, auto.items[itemName]));
                        break;

                }
            }

            button.on('click', function () {
                list.toggle();
            });

            // Add resource controls for crafting, sort of a hack
            if (toggleName === 'craft') {
                var resources = $('<div/>', {
                    id: 'toggle-resource-controls',
                    text: i18n('ui.craft.resources'),
                    css: {cursor: 'pointer',
                        display: 'inline-block',
                        float: 'right',
                        paddingRight: '5px',
                        textShadow: '3px 3px 4px gray'},
                });

                var resourcesList = getResourceOptions();

                // When we click the items button, make sure we clear resources
                button.on('click', function () {
                    resourcesList.toggle(false);
                });

                resources.on('click', function () {
                    list.toggle(false);
                    resourcesList.toggle();
                });

                element.append(resources);
            }

            // Add additional controls for faith, sort of a hack again
            if (toggleName === 'faith') {
                var addition = $('<div/>', {
                    id: 'toggle-addition-controls',
                    text: i18n('ui.faith.addtion'),
                    css: {cursor: 'pointer',
                        display: 'inline-block',
                        float: 'right',
                        paddingRight: '5px',
                        textShadow: '3px 3px 4px gray'},
                });

                var additionList = getAdditionOptions();

                button.on('click', function () {
                    additionList.toggle(false);
                });

                addition.on('click', function () {
                    list.toggle(false);
                    additionList.toggle();
                });

                element.append(addition);

                // disable auto best unicorn building when unicorn building was disable
                for (var unicornName in options.auto.unicorn.items) {
                    var ub = list.children().children('#toggle-' + unicornName);
                    ub.on('change', function() {
                        if (!$(event.target).is(':checked')) {
                            var b = $('#toggle-bestUnicornBuilding');
                            b.prop('checked', false);
                            b.trigger('change');
                        }
                    });
                };
            }

        }

        if (auto.trigger !== undefined) {
            var triggerButton = $('<div/>', {
                id: 'trigger-' + toggleName,
                text: i18n('ui.trigger'),
                title: auto.trigger,
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            });

            triggerButton.on('click', function () {
                var value;
                value = window.prompt(i18n('ui.trigger.set', [itext]), auto.trigger);

                if (value !== null) {
                    auto.trigger = parseFloat(value);
                    saveToKittenStorage();
                    triggerButton[0].title = auto.trigger;
                }
            });

            element.append(triggerButton);
        }

        if (toggleName === 'craft') {element.append(resourcesList);}
        else if (toggleName === 'faith') {element.append(additionList);}

        if (auto.items) {element.append(toggle, list);}

        return element;
    };

    var getTradeOption = function (name, option) {
        var iname = ucfirst(i18n('$trade.race.' + name));

        var element = getOption(name, option, iname);
        element.css('borderBottom', '1px solid rgba(185, 185, 185, 0.7)');

        //Limited Trading
        var label = $('<label/>', {
            'for': 'toggle-limited-' + name,
            text: i18n('ui.limit')
        });

        var input = $('<input/>', {
            id: 'toggle-limited-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.limited) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.limited == false) {
                option.limited = true;
                imessage('trade.limited', [iname]);
            } else if ((!input.is(':checked')) && option.limited == true) {
                option.limited = false;
                imessage('trade.unlimited', [iname]);
            }
            kittenStorage.items[input.attr('id')] = option.limited;
            saveToKittenStorage();
        });

        element.append(input, label);
        //Limited Trading End

        var button = $('<div/>', {
            id: 'toggle-seasons-' + name,
            text: i18n('trade.seasons'),
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray'},
        });

        var list = $('<ul/>', {
            id: 'seasons-list-' + name,
            css: {display: 'none', paddingLeft: '20px'}
        });

        // fill out the list with seasons
        list.append(getSeason(name, 'spring', option));
        list.append(getSeason(name, 'summer', option));
        list.append(getSeason(name, 'autumn', option));
        list.append(getSeason(name, 'winter', option));

        button.on('click', function () {
            list.toggle();
        });

        element.append(button, list);

        return element;
    };

    var getSeason = function (name, season, option) {
        var iname = ucfirst(i18n('$trade.race.' + name));
        var iseason = ucfirst(i18n('$calendar.season.' + season));

        var element = $('<li/>');

        var label = $('<label/>', {
            'for': 'toggle-' + name + '-' + season,
            text: ucfirst(iseason)
        });

        var input = $('<input/>', {
            id: 'toggle-' + name + '-' + season,
            type: 'checkbox'
        }).data('option', option);

        if (option[season]) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option[season] == false) {
                option[season] = true;
                imessage('trade.season.enable', [iname, iseason]);
            } else if ((!input.is(':checked')) && option[season] == true) {
                option[season] = false;
                imessage('trade.season.disable', [iname, iseason]);
            }
            kittenStorage.items[input.attr('id')] = option[season];
            saveToKittenStorage();
        });

        element.append(input, label);

        return element;
    };

    var getSeasonForTimeSkip = function (season, option) {
        var iseason = ucfirst(i18n('$calendar.season.' + season));

        var element = $('<li/>');

        var label = $('<label/>', {
            'for': 'toggle-timeSkip-' + season,
            text: ucfirst(iseason)
        });

        var input = $('<input/>', {
            id: 'toggle-timeSkip-' + season,
            type: 'checkbox'
        }).data('option', option);

        if (option[season]) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option[season] == false) {
                option[season] = true;
                imessage('time.skip.season.enable', [iseason]);
            } else if ((!input.is(':checked')) && option[season] == true) {
                option[season] = false;
                imessage('time.skip.season.disable', [iseason]);
            }
            kittenStorage.items[input.attr('id')] = option[season];
            saveToKittenStorage();
        });

        element.append(input, label);

        return element;
    };

    var getOption = function (name, option, iname) {
        var element = $('<li/>');
        var elementLabel = iname || option.label || ucfirst(name);

        var label = $('<label/>', {
            'for': 'toggle-' + name,
            text: elementLabel,
            css: {display: 'inline-block', minWidth: '80px'}
        });

        var input = $('<input/>', {
            id: 'toggle-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.enabled) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.enabled == false) {
                option.enabled = true;
                if (option.filter) {
                    imessage('filter.enable', [elementLabel]);
                } else if (option.misc) {
                    imessage('status.sub.enable', [elementLabel]);
                } else {
                    imessage('status.auto.enable', [elementLabel]);
                }
            } else if ((!input.is(':checked')) && option.enabled == true) {
                option.enabled = false;
                if (option.filter) {
                    imessage('filter.disable', [elementLabel]);
                } else if (option.misc) {
                    imessage('status.sub.disable', [elementLabel]);
                } else {
                    imessage('status.auto.disable', [elementLabel]);
                }
            }
            kittenStorage.items[input.attr('id')] = option.enabled;
            saveToKittenStorage();
        });

        element.append(input, label);

        return element;
    };

    var getLimitedOption = function (name, option, iname) {
        var element = $('<li/>');
        var elementLabel = iname || option.label || ucfirst(name);

        var label = $('<label/>', {
            'for': 'toggle-' + name,
            text: elementLabel,
            css: {display: 'inline-block', minWidth: '80px'}
        });

        var input = $('<input/>', {
            id: 'toggle-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.enabled) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.enabled == false) {
                option.enabled = true;
                if (option.filter) {
                    imessage('filter.enable', [elementLabel]);
                } else if (option.misc) {
                    imessage('status.sub.enable', [elementLabel]);
                } else {
                    imessage('status.auto.enable', [elementLabel]);
                }
            } else if ((!input.is(':checked')) && option.enabled == true) {
                option.enabled = false;
                if (option.filter) {
                    imessage('filter.disable', [elementLabel]);
                } else if (option.misc) {
                    imessage('status.sub.disable', [elementLabel]);
                } else {
                    imessage('status.auto.disable', [elementLabel]);
                }
            }
            kittenStorage.items[input.attr('id')] = option.enabled;
            saveToKittenStorage();
        });

        var maxButton = $('<div/>', {
            id: 'set-' + name + '-max',
            text: i18n('ui.max', [option.max]),
            title: option.max,
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray'}
        }).data('option', option);

        maxButton.on('click', function () {
            var value;
            value = window.prompt(i18n('ui.max.set', [option.label]), option.max);

            if (value !== null) {
                option.max = parseInt(value);
                kittenStorage.items[maxButton.attr('id')] = option.max;
                saveToKittenStorage();
                maxButton[0].title = option.max;
                maxButton[0].innerText = i18n('ui.max', [option.max]);
            }
        });

        element.append(input, label, maxButton);

        return element;
    };

    var getCraftOption = function (name, option) {
        var iname = ucfirst(i18n('$resources.' + name + '.title'));

        var element = getOption(name, option, iname);

        var label = $('<label/>', {
            'for': 'toggle-limited-' + name,
            text: i18n('ui.limit')
        });

        var input = $('<input/>', {
            id: 'toggle-limited-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.limited) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.limited == false) {
                option.limited = true;
                imessage('craft.limited', [iname]);
            } else if ((!input.is(':checked')) && option.limited == true) {
                option.limited = false;
                imessage('craft.unlimited', [iname]);
            }
            kittenStorage.items[input.attr('id')] = option.limited;
            saveToKittenStorage();
        });

        element.append(input, label);

        return element;
    };

    var getCycle = function (index, option) {
        var cycle = game.calendar.cycles[index];


        var element = $('<li/>');

        var label = $('<label/>', {
            'for': 'toggle-timeSkip-' + index,
            text: cycle.title
        });

        var input = $('<input/>', {
            id: 'toggle-timeSkip-' + index,
            type: 'checkbox'
        }).data('option', option);

        if (option[index]) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option[index] == false) {
                option[index] = true;
                imessage('time.skip.cycle.enable', [cycle.title]);
            } else if ((!input.is(':checked')) && option[index] == true) {
                option[index] = false;
                imessage('time.skip.cycle.disable', [cycle.title]);
            }
            kittenStorage.items[input.attr('id')] = option[index];
            saveToKittenStorage();
        });

        element.append(input, label);

        return element;
    }

    var getResetOption = function (name, type, option) {
        var element = $('<li/>');
        var elementLabel = option.label;

        var label = $('<label/>', {
            'for': 'toggle-reset-' + type + '-' + name,
            text: elementLabel,
            css: {display: 'inline-block', minWidth: '80px'}
        });

        var input = $('<input/>', {
            id: 'toggle-reset-' + type + '-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.checkForReset) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.checkForReset == false) {
                option.checkForReset = true;
                imessage('status.reset.check.enable', [elementLabel]);
            } else if ((!input.is(':checked')) && option.checkForReset == true) {
                option.checkForReset = false;
                imessage('status.reset.check.disable', [elementLabel]);
            }
            kittenStorage.items[input.attr('id')] = option.checkForReset;
            saveToKittenStorage();
        });
        
        var minButton = $('<div/>', {
            id: 'set-reset-' + type + '-' + name +'-min',
            text: i18n('ui.min', [option.triggerForReset]),
            title: option.triggerForReset,
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray'}
        }).data('option', option);

        minButton.on('click', function () {
            var value;
            value = window.prompt(i18n('reset.check.trigger.set', [option.label]), option.triggerForReset);

            if (value !== null) {
                option.triggerForReset = parseInt(value);
                kittenStorage.items[minButton.attr('id')] = option.triggerForReset;
                saveToKittenStorage();
                minButton[0].title = option.triggerForReset;
                minButton[0].innerText = i18n('ui.min', [option.triggerForReset]);
            }
        });


        element.append(input, label, minButton);

        return element;
    }

    var getTimeCtrlOption = function (name, option) {
        var element = getOption(name, option);

        if (name == 'timeSkip') {
            var triggerButton = $('<div/>', {
                id: 'set-timeSkip-subTrigger',
                text: i18n('ui.trigger'),
                title: option.subTrigger,
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            }).data('option', option);
            triggerButton.on('click', function () {
                var value;
                value = window.prompt(i18n('time.skip.trigger.set', []), option.subTrigger);

                if (value !== null) {
                    option.subTrigger = parseFloat(value);
                    kittenStorage.items[triggerButton.attr('id')] = option.subTrigger;
                    saveToKittenStorage();
                    triggerButton[0].title = option.subTrigger;
                }
            });

            var maximunButton = $('<div/>', {
                id: 'set-timeSkip-maximum',
                text: i18n('ui.maximum'),
                title: option.max,
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            }).data('option', option);
            maximunButton.on('click', function () {
                var value;
                value = window.prompt(i18n('ui.max.set', [i18n('option.time.skip')]), option.maximum);

                if (value !== null) {
                    option.maximum = parseFloat(value);
                    kittenStorage.items[maximunButton.attr('id')] = option.maximum;
                    saveToKittenStorage();
                    maximunButton[0].title = option.maximum;
                }
            });

            var cyclesButton = $('<div/>', {
                id: 'toggle-cycle-' + name,
                text: i18n('ui.cycles'),
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'},
            });

            var cyclesList = $('<ul/>', {
                id: 'cycles-list-' + name,
                css: {display: 'none', paddingLeft: '20px'}
            });

            for (var i in game.calendar.cycles)
                cyclesList.append(getCycle(i, option));


            var seasonsButton = $('<div/>', {
                id: 'toggle-seasons-' + name,
                text: i18n('trade.seasons'),
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'},
            });
    

            var seasonsList = $('<ul/>', {
                id: 'seasons-list-' + name,
                css: {display: 'none', paddingLeft: '20px'}
            });
    
            // fill out the list with seasons
            seasonsList.append(getSeasonForTimeSkip('spring', option));
            seasonsList.append(getSeasonForTimeSkip('summer', option));
            seasonsList.append(getSeasonForTimeSkip('autumn', option));
            seasonsList.append(getSeasonForTimeSkip('winter', option));
    
            cyclesButton.on('click', function () {
                cyclesList.toggle();
                seasonsList.toggle(false);
            });

            seasonsButton.on('click', function () {
                cyclesList.toggle(false);
                seasonsList.toggle();
            });    

            element.append(cyclesButton, seasonsButton, maximunButton, triggerButton, cyclesList, seasonsList);

        } else if (name == 'reset') {

            var resetBuildList     = getOptionHead('reset-build')
            var resetSpaceList     = getOptionHead('reset-space')
            var resetResourcesList = getResourceOptions(true);
            var resetReligionList  = getOptionHead('reset-religion')
            var resetTimeList      = getOptionHead('reset-time')
            
            for (var item in options.auto.build.items)              resetBuildList.append(getResetOption(item, 'build', options.auto.build.items[item]));
            for (var item in options.auto.space.items)              resetSpaceList.append(getResetOption(item, 'space', options.auto.space.items[item]));
            for (var item in options.auto.unicorn.items)            resetReligionList.append(getResetOption(item, 'unicorn', options.auto.unicorn.items[item]));
            for (var item in options.auto.faith.items)              resetReligionList.append(getResetOption(item, 'faith', options.auto.faith.items[item]));
            for (var item in options.auto.time.items)               resetTimeList.append(getResetOption(item, 'time', options.auto.time.items[item]));

            var buildButton = $('<div/>', {id: 'toggle-reset-build', text: i18n('ui.build'),
                css: {cursor:'pointer',display:'inline-block',float:'right',paddingRight:'5px',textShadow:'3px 3px 4px gray'},});
            var spaceButton = $('<div/>', {id: 'toggle-reset-space', text: i18n('ui.space'),
                css: {cursor:'pointer',display:'inline-block',float:'right',paddingRight:'5px',textShadow:'3px 3px 4px gray'},});
            var resourcesButton = $('<div/>', {id: 'toggle-reset-resources', text: i18n('ui.craft.resources'),
                css: {cursor:'pointer',display:'inline-block',float:'right',paddingRight:'5px',textShadow:'3px 3px 4px gray'},});
            var religionButton = $('<div/>', {id: 'toggle-reset-religion', text: i18n('ui.faith'),
                css: {cursor:'pointer',display:'inline-block',float:'right',paddingRight:'5px',textShadow:'3px 3px 4px gray'},});
            var timeButton = $('<div/>', {id: 'toggle-reset-time', text: i18n('ui.time'),
                css: {cursor:'pointer',display:'inline-block',float:'right',paddingRight:'5px',textShadow:'3px 3px 4px gray'},});

            buildButton.on('click', function(){resetBuildList.toggle(); resetSpaceList.toggle(false); resetResourcesList.toggle(false); resetReligionList.toggle(false); resetTimeList.toggle(false);})
            spaceButton.on('click', function(){resetBuildList.toggle(false); resetSpaceList.toggle(); resetResourcesList.toggle(false); resetReligionList.toggle(false); resetTimeList.toggle(false);})
            resourcesButton.on('click', function(){resetBuildList.toggle(false); resetSpaceList.toggle(false); resetResourcesList.toggle(); resetReligionList.toggle(false); resetTimeList.toggle(false);})
            religionButton.on('click', function(){resetBuildList.toggle(false); resetSpaceList.toggle(false); resetResourcesList.toggle(false); resetReligionList.toggle(); resetTimeList.toggle(false);})
            timeButton.on('click', function(){resetBuildList.toggle(false); resetSpaceList.toggle(false); resetResourcesList.toggle(false); resetReligionList.toggle(false); resetTimeList.toggle();})

            element.append(buildButton, spaceButton, resourcesButton, religionButton, timeButton,
                resetBuildList, resetSpaceList, resetResourcesList, resetReligionList, resetTimeList);
        } else {
            var triggerButton = $('<div/>', {
                id: 'set-' + name +'-subTrigger',
                text: i18n('ui.trigger'),
                title: option.subTrigger,
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            }).data('option', option);
    
            triggerButton.on('click', function () {
                var value;
                value = window.prompt(i18n('ui.trigger.set', [option.label]), option.subTrigger);
    
                if (value !== null) {
                    option.subTrigger = parseFloat(value);
                    kittenStorage.items[triggerButton.attr('id')] = option.subTrigger;
                    saveToKittenStorage();
                    triggerButton[0].title = option.subTrigger;
                }
            });
            element.append(triggerButton);
        }

        return element;
    };

    var getOptionsOption = function (name, option) {
        var element = getOption(name, option);

        // hack for style. 
        // If there are more UI options, split it to "getUIOption"
        if (name == 'style') {
            var input = element.children('input');
            input.unbind('change');
            input.on('change', function () {
                option.enabled = input.prop('checked');
                kittenStorage.items[input.attr('id')] = option.enabled;
                saveToKittenStorage();
                if (option.enabled) {
                    document.body.setAttribute('data-ks-style', '');
                } else {
                    document.body.removeAttribute('data-ks-style');
                }
            });
        }


        if (option.subTrigger !== undefined) {
            var triggerButton = $('<div/>', {
                id: 'set-' + name +'-subTrigger',
                text: i18n('ui.trigger'),
                title: option.subTrigger,
                css: {cursor: 'pointer',
                    display: 'inline-block',
                    float: 'right',
                    paddingRight: '5px',
                    textShadow: '3px 3px 4px gray'}
            }).data('option', option);

            triggerButton.on('click', function () {
                var value;
                if (name == 'crypto'){value = window.prompt(i18n('ui.trigger.crypto.set', [option.label]), option.subTrigger);}
                else{value = window.prompt(i18n('ui.trigger.set', [option.label]), option.subTrigger);}

                if (value !== null) {
                    option.subTrigger = parseFloat(value);
                    kittenStorage.items[triggerButton.attr('id')] = option.subTrigger;
                    saveToKittenStorage();
                    triggerButton[0].title = option.subTrigger;
                }
            });

            element.append(triggerButton);
        }

        return element;
    };

    var getDistributeOption = function (name, option) {
        var iname = ucfirst(i18n('$village.job.' + name));

        var element = getOption(name, option, iname);
        element.css('borderBottom', '1px solid rgba(185, 185, 185, 0.7)');

        //Limited Distribution
        var label = $('<label/>', {
            'for': 'toggle-limited-' + name,
            text: i18n('ui.limit')
        });

        var input = $('<input/>', {
            id: 'toggle-limited-' + name,
            type: 'checkbox'
        }).data('option', option);

        if (option.limited) {
            input.prop('checked', true);
        }

        input.on('change', function () {
            if (input.is(':checked') && option.limited == false) {
                option.limited = true;
                imessage('distribute.limited', [iname]);
            } else if ((!input.is(':checked')) && option.limited == true) {
                option.limited = false;
                imessage('distribute.unlimited', [iname]);
            }
            kittenStorage.items[input.attr('id')] = option.limited;
            saveToKittenStorage();
        });

        element.append(input, label);

        var maxButton = $('<div/>', {
            id: 'set-' + name +'-max',
            text: i18n('ui.max', [option.max]),
            title: option.max,
            css: {cursor: 'pointer',
                display: 'inline-block',
                float: 'right',
                paddingRight: '5px',
                textShadow: '3px 3px 4px gray'}
        }).data('option', option);

        (function (iname){
            maxButton.on('click', function () {
                var value;
                value = window.prompt(i18n('ui.max.set', [iname]), option.max);

                if (value !== null) {
                    option.max = parseInt(value);
                    kittenStorage.items[maxButton.attr('id')] = option.max;
                    saveToKittenStorage();
                    maxButton[0].title = option.max;
                    maxButton[0].innerText = i18n('ui.max', [option.max]);
                }
            })
        })(iname);

        element.append(maxButton);

        return element;
    };

    // Grab button labels for religion options
    var religionManager = new ReligionManager();
    for (var buildOption in options.auto.faith.items) {
        var buildItem = options.auto.faith.items[buildOption];
        var build = religionManager.getBuild(buildItem.name || buildOption, buildItem.variant);
        if (build) {
            options.auto.faith.items[buildOption].label = build.label;
        }
    }

    // Grab button labels for time options
    var timeManager = new TimeManager();
    for (var buildOption in options.auto.time.items) {
        var buildItem = options.auto.time.items[buildOption];
        var build = timeManager.getBuild(buildItem.name || buildOption, buildItem.variant);
        if (build) {
            options.auto.time.items[buildOption].label = build.label;
        }
    }

    // Grab button labels for build options
    var buildManager = new BuildManager();
    for (var buildOption in options.auto.build.items) {
        var buildItem = options.auto.build.items[buildOption];
        var build = buildManager.getBuild(buildItem.name || buildOption);
        if (build) {
            if ("stage" in buildItem) {
                options.auto.build.items[buildOption].label = build.meta.stages[buildItem.stage].label;
            } else {
                options.auto.build.items[buildOption].label = build.meta.label;
            }
        }
    }

    // Grab button labels for space options
    var spaceManager = new SpaceManager();
    for (var spaceOption in options.auto.space.items) {
        var build = spaceManager.getBuild(spaceOption);
        if (build) {
            // It's changed to label in 1.3.0.0
            var title = build.title ? build.title : build.label;
            options.auto.space.items[spaceOption].label = title;
        }
    }

    var optionsElement = $('<div/>', {id: 'ks-options', css: {marginBottom: '10px'}});
    var optionsListElement = $('<ul/>');
    var optionsTitleElement = $('<div/>', {
        css: { bottomBorder: '1px solid gray', marginBottom: '5px' },
        text: kg_version
    });

    optionsElement.append(optionsTitleElement);

    optionsListElement.append(getToggle('engine'));
    optionsListElement.append(getToggle('build'));
    optionsListElement.append(getToggle('space'));
    optionsListElement.append(getToggle('craft'));
    optionsListElement.append(getToggle('upgrade'));
    optionsListElement.append(getToggle('trade'));
    optionsListElement.append(getToggle('faith'));
    optionsListElement.append(getToggle('time'));
    optionsListElement.append(getToggle('timeCtrl'));
    optionsListElement.append(getToggle('distribute'));
    optionsListElement.append(getToggle('options'));
    optionsListElement.append(getToggle('filter'));

    // add activity button
    // ===================

    var activitySummary = {};
    var resetActivitySummary = function () {
        activitySummary = {
            lastyear: game.calendar.year,
            lastday:  game.calendar.day,
            craft:    {},
            trade:    {},
            build:    {},
            other:    {}
        };
    };

    var storeForSummary = function (name, amount, section) {
        if (amount === undefined) amount = 1;
        if (section === undefined) section = 'other';

        if (activitySummary[section] === undefined)
            activitySummary[section] = {};

        if (activitySummary[section][name] === undefined) {
            activitySummary[section][name] = parseFloat(amount);
        } else {
            activitySummary[section][name] += parseFloat(amount);
        }
    };

    var displayActivitySummary = function () {

        for (var i in activitySummary.other) {
            if (activitySummary.other[i])
                isummary('summary.' + i , [game.getDisplayValueExt(activitySummary.other[i])]);
        }

        // Techs
        for (var name in activitySummary.research) {
            isummary('summary.tech', [ucfirst(name)]);
        }

        // Upgrades
        for (var name in activitySummary.upgrade) {
            isummary('summary.upgrade', [ucfirst(name)]);
        }

        // Buildings
        for (var name in activitySummary.build) {
            isummary('summary.building', [game.getDisplayValueExt(activitySummary.build[name]), ucfirst(name)]);
        }

        // Order of the Sun
        for (var name in activitySummary.faith) {
            isummary('summary.sun', [game.getDisplayValueExt(activitySummary.faith[name]), ucfirst(name)]);
        }

        // Crafts
        for (var name in activitySummary.craft) {
            isummary('summary.craft', [game.getDisplayValueExt(activitySummary.craft[name]), ucfirst(name)]);
        }

        // Trading
        for (var name in activitySummary.trade) {
            isummary('summary.trade', [game.getDisplayValueExt(activitySummary.trade[name]), ucfirst(name)]);
        }

        // Show time since last run. Assumes that the day and year are always higher.
        if (activitySummary.lastyear && activitySummary.lastday) {
            var years = game.calendar.year - activitySummary.lastyear;
            var days = game.calendar.day - activitySummary.lastday;

            if (days < 0) {
                years -= 1;
                days += 400;
            }

            var duration = '';
            if (years > 0) {
                duration += years + ' ';
                duration += (years == 1) ? i18n('summary.year') : i18n('summary.years');
            }

            if (days >= 0) {
                if (years > 0) duration += i18n('summary.separator');
                duration += roundToTwo(days) + ' ';
                duration += (days == 1) ? i18n('summary.day') : i18n('summary.days');
            }

            isummary('summary.head', [duration]);
        }

        // Clear out the old activity
        resetActivitySummary()
    };

    resetActivitySummary();

    var activityBox = $('<div/>', {
        id: 'activity-box',
        css: {
            display: 'inline-block',
            verticalAlign: 'top'
        }
    });

    var showActivity = $('<a/>', {
        id: 'showActivityHref',
        text: i18n('summary.show'),
        href: '#',
        css: {
            verticalAlign: 'top'
        }
    });

    showActivity.on('click', displayActivitySummary);

    activityBox.append(showActivity);

    $('#clearLog').append(activityBox);

    var messageBox = $('<div/>', {
        id: 'important-msg-box',
        class: 'dialog help',
        css: {
            display: 'none',
            width: 'auto',
            height: 'auto'
        }
    });
    var mbClose = $('<a/>', {text: i18n('ui.close'), href: '#', css: {position: 'absolute', top: '10px', right: '15px'}});
    mbClose.on('click', function () {messageBox.toggle(); });
    var mbTitle = $('<h1/>', {id: 'mb-title', text: 'test text'});
    var mbContent = $('<h1/>', {id: 'mb-content', text: 'test text'});
    messageBox.append(mbClose, mbTitle, mbContent);
    $('#gamePageContainer').append(messageBox);

    var showMessageBox = (title, content) => {
        mbTitle.html(title);
        mbContent.html(content);
        messageBox.toggle();
    }

    // Donation Button
    // ===============

    var donate = $('<li/>', {id: "ks-donate"}).append($('<a/>', {
        href: 'bitcoin:' + address + '?amount=0.00048&label=Kittens Donation',
        target: '_blank',
        text: address
    })).prepend($('<img/>', {
        css: {
            height: '15px',
            width: '15px',
            padding: '3px 4px 0 4px',
            verticalAlign: 'bottom'
        },
        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICB3aWR0aD0iNTEycHgiCiAgIGhlaWdodD0iNTEycHgiCiAgIHZpZXdCb3g9IjAgMCAxIDEiCiAgIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIgogICBpZD0ic3ZnMiIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC4yIHI5ODE5IgogICBzb2RpcG9kaTpkb2NuYW1lPSJiaXRjb2luLWxvZ28tbm9zaGFkb3cuc3ZnIj4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGEyMiI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNDQ3IgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijg2MSIKICAgICBpZD0ibmFtZWR2aWV3MjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjAuOTIxODc1IgogICAgIGlua3NjYXBlOmN4PSIyMTIuNTE0MzciCiAgICAgaW5rc2NhcGU6Y3k9IjIzMy4yNDYxNyIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzIiIC8+CiAgPCEtLSBBbmRyb2lkIGxhdW5jaGVyIGljb25zOiB2aWV3Qm94PSItMC4wNDUgLTAuMDQ1IDEuMDkgMS4wOSIgLS0+CiAgPGRlZnMKICAgICBpZD0iZGVmczQiPgogICAgPGZpbHRlcgogICAgICAgaWQ9Il9kcm9wLXNoYWRvdyIKICAgICAgIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CiAgICAgIDxmZUdhdXNzaWFuQmx1cgogICAgICAgICBpbj0iU291cmNlQWxwaGEiCiAgICAgICAgIHJlc3VsdD0iYmx1ci1vdXQiCiAgICAgICAgIHN0ZERldmlhdGlvbj0iMSIKICAgICAgICAgaWQ9ImZlR2F1c3NpYW5CbHVyNyIgLz4KICAgICAgPGZlQmxlbmQKICAgICAgICAgaW49IlNvdXJjZUdyYXBoaWMiCiAgICAgICAgIGluMj0iYmx1ci1vdXQiCiAgICAgICAgIG1vZGU9Im5vcm1hbCIKICAgICAgICAgaWQ9ImZlQmxlbmQ5IiAvPgogICAgPC9maWx0ZXI+CiAgICA8bGluZWFyR3JhZGllbnQKICAgICAgIGlkPSJjb2luLWdyYWRpZW50IgogICAgICAgeDE9IjAlIgogICAgICAgeTE9IjAlIgogICAgICAgeDI9IjAlIgogICAgICAgeTI9IjEwMCUiPgogICAgICA8c3RvcAogICAgICAgICBvZmZzZXQ9IjAlIgogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojZjlhYTRiIgogICAgICAgICBpZD0ic3RvcDEyIiAvPgogICAgICA8c3RvcAogICAgICAgICBvZmZzZXQ9IjEwMCUiCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiNmNzkzMWEiCiAgICAgICAgIGlkPSJzdG9wMTQiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZwogICAgIHRyYW5zZm9ybT0ic2NhbGUoMC4wMTU2MjUpIgogICAgIGlkPSJnMTYiPgogICAgPHBhdGgKICAgICAgIGlkPSJjb2luIgogICAgICAgZD0ibSA2My4wMzU5LDM5Ljc0MSBjIC00LjI3NCwxNy4xNDMgLTIxLjYzNywyNy41NzYgLTM4Ljc4MiwyMy4zMDEgLTE3LjEzOCwtNC4yNzQgLTI3LjU3MSwtMjEuNjM4IC0yMy4yOTUsLTM4Ljc4IDQuMjcyLC0xNy4xNDUgMjEuNjM1LC0yNy41NzkgMzguNzc1LC0yMy4zMDUgMTcuMTQ0LDQuMjc0IDI3LjU3NiwyMS42NCAyMy4zMDIsMzguNzg0IHoiCiAgICAgICBzdHlsZT0iZmlsbDp1cmwoI2NvaW4tZ3JhZGllbnQpIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJzeW1ib2wiCiAgICAgICBkPSJtIDQ2LjEwMDksMjcuNDQxIGMgMC42MzcsLTQuMjU4IC0yLjYwNSwtNi41NDcgLTcuMDM4LC04LjA3NCBsIDEuNDM4LC01Ljc2OCAtMy41MTEsLTAuODc1IC0xLjQsNS42MTYgYyAtMC45MjMsLTAuMjMgLTEuODcxLC0wLjQ0NyAtMi44MTMsLTAuNjYyIGwgMS40MSwtNS42NTMgLTMuNTA5LC0wLjg3NSAtMS40MzksNS43NjYgYyAtMC43NjQsLTAuMTc0IC0xLjUxNCwtMC4zNDYgLTIuMjQyLC0wLjUyNyBsIDAuMDA0LC0wLjAxOCAtNC44NDIsLTEuMjA5IC0wLjkzNCwzLjc1IGMgMCwwIDIuNjA1LDAuNTk3IDIuNTUsMC42MzQgMS40MjIsMC4zNTUgMS42NzksMS4yOTYgMS42MzYsMi4wNDIgbCAtMS42MzgsNi41NzEgYyAwLjA5OCwwLjAyNSAwLjIyNSwwLjA2MSAwLjM2NSwwLjExNyAtMC4xMTcsLTAuMDI5IC0wLjI0MiwtMC4wNjEgLTAuMzcxLC0wLjA5MiBsIC0yLjI5Niw5LjIwNSBjIC0wLjE3NCwwLjQzMiAtMC42MTUsMS4wOCAtMS42MDksMC44MzQgMC4wMzUsMC4wNTEgLTIuNTUyLC0wLjYzNyAtMi41NTIsLTAuNjM3IGwgLTEuNzQzLDQuMDE5IDQuNTY5LDEuMTM5IGMgMC44NSwwLjIxMyAxLjY4MywwLjQzNiAyLjUwMywwLjY0NiBsIC0xLjQ1Myw1LjgzNCAzLjUwNywwLjg3NSAxLjQzOSwtNS43NzIgYyAwLjk1OCwwLjI2IDEuODg4LDAuNSAyLjc5OCwwLjcyNiBsIC0xLjQzNCw1Ljc0NSAzLjUxMSwwLjg3NSAxLjQ1MywtNS44MjMgYyA1Ljk4NywxLjEzMyAxMC40ODksMC42NzYgMTIuMzg0LC00LjczOSAxLjUyNywtNC4zNiAtMC4wNzYsLTYuODc1IC0zLjIyNiwtOC41MTUgMi4yOTQsLTAuNTI5IDQuMDIyLC0yLjAzOCA0LjQ4MywtNS4xNTUgeiBtIC04LjAyMiwxMS4yNDkgYyAtMS4wODUsNC4zNiAtOC40MjYsMi4wMDMgLTEwLjgwNiwxLjQxMiBsIDEuOTI4LC03LjcyOSBjIDIuMzgsMC41OTQgMTAuMDEyLDEuNzcgOC44NzgsNi4zMTcgeiBtIDEuMDg2LC0xMS4zMTIgYyAtMC45OSwzLjk2NiAtNy4xLDEuOTUxIC05LjA4MiwxLjQ1NyBsIDEuNzQ4LC03LjAxIGMgMS45ODIsMC40OTQgOC4zNjUsMS40MTYgNy4zMzQsNS41NTMgeiIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgPC9nPgo8L3N2Zz4='
    }));

    // Add some padding above the donation item
    donate.css('padding', '5px');

    optionsListElement.append(donate);

    // add the options above the game log
    right.prepend(optionsElement.append(optionsListElement));

    // Initialize and set toggles for Engine
    // =====================================

    var engine = new Engine();
    var toggleEngine = $('#toggle-engine');

    toggleEngine.on('change', function () {
        if (toggleEngine.is(':checked')) {
            options.auto.engine.enabled = true;
            engine.start();
        } else {
            options.auto.engine.enabled = false;
            engine.stop();
        }
    });

    loadFromKittenStorage();

    // hack for style. 
    // If there are more UI options, split it to "updateUI"
    $('#toggle-style').trigger('change');

    if (console && console.log) console.log(kg_version + " loaded");
    game._publish("kitten_scientists/ready", kg_version);
    
    if (kittenStorage.reset && kittenStorage.reset.reset) {
        // calc paragon and karma
        kittenStorage.reset.karmaTotal += game.resPool.get('karma').value - Number(kittenStorage.reset.karmaLastTime);
        kittenStorage.reset.pargonTotal += game.resPool.get('paragon').value - Number(kittenStorage.reset.paragonLastTime);
        kittenStorage.reset.reset = false;

        // show messagebox
        showMessageBox(
            i18n('summary.time.reset.title', [kittenStorage.reset.times]),
            i18n('summary.time.reset.content', [kittenStorage.reset.karmaTotal, kittenStorage.reset.pargonTotal])
        );
        // auto start
        toggleEngine.prop('checked', true);
        toggleEngine.trigger('change');
        imessage('reset.after');
    } else {
        kittenStorage.reset = {
            reset: false,
            times: 0,
            paragonLastTime: 0,
            pargonTotal: 0,
            karmaLastTime: 0,
            karmaTotal: 0
        }
    }
    saveToKittenStorage();

}

var loadTest = function() {
    if (typeof gamePage === 'undefined') {
        // Test if kittens game is already loaded or wait 2s and try again
        setTimeout(function(){
            loadTest();
        }, 2000);
    } else {
        // Kittens loaded, run Kitten Scientist's Automation Engine
        game = gamePage;
        i18ng = $I;
        lang = localStorage['com.nuclearunicorn.kittengame.language'] ? localStorage['com.nuclearunicorn.kittengame.language'] : lang;
        run();
    }
}

loadTest();
