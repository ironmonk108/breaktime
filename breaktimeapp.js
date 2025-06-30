import { BreakTime, setting, i18n } from "./breaktime.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class BreakTimeApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "breaktime-app",
        tag: "form",
        window: {
            contentClasses: [],
            icon: "fas fa-coffee",
            resizable: false,
            title: "BREAKTIME.app.title",
        },
        actions: {
            clearRemaining: BreakTimeApplication.clearRemaining,
            setTime: BreakTimeApplication.setTime,
            leave: BreakTimeApplication.onChangePlayerState.bind(this, 'away', null),
            comeBack: BreakTimeApplication.onChangePlayerState.bind(this, 'back', null),
            clickAvatar: BreakTimeApplication._changePlayerState.bind(this, 'back'),
        },
        position: {
            width: 300,
            height: 'auto',
        }
    };

    static PARTS = {
        main: {
            root: true,
            template: "modules/breaktime/templates/breaktime.html",
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        let awayData = setting("away");
        let me = null;
        const players = game.users.contents.filter((el) => el.active).map((el) => {
            const player = {
                name: el.name,
                id: el.id,
                avatar: el.avatar,
                color: el.color,
                character: (el.isGM ? "GM" : el?.character?.name),
                self: el.isSelf,
                state: (setting('break')[el.id] || (awayData.includes(el.id) ? "away" : "")),
            };
            if (el.id == game.user.id) me = player;
            return player;
        });

        let done;
        let remaining = setting("remaining") ? this.getRemainingTime(done, true) : null;

        return foundry.utils.mergeObject(context, {
            players: players,
            my: me,
            gm: game.user.isGM,
            timestart: new Date(setting("start")).toLocaleTimeString('en-US', {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            }),
            remaining: remaining
        });
    }

    async _onFirstRender(context, options) {
        super._onFirstRender(context, options);

        if (setting("remaining")) {
            if (this.remainingTimer)
                window.clearInterval(this.remainingTimer);
            this.remainingTimer = window.setInterval(() => {
                let done;
                $('.remaining-timer', this.element).val(this.getRemainingTime(done));
                if (done) {
                    window.clearInterval(this.remainingTimer);
                }
            }, 1000);
        }
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        $(".breaktime-avatar", this.element).contextmenu(BreakTimeApplication._changePlayerState.bind(BreakTimeApplication, 'away'));
    }

    getRemainingTime(done) {
        let remaining = new Date(setting("remaining"));
        let diff = Math.ceil((remaining - Date.now()) / 1000);
        if (diff <= 0) {
            done = true;
            if (!BreakTime.endPlayed && BreakTime.canPlayEnd && setting("end-break-sound") && setting("remaining")) {
                BreakTime.endPlayed = true;
                BreakTime.getBreakSounds("end-break-sound").then((audiofiles) => {
                    if (audiofiles.length > 0) {
                        const audiofile = audiofiles[Math.floor(Math.random() * audiofiles.length)];

                        let volume = (setting('volume') / 100);
                        foundry.audio.AudioHelper.play({ src: audiofile, volume: volume, loop: false }).then((soundfile) => {
                            BreakTime.endsound = soundfile;
                            soundfile.addEventListener("end", () => {
                                delete BreakTime.endsound;
                            });
                            soundfile.addEventListener("stop", () => {
                                delete BreakTime.endsound;
                            });
                            soundfile.effectiveVolume = volume;
                            return soundfile;
                        });
                    }
                });
            }
            return "Break is over";
        } else {
            const switchover = 300;
            let min = diff > switchover ? Math.ceil(diff / 60) : Math.floor(diff / 60);
            let sec = (diff > switchover ? null : diff % 60)
            return `Returning in: ${min ? min : ""}${sec != null ? (min ? ":" : "") + String(sec).padStart(2, '0') + (min ? " min" : " sec") : " min"}`;
        }
    }

    static _changePlayerState(state, event) {
        let playerId = event.target.closest('.breaktime-player').dataset.userId;
        if (game.user.isGM || playerId == game.user.id) {
            this.onChangePlayerState(state, playerId);
        }
    }

    static onChangePlayerState(state, playerId) {
        BreakTime.emit("changeReturned", { userId: playerId || game.user.id, state: state });
    }

    static setTime() {
        foundry.applications.api.DialogV2.confirm({
            window: {
                title: i18n("BREAKTIME.app.SetRemaining")
            },
            content: `<p class="notes">${i18n("BREAKTIME.app.SetRemainingMessage")}</p><input type="text" style="float:right; margin-bottom: 10px;text-align: right;width: 150px;" value="${setting("break-time")}"/> `,
            yes: {
                callback: async (event) => {
                    let value = parseInt($('input', event.currentTarget).val());
                    if (isNaN(value) || value == 0)
                        await game.settings.set("breaktime", "remaining", null);
                    else {
                        let remaining = new Date(Date.now() + (value * 60000));
                        await game.settings.set("breaktime", "remaining", remaining);
                    }
                    BreakTime.emit("refresh");
                }
            }
        });
    }

    static async clearRemaining() {
        await game.settings.set("breaktime", "remaining", 0);
        BreakTime.emit("refresh");
    }

    async close(options = {}) {
        super.close(options);
        if (game.user.isGM)
            BreakTime.endBreak();
        else {
            if (options.ignore !== true) BreakTime.emit("changeReturned", { state: "back" });

            if (BreakTime.sound && BreakTime.sound.stop) {
                BreakTime.sound.fade(0, { duration: 500 }).then(() => {
                    BreakTime.sound.stop();
                });
            }
        }
        BreakTime.app = null;
    }
}