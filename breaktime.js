import { registerSettings } from "./settings.js";
import { BreakTimeApplication } from "./breaktimeapp.js";

export let debug = (...args) => {
    if (debugEnabled > 1) console.log("DEBUG: breaktime | ", ...args);
};
export let log = (...args) => console.log("breaktime | ", ...args);
export let warn = (...args) => {
    if (debugEnabled > 0) console.warn("breaktime | ", ...args);
};
export let error = (...args) => console.error("breaktime | ", ...args);
export let i18n = key => {
    return game.i18n.localize(key);
};

export let setting = key => {
    return game.settings.get("breaktime", key);
};

export class BreakTime {
    static app = null;

    static async init() {
        log("initializing");

        BreakTime.SOCKET = "module.breaktime";

        // init socket
        game.socket.on(BreakTime.SOCKET, BreakTime.onMessage);
        BreakTime.registerHotKeys();
    }

    static async setup() {
        registerSettings();
    }

    static async ready() {
        if (setting("paused")) {
            BreakTime.showApp(false);
        }
    }


    static emit(action, args = {}) {
        args.action = action;
        args.senderId = game.user.id;
        game.socket.emit(BreakTime.SOCKET, args, (resp) => { });
        BreakTime.onMessage(args);
    }

    static onMessage(data) {
        BreakTime[data.action].call(BreakTime, data);
    }

    static registerHotKeys() {
        game.keybindings.register('breaktime', 'breaktime-pause', {
            name: 'BREAKTIME.hotkey.pausekey',
            restricted: true,
            editable: [
                { key: 'Home', modifiers: [KeyboardManager.MODIFIER_KEYS?.SHIFT] },
                { key: 'Space', modifiers: [KeyboardManager.MODIFIER_KEYS?.SHIFT] }
            ],
            onDown: () => {
                if (game.user.isGM)
                    BreakTime.startBreak();
                return true;
            }
        });
    }

    static async startBreak() {
        if (setting("paused"))
            BreakTime.showApp();
        else {
            await game.settings.set("breaktime", "break", {});
            await game.settings.set("breaktime", "start", Date.now());
            await game.settings.set("breaktime", "paused", true);
            BreakTime.emit("showApp");

            let currentlyPlaying = ui.playlists._playingSounds.map(ps => ps.playing ? ps.uuid : null).filter(p => !!p);
            for (let playing of currentlyPlaying) {
                let sound = await fromUuid(playing);
                sound.update({ playing: false, pausedTime: sound.sound.currentTime });
            }
            await game.settings.set("breaktime", "currently-playing", currentlyPlaying);

            if (setting("break-playlist")) {
                const playlist = game.playlists.get(setting("break-playlist"));
                if (playlist) {
                    playlist.playAll();
                }
            }

            //BreakTime.showDialog();
            if (setting('auto-pause'))
                game.togglePause(true, true);
        }
    }

    static async endBreak() {
        if (setting('auto-pause') && game.paused)
            game.togglePause(false, true);
        await game.settings.set("breaktime", "paused", false);
        await game.settings.set("breaktime", "remaining", null);
        BreakTime.emit("closeApp");
        if (setting("break-playlist")) {
            const playlist = game.playlists.get(setting("break-playlist"));
            if (playlist) {
                playlist.stopAll();
            }
        }

        if (setting("currently-playing")) {
            for (let playing of setting("currently-playing")) {
                let sound = await fromUuid(playing);
                if (sound)
                    sound.parent?.playSound(sound);
            }
            await game.settings.set("breaktime", "currently-playing", null);
        }
    }

    static async showApp(playSound = true) {
        if (BreakTime.app == null) {
            if (setting("auto-start-time") && game.user.isGM) {
                let value = setting("break-time");
                let remaining = setting("remaining");
                if (remaining == null) {
                    remaining = new Date(Date.now() + (value * 60000));
                    await game.settings.set("breaktime", "remaining", remaining);
                }
            }

            BreakTime.app = new BreakTimeApplication().render(true);
        } else
            BreakTime.app.render(true);

        /*
        if (setting("slideshow") && game.modules.get("monks-enhanced-journal")?.active && !BreakTime.slideshow) {
            BreakTime.slideshow = game.MonksEnhancedJournal.startSlideshow(setting("slideshow"));
        }*/

        if (setting("break-sound") && playSound) {
            const audiofiles = await BreakTime.getBreakSounds("break-sound");

            if (audiofiles.length > 0) {
                const audiofile = audiofiles[Math.floor(Math.random() * audiofiles.length)];

                let volume = (setting('volume') / 100);
                foundry.audio.AudioHelper.play({ src: audiofile, volume: volume, loop: false }).then((soundfile) => {
                    BreakTime.sound = soundfile;
                    soundfile.addEventListener("end", () => {
                        delete BreakTime.sound;
                    });
                    soundfile.addEventListener("stop", () => {
                        delete BreakTime.sound;
                    });
                    soundfile.effectiveVolume = volume;
                    return soundfile;
                });
            }
        }

        BreakTime.endPlayed = false;

        if (!game.user.isGM)
            ui.players.render();
    }

    static async closeApp() {
        if (BreakTime.app != null && BreakTime.app.rendered) {
            BreakTime.app.close({ ignore: true }).then(() => {
                BreakTime.app = null;
            });
        } else
            BreakTime.app = null;

        if (BreakTime.sound && BreakTime.sound.stop) {
            BreakTime.sound.fade(0, { duration: 500 }).then(() => {
                BreakTime.sound.stop();
            });
        }

        BreakTime.endPlayed = false;

        /*
        if (setting("slideshow") && game.modules.get("monks-enhanced-journal")?.active && BreakTime.slideshow) {
            BreakTime.slideshow.stopSlideshow();
        }
        */

        if (!game.user.isGM)
            ui.players.render();
    }

    static async getBreakSounds(fileSetting) {
        const audiofile = setting(fileSetting);

        if (!audiofile.includes('*')) return [audiofile];
        if (BreakTime[fileSetting]) return BreakTime[fileSetting];
        let source = "data";
        let pattern = audiofile;
        const browseOptions = { wildcard: true };

        // Support S3 matching
        if (/\.s3\./.test(pattern)) {
            source = "s3";
            const { bucket, keyPrefix } = FilePicker.parseS3URL(pattern);
            if (bucket) {
                browseOptions.bucket = bucket;
                pattern = keyPrefix;
            }
        }

        // Retrieve wildcard content
        try {
            const content = await FilePicker.browse(source, pattern, browseOptions);
            BreakTime[fileSetting] = content.files;
        } catch (err) {
            BreakTime[fileSetting] = [];
            ui.notifications.error(err);
        }
        return BreakTime[fileSetting];
    }

    static async changeReturned(data) {
        if (game.user.isGM) {
            let userId = data.userId || data.senderId || game.user.id;
            let state = (data.state != undefined ? data.state : !setting("break")[userId]);
            let breakData = setting("break");
            breakData[userId] = state;
            await game.settings.set("breaktime", "break", breakData);
            if (state == "back") {
                let awayData = setting("away");
                if (awayData.includes(userId)) {
                    awayData.findSplice((id) => id == userId);
                    await game.settings.set("breaktime", "away", awayData);

                    BreakTime.emit("refreshToolbar", {userId: userId});
                    BreakTime.emit("refreshPlayerUI");
                }
            }
            
            BreakTime.emit("refresh");
        }
    }

    static notify(data = {}) {
        ui.notifications.warn(data.message);
    }

    static getRandomText(text) {
        let parts = text.split(";");
        let idx = Math.clamp(parseInt(Math.random() * parts.length), 0, parts.length - 1);
        return parts[idx];
    }

    static stepAway(message = "") {
        this.adjustStatus({ away: true, message: message });
    }

    static comeBack(message = "") {
        this.adjustStatus({ away: false, message: message });
    }

    static async adjustStatus(data = {}) {
        let userId = data.senderId || game.user.id;

        if (game.user.isGM) {
            let players = setting("away");

            if (players.includes(userId) && data.away === false)
                players.findSplice((id) => id == userId);
            else if (!players.includes(userId) && data.away === true)
                players.push(userId);

            await game.settings.set("breaktime", "away", players);
            BreakTime.emit("refreshPlayerUI");
            BreakTime.emit("refreshToolbar", { userId: game.user.id });
        }

        //send message declaring if you're back
        if (userId == game.user.id) {
            let message = data.message || (data.away ? BreakTime.getRandomText(i18n(setting("away-text"))) : BreakTime.getRandomText(i18n(setting("back-text"))));

            let context = {
                user: game.user
            };

            const compiled = Handlebars.compile(message);
            message = compiled(context, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }).trim();

            if (["both", "chat"].includes(setting("notify-option"))) {
                const speaker = setting("chat-bubble") ? { scene: canvas.scene.id, actor: game.user?.character?.id, alias: game.user?.name } : null;
                const messageData = {
                    content: message,
                    type: (setting("chat-bubble") ? CONST.CHAT_MESSAGE_STYLES.IC : CONST.CHAT_MESSAGE_STYLES.OOC),
                    speaker
                };
                ChatMessage.create(messageData, { chatBubble: setting("chat-bubble") });

                let tkn = canvas.scene.tokens.find(t => t.actor?.id == game.user?.character?.id);
                await canvas.hud.bubbles.say(tkn?._object, message);
            }
            if (["both", "toast"].includes(setting("notify-option"))) {
                BreakTime.emit("notify", { message: `${game.user.name} - ${message}`});
                //ui.notifications.warn(`${game.user.name} - ${message}`);
            }
        }
    }

    static refresh() {
        if (BreakTime.app && BreakTime.app.rendered)
            BreakTime.app.render();
        BreakTime.canPlayEnd = true;
        BreakTime.endPlayed = false;
    }

    static refreshPlayerUI() {
        ui.players.render();
    }

    static refreshToolbar(data) {
        if (game.user.id == data.userId) {
            let awayData = setting("away");
            let away = awayData.includes(game.user.id);
            let tool = ui.controls.controls["tokens"].tools["togglebreak"];
            tool.title = (away ? "BREAKTIME.button.return" : "BREAKTIME.button.title");
            if (tool) tool.active = away;
            ui.controls.render();
        }
    }
}

Hooks.once('init', BreakTime.init);
Hooks.once('setup', BreakTime.setup);
Hooks.once('ready', BreakTime.ready);

Hooks.on("getSceneControlButtons", (controls) => {
    let awayData = setting("away");
    let tokenControls = controls["tokens"];
    tokenControls.tools["togglebreak"] = {
        name: "togglebreak",
        title: (awayData.includes(game.user.id) ? "BREAKTIME.button.return" : "BREAKTIME.button.title"),
        icon: "fas fa-mug-hot",
        onClick: (away, event) => {
            BreakTime.emit("adjustStatus", { away: away });
        },
        toggle: true,
        active: setting("away").includes(game.user.id)
    };
});

Hooks.on('renderPlayers', async (playerList, html, data) => {
    //BreakTime.getPlayers();
    if (BreakTime.app && BreakTime.app.rendered) {
        BreakTime.app.render(true);
    }

    setting("away").forEach((userId) => {
        const styles = `flex:0 0 17px;width:17px;height:16px;border:0;margin-top: 3px;margin-right:-5px;`;
        const title = i18n("BREAKTIME.app.playerisaway")
        const i = `<i style="${styles}" class="fas fa-mug-hot" title="${title}"></i>`;
        $(html).find(`.player[data-user-id="${userId}"]`).addClass("player-away").append(i);
        //html.find(`[data-user-id="${userId}"] .player-name`).css({background:'transparent'});
    });

    if (setting('show-button') && (game.user.isGM || (!game.user.isGM && setting("paused"))) && $('.breaktime-button', html).length === 0) {
        $('<div>').addClass('breaktime-button')
            .append(`<div><i class="fas fa-coffee" style="margin-right: 4px;"></i> ${i18n("BREAKTIME.app.breaktime")}</div>`)
            .insertAfter($('#players-active .players-list', html))
            .click(game.user.isGM ? BreakTime.startBreak.bind() : BreakTime.showApp.bind(this, false));
    }
});

Hooks.on("chatCommandsReady", function (commands) {
    if (commands.register != undefined) {
        commands.register({
            name: "/brb",
            module: "breaktime",
            callback: (chatlog, parameters, messageData) => {
                BreakTime.emit("adjustStatus", { away: true, message: parameters });
                return true;
            },
            shouldDisplayToChat: false,
            icon: '<i class="fas fa-mug-hot"></i>',
            description: i18n("BREAKTIME.app.chataway")
        });

        commands.register({
            name: "/back",
            module: "breaktime",
            callback: (chatlog, parameters, chatdata) => {
                BreakTime.emit("adjustStatus", { away: false, message: parameters });
                return true;
            },
            shouldDisplayToChat: false,
            icon: '<i class="fas fa-mug-saucer"></i>',
            description: i18n("BREAKTIME.app.chatback")
        });
    } else {
        commands.registerCommand(commands.createCommandFromData({
            commandKey: "/brb",
            invokeOnCommand: (chatlog, messageText, chatdata) => {
                BreakTime.emit("adjustStatus", { away: true, message: messageText || setting("away-text") });
            },
            shouldDisplayToChat: false,
            iconClass: "fa-mug-hot",
            description: i18n("BREAKTIME.app.chataway")
        }));

        commands.registerCommand(commands.createCommandFromData({
            commandKey: "/back",
            invokeOnCommand: (chatlog, messageText, chatdata) => {
                BreakTime.emit("adjustStatus", { away: false, message: messageText || setting("back-text") });
            },
            shouldDisplayToChat: false,
            iconClass: "fa-mug-saucer",
            description: i18n("BREAKTIME.app.chatback")
        }));
    }
});

Hooks.on("globalInterfaceVolumeChanged", (volume) => {
    if (!game.modules.get("monks-sound-enhancements")?.active) {
        if (BreakTime.sound) {
            BreakTime.sound.volume = (BreakTime.sound.effectiveVolume ?? 1) * volume;
        }
        if (BreakTime.endSound) {
            BreakTime.endSound.volume = (BreakTime.endSound.effectiveVolume ?? 1) * volume;
        }
    }
});

Hooks.on("globalSoundEffectVolumeChanged", (volume) => {
    if (BreakTime.sound) {
        BreakTime.sound.volume = (BreakTime.sound.effectiveVolume ?? 1) * volume;
    }
    if (BreakTime.endSound) {
        BreakTime.endSound.volume = (BreakTime.endSound.effectiveVolume ?? 1) * volume;
    }
});

Hooks.on("renderSettingsConfig", (app, html, data) => {
    $("select[name='breaktime.break-playlist']", html).empty()
        .append('<option value="">-- None --</option>')
        .append(game.playlists.map((playlist) => {
        return `<option value="${playlist.id}">${playlist.name}</option>`;
        }).join("")).val(setting("break-playlist"));
});
